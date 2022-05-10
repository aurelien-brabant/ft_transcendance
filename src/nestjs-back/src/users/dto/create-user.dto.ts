import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString
} from 'class-validator';
import { Type } from 'class-transformer';
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
}
