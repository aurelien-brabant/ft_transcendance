import {
    IsNotEmpty,
    IsString,
    MaxLength
} from 'class-validator';
import { Channels } from "src/channels/entities/channels.entity";
import { Users } from "src/users/entities/users.entity";

export class CreateMessageDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(640)
    readonly content: string;

    @IsNotEmpty()
    readonly owner: Users;

    @IsNotEmpty()
    readonly channel: Channels;
}
