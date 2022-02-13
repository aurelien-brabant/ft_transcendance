import {
    IsDate,
    IsNotEmpty,
    IsString,
    MaxLength
} from 'class-validator';
import { Channels } from "src/channels/entities/channels.entity";
import { Users } from "src/users/entities/users.entity";

export class CreateMessageDto {
    @IsDate()
    @IsNotEmpty()
    readonly createdAt: Date;

    @IsNotEmpty()
    @IsString()
    @MaxLength(640)
    readonly content: string;

    @IsNotEmpty()
    readonly sender: Users;

    @IsNotEmpty()
    readonly channel: Channels;
}
