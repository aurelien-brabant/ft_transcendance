import { Test, TestingModule } from '@nestjs/testing';
import { DmMessagesService } from './dm-messages.service';

describe('DmMessagesService', () => {
  let service: DmMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DmMessagesService],
    }).compile();

    service = module.get<DmMessagesService>(DmMessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
