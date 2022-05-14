import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PasswordValidator } from 'src/utils/patternValidator';

export class CreateUserDto {
  /* Informations */
    @Transform(({ value }) => value.trim())
    @IsEmail()
    readonly email: string;

    @IsOptional()
    @IsString()
    readonly pic: string;

    /* Security */
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    @IsString()
    @PasswordValidator()
    readonly password: string;

    @IsOptional()
    @IsBoolean()
    readonly accountDeactivated: boolean;
}
