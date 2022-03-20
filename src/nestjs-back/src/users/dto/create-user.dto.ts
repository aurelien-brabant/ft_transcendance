import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString
} from 'class-validator';
import { Channel } from 'src/chat/channels/entities/channels.entity';
import { Game } from 'src/games/entities/games.entity';
import { User } from '../entities/users.entity';

export class CreateUserDto {
    @IsOptional()
    @IsString()
    readonly password: string;

    @IsEmail()
    readonly email: string;

    @IsOptional()
    @IsString()
    readonly pic: string;

    @IsOptional()
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

    @IsOptional()
    readonly friends: User[];

    @IsOptional()
    readonly pendingFriendsSent: User[];

    @IsOptional()
    readonly pendingFriendsReceived: User[];

    @IsOptional()
    readonly blockedUsers: User[];

    @IsOptional()
    readonly ownedChannels: Channel[];

    @IsOptional()
    readonly joinedChannels: Channel[];

    @IsOptional()
    @IsBoolean()
    readonly accountDeactivated: boolean;
}
