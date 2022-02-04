import { Test, TestingModule } from '@nestjs/testing';
import { FriendsInvitesService } from './friendsInvites.service';

describe('UseFriendInvitesService', () => {
  let service: FriendsInvitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FriendsInvitesService],
    }).compile();

    service = module.get<FriendsInvitesService>(FriendsInvitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
