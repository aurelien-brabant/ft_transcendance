import { PartialType } from '@nestjs/mapped-types';
import {
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength
} from 'class-validator';
import { CreateChannelDto } from './create-channel.dto';
import { Messages } from 'src/messages/entities/messages.entity';
import { Users } from 'src/users/entities/users.entity';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    readonly name: string;

    @IsNotEmpty()
    readonly owner: Users;

    @IsString()
    readonly visibility: string

    @IsString()
    @MinLength(8)
    @MaxLength(50)
    readonly password: string;

    readonly users: Users[];

    readonly messages: Messages[];
}
