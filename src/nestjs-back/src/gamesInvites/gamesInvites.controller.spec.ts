import { Test, TestingModule } from '@nestjs/testing';
import { GamesInvitesController } from './gamesInvites.controller';

describe('GamesInvitesController', () => {
  let controller: GamesInvitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesInvitesController],
    }).compile();

    controller = module.get<GamesInvitesController>(GamesInvitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
