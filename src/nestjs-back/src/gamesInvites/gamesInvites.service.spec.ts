import { Test, TestingModule } from '@nestjs/testing';
import { GamesInvitesService } from './gamesInvites.service';

describe('UseGameInvitesService', () => {
  let service: GamesInvitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamesInvitesService],
    }).compile();

    service = module.get<GamesInvitesService>(GamesInvitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
