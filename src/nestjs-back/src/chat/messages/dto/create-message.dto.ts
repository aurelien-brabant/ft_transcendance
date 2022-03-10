import {
  IsDate,
  IsNotEmpty,
  IsString,
  MaxLength
} from 'class-validator';
import { Channel } from "src/chat/channels/entities/channels.entity";
import { User } from "src/users/entities/users.entity";

export class CreateMessageDto {
  @IsNotEmpty()
  @IsDate()
  readonly createdAt: Date;

  @IsNotEmpty()
  @IsString()
  @MaxLength(640)
  readonly content: string;

  @IsNotEmpty()
  readonly sender: User;

  @IsNotEmpty()
  readonly channel: Channel;
}
