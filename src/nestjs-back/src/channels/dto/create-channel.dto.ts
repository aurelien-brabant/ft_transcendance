import {
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength
} from 'class-validator';
import { Messages } from 'src/messages/entities/messages.entity';
import { Users } from 'src/users/entities/users.entity';

export class CreateChannelDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @MinLength(2)
    readonly name: string;

    @IsNotEmpty()
    readonly owner: Users;

    @IsString()
    @IsIn(["public", "private", "protected"])
    readonly visibility: string

    @IsOptional()
    @IsString()
    @MaxLength(50)
    @MinLength(8)
    readonly password: string;

    readonly users: Users[];

    @IsOptional()
    readonly messages: Messages[];
}
