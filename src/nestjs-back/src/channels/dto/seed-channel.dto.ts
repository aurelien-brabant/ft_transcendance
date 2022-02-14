import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
    MaxLength
} from 'class-validator';
import { Messages } from 'src/messages/entities/messages.entity';
import { Users } from 'src/users/entities/users.entity';

export class SeedChannelDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    readonly name: string;

    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    readonly owner: number;

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
    // @ArrayContains(owner)
    readonly users: Users[];

    @IsOptional()
    readonly messages: Messages[];
}
