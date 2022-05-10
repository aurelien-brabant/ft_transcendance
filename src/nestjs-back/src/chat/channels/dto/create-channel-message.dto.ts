import {
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Channel } from "src/chat/channels/entities/channels.entity";
import { User } from "src/users/entities/users.entity";

export class CreateChannelMessageDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @Length(1, 640, {
    message: 'Empty messages are not allowed.'
  })
  readonly content: string;

  @IsNotEmpty()
  readonly author: User;

  @IsNotEmpty()
  readonly channel: Channel;
}
