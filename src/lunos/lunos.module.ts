import { Module } from '@nestjs/common';
import { LunosService } from './lunos.service';
import { LunosController } from './lunos.controller';

@Module({
  controllers: [LunosController],
  providers: [LunosService],
})
export class LunosModule {}
