import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesInvite } from './entities/gamesInvites.entity';
import { GamesInvitesController } from './gamesInvites.controller';
import { GamesInvitesService } from './gamesInvites.service';

@Module({
    imports: [TypeOrmModule.forFeature([GamesInvite])], 
    controllers: [GamesInvitesController], 
    providers: [GamesInvitesService] })
export class GamesInvitesModule {}
