import { IsString, IsEmail, IsOptional, IsInt, IsPhoneNumber } from 'class-validator';
import { Games } from 'src/games/entities/games.entity';
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
    @IsPhoneNumber()
    readonly phone: string;
    
    @IsOptional()
    @IsString()
    readonly pic: string;
    
    @IsOptional()
    @IsString()
    readonly duoquadra_login: string;
}
