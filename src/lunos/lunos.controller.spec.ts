import { Test, TestingModule } from '@nestjs/testing';
import { LunosController } from './lunos.controller';
import { LunosService } from './lunos.service';

describe('LunosController', () => {
  let controller: LunosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LunosController],
      providers: [LunosService],
    }).compile();

    controller = module.get<LunosController>(LunosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
