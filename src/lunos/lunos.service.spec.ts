import { Test, TestingModule } from '@nestjs/testing';
import { LunosService } from './lunos.service';

describe('LunosService', () => {
  let service: LunosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LunosService],
    }).compile();

    service = module.get<LunosService>(LunosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
