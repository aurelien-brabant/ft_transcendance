import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsInvites } from './entities/friendsInvites.entity';
import { FriendsInvitesController } from './friendsInvites.controller';
import { FriendsInvitesService } from './friendsInvites.service';

@Module({
    imports: [TypeOrmModule.forFeature([FriendsInvites])], 
    controllers: [FriendsInvitesController], 
    providers: [FriendsInvitesService] })
export class FriendsInvitesModule {}
