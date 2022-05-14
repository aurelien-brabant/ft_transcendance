import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsBoolean,
  IsDecimal,
  IsOptional,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsInt,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { Achievement } from 'src/achievements/entities/achievements.entity';
import { Channel } from 'src/chat/channels/entities/channels.entity';
import { ChannelPunishment } from "src/chat/channels/entities/punishment.entity";
import { DirectMessage } from 'src/chat/direct-messages/entities/direct-messages';
import { Game } from 'src/games/entities/games.entity';
import { User } from '../entities/users.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    /* Informations */
    @IsOptional()
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    @IsString()
    @Matches(/^[^0-9][a-zA-Z0-9_]+$/, {
      message:
        'The username must not start with a number and contain alphanumeric characters and underscores only.',
    })
    @MaxLength(30)
    @MinLength(2)
    readonly username: string;

    @IsOptional()
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    @IsString()
    readonly duoquadra_login: string;

    /* Security */
    @IsOptional()
    @IsBoolean()
    readonly tfa: boolean;

    @IsOptional()
    @IsString()
    readonly tfaSecret: string;

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

    @IsOptional()
    @IsDecimal()
    readonly ratio: number;

    @IsOptional()
    @IsArray()
    @Type(() => Achievement)
    readonly achievements: Achievement[];

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

    @IsOptional()
    @IsArray()
    @Type(() => ChannelPunishment)
    receivedChannelPunishments: ChannelPunishment[];

    @IsOptional()
    @IsArray()
    @Type(() => ChannelPunishment)
    givenChannelPunishments: ChannelPunishment[];
}
