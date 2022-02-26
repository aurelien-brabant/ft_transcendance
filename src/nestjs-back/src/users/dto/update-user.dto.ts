import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsInt, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { Channels } from 'src/channels/entities/channels.entity';
import { Games } from 'src/games/entities/games.entity';
import { Messages } from 'src/messages/entities/messages.entity';
import { Users } from '../entities/users.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    @IsString()
    readonly username: string;

    @IsOptional()
    @IsPhoneNumber()
    readonly phone: string;

    @IsOptional()
    @IsString()
    readonly pic: string;

    @IsOptional()
    @IsString()
    readonly duoquadra_login: string;

    @IsOptional()
    @IsInt()
    readonly rank: number;

    @IsOptional()
//    @IsInt({ each: true })
  //  readonly games: number[];
    readonly games: Games [];

    @IsOptional()
    readonly wins: Games[];

    @IsOptional()
    @IsInt()
    readonly losses: number;

    @IsOptional()
    readonly friends: Users[];

    @IsOptional()
    readonly ownedChannels: Channels[];

    @IsOptional()
    readonly joinedChannels: Channels[];

    @IsOptional()
    readonly sentMessages: Messages[];
}
