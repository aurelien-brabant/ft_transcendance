import {
  IsNotEmpty,
  IsString,
  MaxLength
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DirectMessage } from "src/chat/direct-messages/entities/direct-messages";
import { User } from "src/users/entities/users.entity";

export class CreateDmMessageDto {
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsString()
  @MaxLength(640)
  readonly content: string;

  @IsNotEmpty()
  readonly author: User;

  @IsNotEmpty()
  readonly dm: DirectMessage;
}
