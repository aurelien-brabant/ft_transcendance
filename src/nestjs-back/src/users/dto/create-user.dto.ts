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
    readonly games: Game[];

    @IsOptional()
    @IsInt()
    readonly wins: number;

    @IsOptional()
    @IsInt()
    readonly losses: number;

    @IsOptional()
    readonly friends: User[];

    @IsOptional()
    readonly ownedChannels: Channel[];

    @IsOptional()
    readonly joinedChannels: Channel[];

    @IsOptional()
    @IsBoolean()
    readonly accountDeactivated: boolean;
}
