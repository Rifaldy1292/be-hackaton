import { Module } from '@nestjs/common';
import { UnliService } from './unli-dev.service';
import { UnliDevController } from './unli-dev.controller';

@Module({
  controllers: [UnliDevController],
  providers: [UnliService],
})
export class UnliDevModule {}
