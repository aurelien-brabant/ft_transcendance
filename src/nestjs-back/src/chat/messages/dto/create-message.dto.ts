import {
  IsNotEmpty,
  IsString,
  MaxLength
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Channel } from "src/chat/channels/entities/channels.entity";
import { User } from "src/users/entities/users.entity";

export class CreateMessageDto {
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsString()
  @MaxLength(640)
  readonly content: string;

  @IsNotEmpty()
  readonly author: User;

  @IsNotEmpty()
  readonly channel: Channel;
}
