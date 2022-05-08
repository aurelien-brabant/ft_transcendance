import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Channel } from "src/chat/channels/entities/channels.entity";
import { User } from "src/users/entities/users.entity";

export class CreateChannelMessageDto {
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsString()
  @MaxLength(640)
  readonly content: string;

  @IsOptional()
  @IsNotEmpty()
  readonly author: User;

  @IsNotEmpty()
  readonly channel: Channel;
}
