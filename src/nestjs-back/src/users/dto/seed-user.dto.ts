import { IsString, IsEmail, IsOptional, IsInt, IsPhoneNumber } from 'class-validator';
import { Channels } from 'src/channels/entities/channels.entity';
import { Games } from 'src/games/entities/games.entity';
import { Messages } from 'src/messages/entities/messages.entity';
import { Users } from '../entities/users.entity';

export class SeedUserDto {
    @IsOptional()
    @IsString()
    readonly password: string;

    @IsOptional()
    @IsString()
    readonly username: string;

    @IsEmail()
    readonly email: string;

    @IsOptional()
    readonly games: Games [];
    
    @IsOptional()
    readonly friends: Users [];

    @IsOptional()
    @IsInt()
    readonly rank: number;

    @IsOptional()
    @IsInt()
    readonly win: number;

    @IsOptional()
    @IsInt()
    readonly loose: number;

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
    readonly ownedChannels: Channels[];

    @IsOptional()
    readonly joinedChannels: Channels[];

    @IsOptional()
    readonly sentMessages: Messages[];
}
