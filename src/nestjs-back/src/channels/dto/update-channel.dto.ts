import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
    MaxLength
} from 'class-validator';
import { Messages } from 'src/messages/entities/messages.entity';
import { Users } from 'src/users/entities/users.entity';

export class UpdateChannelDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    readonly name: string;

    @IsOptional()
    @IsNotEmpty()
    readonly owner: Users;

    @IsOptional()
    @IsBoolean()
    readonly isPublic: boolean;

    @IsOptional()
    @IsBoolean()
    readonly isProtected: boolean;

    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(50)
    readonly password: string;

    @IsOptional()
    readonly users: Users[];

    @IsOptional()
    readonly messages: Messages[];
}