import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsInt, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { Games } from 'src/games/entities/games.entity';
import { Users } from '../entities/users.entity';
import { Friends } from 'src/friends/entities/friends.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    @IsString()
    readonly username: string;

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

    @IsOptional()
//    @IsInt({ each: true })
  //  readonly games: number[];
    readonly games: Games [];

    @IsOptional()
//    @IsInt({ each: true })
//    readonly friends: number [];
    readonly friends: Users [];

 //   @IsOptional()
//    @IsInt({ each: true })
   // readonly winner: Games [];
}