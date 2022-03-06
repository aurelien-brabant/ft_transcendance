import {
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength
} from 'class-validator';
import { Message } from 'src/messages/entities/messages.entity';
import { User } from 'src/users/entities/users.entity';

export class CreateChannelDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @MinLength(2)
    readonly name: string;

    @IsNotEmpty()
    readonly owner: User;

    @IsString()
    @IsIn(["public", "private", "protected"])
    readonly visibility: string

    @IsOptional()
    @IsString()
    @MaxLength(50)
    @MinLength(8)
    readonly password?: string;

    readonly users: User[];

    @IsOptional()
    readonly messages: Message[];
}
