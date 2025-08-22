import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from './auth.constants';
interface JwtPayload {
  sub: number;
  email?: string;

  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private async signAccess(user: { id: number; email: string }) {
    return this.jwt.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: process.env.ACCESS_TOKEN_TTL || '1d',
      },
    );
  }

  private async signRefresh(user: { id: number }) {
    return this.jwt.signAsync(
      { sub: user.id },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: process.env.REFRESH_TOKEN_TTL || '7d',
      },
    );
  }

  private setTokens(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(ACCESS_COOKIE, accessToken, accessCookieOptions);
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  }

  private clearTokens(res: Response) {
    res.clearCookie(ACCESS_COOKIE, { ...accessCookieOptions, maxAge: 0 });
    res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions, maxAge: 0 });
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.users.findFirst({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.signAccess({
      id: user.id,
      email: user.email,
    });
    const refreshToken = await this.signRefresh({ id: user.id });

    this.setTokens(res, accessToken, refreshToken);
    return { id: user.id, email: user.email, name: user.name };
  }

  async refresh(req: Request, res: Response) {
    const rt = req.cookies?.[REFRESH_COOKIE];
    if (!rt) throw new UnauthorizedException('Missing refresh token');

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync(rt, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
    } catch {
      this.clearTokens(res);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.users.findFirst({
      where: { id: payload.sub },
    });
    if (!user) {
      this.clearTokens(res);
      throw new UnauthorizedException('User not found');
    }

    const newAccess = await this.signAccess({
      id: user.id,
      email: user.email,
    });

    this.setTokens(res, newAccess, rt);

    return { ok: true };
  }

  async logout(res: Response) {
    this.clearTokens(res);
    return { ok: true };
  }

  async me(userId: number) {
    const user = await this.prisma.users.findFirst({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    return user;
  }
  async register(dto: RegisterDto) {
    const existing = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        name: dto.name,
        email: dto.email,
        password_hash: hashedPassword,
      },
    });

    return {
      message: 'Register successful',
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        name: user.name,
      },
    };
  }
}
