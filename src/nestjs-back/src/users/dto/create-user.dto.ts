import { IsString, IsEmail, IsOptional, IsInt, IsPhoneNumber } from 'class-validator';
import { Games } from 'src/games/entities/games.entity';
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
    readonly games: Games [];
    
    @IsOptional()
    //    @IsInt({ each: true })
    //    readonly friends: number [];
    readonly friends: Users [];
}
