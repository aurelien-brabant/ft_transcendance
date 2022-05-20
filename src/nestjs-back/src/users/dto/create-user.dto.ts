import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PasswordValidator } from 'src/utils/patternValidator';

export class CreateUserDto {
    @Transform(({ value }) => value.trim().toLowerCase())
    @IsEmail()
    readonly email: string;

    @IsOptional()
    @IsString()
    readonly pic: string;

    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    @IsString()
    @PasswordValidator()
    readonly password: string;
}
