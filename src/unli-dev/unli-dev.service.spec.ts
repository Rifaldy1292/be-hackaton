import { Test, TestingModule } from '@nestjs/testing';
import { UnliService } from './unli-dev.service';

describe('UnliDevService', () => {
  let service: UnliService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnliService],
    }).compile();

    service = module.get<UnliService>(UnliService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
