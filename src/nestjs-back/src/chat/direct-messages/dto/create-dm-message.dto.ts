import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DirectMessage } from "src/chat/direct-messages/entities/direct-messages";
import { User } from "src/users/entities/users.entity";

export class CreateDmMessageDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @Length(1, 640, {
    message: 'Empty messages are not allowed.'
  })
  readonly content: string;

  @IsNotEmpty()
  readonly author: User;

  @IsOptional()
  @IsString()
  @IsIn(["regular", "invite"])
  readonly type?: string;

  @IsOptional()
  @IsString()
  readonly roomId?: string;

  @IsNotEmpty()
  readonly dm: DirectMessage;
}
