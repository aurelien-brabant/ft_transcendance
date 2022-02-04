import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesInvites } from './entities/gamesInvites.entity';
import { GamesInvitesController } from './gamesInvites.controller';
import { GamesInvitesService } from './gamesInvites.service';

@Module({
    imports: [TypeOrmModule.forFeature([GamesInvites])], 
    controllers: [GamesInvitesController], 
    providers: [GamesInvitesService] })
export class GamesInvitesModule {}
