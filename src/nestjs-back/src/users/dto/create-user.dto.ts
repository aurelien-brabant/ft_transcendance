import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString
} from 'class-validator';
import { Channel } from 'src/channels/entities/channels.entity';
import { Game } from 'src/games/entities/games.entity';
import { Message } from 'src/messages/entities/messages.entity';
import { User } from '../entities/users.entity';

export class CreateUserDto {
    @IsOptional()
    @IsString()
    readonly password: string;

    @IsEmail()
    readonly email: string;

    @IsOptional()
    //    @IsInt({ each: true })
      //  readonly games: number[];
    readonly games: Game[];

    @IsOptional()
    readonly wins: Game[];

    @IsOptional()
    @IsInt()
    readonly losses: number;

    @IsOptional()
    //    @IsInt({ each: true })
    //    readonly friends: number[];
    readonly friends: User[];

    @IsOptional()
    readonly ownedChannels: Channel[];

    @IsOptional()
    readonly joinedChannels: Channel[];

    @IsOptional()
    readonly sentMessages: Message[];
}
