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
import axios from 'axios';
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
    try {
      await axios.post(
        'https://api.mailry.co/ext/inbox/send',
        {
          emailId: process.env.MAILRY_SENDER_ID,
          to: user.email,
          subject: 'Registrasi Berhasil',
          htmlBody: `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border:1px solid #f2f2f2; border-radius: 8px; padding: 32px 28px 24px 28px; background: #fff;">
    <h2 style="color: #0099ff; margin-top: 0;">🎉 Selamat Datang, ${user.name}!</h2>
    <p style="font-size: 15px; color: #222;">Akun kamu di <b>Garuda Apps</b> sudah berhasil dibuat.</p>
    <p style="font-size: 15px; color: #222;">
      Silakan login untuk mulai menggunakan semua fitur kami. Jika kamu tidak merasa membuat akun ini, abaikan saja email ini.
    </p>
    <div style="margin: 24px 0;">
      <a href="" style="background:#0099ff;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;">Login Sekarang</a>
    </div>
    <p style="font-size:13px;color:#888;margin-bottom:0;">Salam hangat,<br/>Tim Garuda Apps</p>
  </div>
`,
          plainBody: `Selamat datang, ${user.name}! Akun kamu sudah aktif.`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.MAILRY_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (err) {
      // Logging aja, response tetap success, user tetap ke-register
      console.error('Gagal kirim email konfirmasi:', err?.message);
    }

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
