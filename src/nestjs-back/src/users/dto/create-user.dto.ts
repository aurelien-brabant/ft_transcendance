import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString
} from 'class-validator';
import { Channels } from 'src/channels/entities/channels.entity';
import { Games } from 'src/games/entities/games.entity';
import { Messages } from 'src/messages/entities/messages.entity';
import { Users } from '../entities/users.entity';

export class CreateUserDto {
    @IsOptional()
    @IsString()
    readonly password: string;

    @IsEmail()
    readonly email: string;

    @IsOptional()
    //    @IsInt({ each: true })
      //  readonly games: number[];
    readonly games: Games[];

    @IsOptional()
    readonly wins: Games[];

    @IsOptional()
    @IsInt()
    readonly losses: number;

    @IsOptional()
    //    @IsInt({ each: true })
    //    readonly friends: number [];
    readonly friends: Users[];

    @IsOptional()
    readonly ownedChannels: Channels[];

    @IsOptional()
    readonly joinedChannels: Channels[];

    @IsOptional()
    readonly sentMessages: Messages[];
}
