import {
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DirectMessage } from "src/chat/direct-messages/entities/direct-messages";
import { User } from "src/users/entities/users.entity";

export class CreateDmMessageDto {
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsString()
  @Length(1, 640)
  readonly content: string;

  @IsNotEmpty()
  readonly author: User;

  @IsNotEmpty()
  readonly dm: DirectMessage;
}
