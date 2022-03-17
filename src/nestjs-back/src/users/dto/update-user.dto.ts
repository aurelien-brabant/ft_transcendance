import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsDecimal,
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
    @IsBoolean()
    readonly tfa: boolean;

    @IsOptional()
    @IsString()
    readonly duoquadra_login: string;

    @IsOptional()
    @IsDecimal()
    readonly ratio: number;
    
    @IsOptional()
    @IsString()
    readonly tfaSecret: string;

    @IsOptional()
    readonly blockedUsers: User[];
}
