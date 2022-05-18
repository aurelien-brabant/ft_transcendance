import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { User } from '../entities/users.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    /* Informations */
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
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    @IsString()
    readonly duoquadra_login: string;

    /* Security */
    @IsOptional()
    @IsBoolean()
    readonly tfa: boolean;

    @IsOptional()
    @IsString()
    readonly tfaSecret: string;

    @IsOptional()
    @IsBoolean()
    readonly accountDeactivated: boolean;

    /* Relationships */
    @IsOptional()
    @IsArray()
    @Type(() => User)
    readonly pendingFriendsSent: User[];

    @IsOptional()
    @IsArray()
    @Type(() => User)
    readonly blockedUsers: User[];
}
