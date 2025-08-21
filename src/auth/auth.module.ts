import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';

@Module({
  imports: [
    JwtModule.register({}), // kita supply secret/ttl saat sign/verify langsung
  ],

  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtAccessStrategy],
})
export class AuthModule {}
