import { PartialType } from '@nestjs/mapped-types';
import {
    IsDate,
    IsNotEmpty,
    IsString,
    MaxLength
} from 'class-validator';
import { CreateMessageDto } from './create-message.dto';
import { Users } from "src/users/entities/users.entity";

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
    @IsDate()
    readonly createdAt: Date;

    @IsNotEmpty()
    @IsString()
    @MaxLength(640)
    readonly content: string;

    @IsNotEmpty()
    readonly sender: Users;
}
