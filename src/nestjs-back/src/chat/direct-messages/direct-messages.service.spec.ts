import { Test, TestingModule } from '@nestjs/testing';
import { DirectMessagesService } from './direct-messages.service';

describe('DirectMessagesService', () => {
  let service: DirectMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DirectMessagesService],
    }).compile();

    service = module.get<DirectMessagesService>(DirectMessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
