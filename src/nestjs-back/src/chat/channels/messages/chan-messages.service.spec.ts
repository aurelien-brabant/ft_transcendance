import { Test, TestingModule } from '@nestjs/testing';
import { ChanMessagesService } from './chan-messages.service';

describe('ChanMessagesService', () => {
  let service: ChanMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChanMessagesService],
    }).compile();

    service = module.get<ChanMessagesService>(ChanMessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
