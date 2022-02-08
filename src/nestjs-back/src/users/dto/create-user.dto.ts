import { IsBoolean, IsInt, IsString, IsEmail, IsPhoneNumber, IsOptional } from 'class-validator';
//import { Games } from 'src/games/entities/games.entity';
//import { Users } from '../entities/users.entity';

export class CreateUserDto {
    @IsOptional()
    @IsString()
    readonly username: string;

    @IsOptional()
    @IsString()
    readonly password: string;

    @IsEmail()
    readonly email: string;

    @IsBoolean()
    readonly is_duoquadra: string;

    @IsOptional()
    @IsPhoneNumber()
    readonly phone: string;

    @IsOptional()
    @IsString()
    readonly pic: string;

//    @IsInt({ each: true })
  //  readonly games: number[];
    //readonly games: Games [];
/*
    @IsOptional()
    @IsInt({ each: true })
    readonly friends: number [];
    //readonly friends: Users [];
*/}
