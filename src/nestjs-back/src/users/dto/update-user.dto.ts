import { PartialType } from '@nestjs/mapped-types';
import {
  IsDecimal,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString
} from 'class-validator';
import { User } from '../entities/users.entity';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    @IsString()
    readonly username: string;

    @IsOptional()
    @IsPhoneNumber()
    readonly phone: string;

    @IsOptional()
    @IsString()
    readonly tfa: string;

    @IsOptional()
    @IsString()
    readonly pic: string;

    @IsOptional()
    @IsString()
    readonly duoquadra_login: string;

    @IsOptional()
    @IsDecimal()
    readonly ratio: number; 

    @IsOptional()
    readonly blockedUsers: User[];
}
