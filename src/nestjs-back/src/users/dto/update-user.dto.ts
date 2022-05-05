import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsDecimal,
  IsOptional,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Achievement } from 'src/achievements/entities/achievements.entity';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    @IsString()
    @Matches(/^[^0-9][a-zA-Z0-9_]+$/, {
      message:
        'The username must not start with a number and contain alphanumeric characters and underscores only.',
    })
    @MaxLength(30)
    @MinLength(2)
    readonly username: string;

    @IsOptional()
    @IsPhoneNumber()
    readonly phone: string;

    @IsOptional()
    @IsBoolean()
    readonly tfa: boolean;

    @IsOptional()
    @IsString()
    readonly tfaSecret: string;

    @IsOptional()
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    @IsString()
    readonly duoquadra_login: string;

    @IsOptional()
    @IsDecimal()
    readonly ratio: number;

    @IsOptional()
    readonly achievements: Achievement[];
}
