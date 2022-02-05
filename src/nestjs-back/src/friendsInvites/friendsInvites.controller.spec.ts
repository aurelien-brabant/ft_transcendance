import { Test, TestingModule } from '@nestjs/testing';
import { FriendsInvitesController } from './friendsInvites.controller';

describe('FriendsInvitesController', () => {
  let controller: FriendsInvitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendsInvitesController],
    }).compile();

    controller = module.get<FriendsInvitesController>(FriendsInvitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
