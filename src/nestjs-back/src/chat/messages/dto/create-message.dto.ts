import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';
import { Channel } from "src/chat/channels/entities/channels.entity";
import { User } from "src/users/entities/users.entity";

export class CreateMessageDto {
  @IsOptional()
  @IsDate()
  readonly createdAt?: Date;

  @IsNotEmpty()
  @IsString()
  @MaxLength(640)
  readonly content: string;

  @IsNotEmpty()
  readonly author: User;

  @IsNotEmpty()
  readonly channel: Channel;
}
