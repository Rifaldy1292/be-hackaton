import { Controller, Post, Body } from '@nestjs/common';
import { LunosService } from './lunos.service';
import { CreateLunosDto } from './dto/create-luno.dto';

@Controller('lunos')
export class LunosController {
  constructor(private readonly lunosService: LunosService) {}

  @Post('analyze')
  analyze(@Body() dto: CreateLunosDto) {
    return this.lunosService.analyzeText(dto.prompt);
  }
}
