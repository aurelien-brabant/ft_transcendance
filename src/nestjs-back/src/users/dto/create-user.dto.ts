import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString
} from 'class-validator';
import { Type } from 'class-transformer';
import { Channel } from 'src/chat/channels/entities/channels.entity';
import { DirectMessage } from 'src/chat/direct-messages/entities/direct-messages';
import { Game } from 'src/games/entities/games.entity';
import { User } from '../entities/users.entity';

export class CreateUserDto {
  /* Informations */
    @IsEmail()
    readonly email: string;

    @IsOptional()
    @IsString()
    readonly pic: string;

    /* Security */
    @IsOptional()
    @IsString()
    readonly password: string;

    @IsOptional()
    @IsBoolean()
    readonly accountDeactivated: boolean;

    /* Games */
    @IsOptional()
    @IsArray()
    readonly games: Game[];

    @IsOptional()
    @IsInt()
    readonly wins: number;

    @IsOptional()
    @IsInt()
    readonly losses: number;

    @IsOptional()
    @IsInt()
    readonly draws: number;

    /* Relationships */
    @IsOptional()
    @IsArray()
    @Type(() => User)
    readonly friends: User[];

    @IsOptional()
    @IsArray()
    @Type(() => User)
    readonly pendingFriendsSent: User[];

    @IsOptional()
    @IsArray()
    @Type(() => User)
    readonly pendingFriendsReceived: User[];

    @IsOptional()
    @IsArray()
    @Type(() => User)
    readonly blockedUsers: User[];

    /* Chat */
    @IsOptional()
    @IsArray()
    @Type(() => Channel)
    readonly ownedChannels: Channel[];

    @IsOptional()
    @IsArray()
    @Type(() => Channel)
    readonly joinedChannels: Channel[];

    @IsOptional()
    @IsArray()
    @Type(() => DirectMessage)
    readonly directMessages: DirectMessage[];
}
