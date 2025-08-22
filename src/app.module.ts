import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { LunosModule } from './lunos/lunos.module';
import { UnliDevModule } from './unli-dev/unli-dev.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    LunosModule,
    UnliDevModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
