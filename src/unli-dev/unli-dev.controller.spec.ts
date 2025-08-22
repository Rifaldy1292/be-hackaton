import { Test, TestingModule } from '@nestjs/testing';
import { UnliDevController } from './unli-dev.controller';
import { UnliDevService } from './unli-dev.service';

describe('UnliDevController', () => {
  let controller: UnliDevController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnliDevController],
      providers: [UnliDevService],
    }).compile();

    controller = module.get<UnliDevController>(UnliDevController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
