import { Test, TestingModule } from '@nestjs/testing';
import { DirectMessagesController } from './direct-messages.controller';

describe('DirectMessagesController', () => {
  let controller: DirectMessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DirectMessagesController],
    }).compile();

    controller = module.get<DirectMessagesController>(DirectMessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
