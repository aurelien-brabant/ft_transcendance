import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';
import { Message } from 'src/chat/messages/entities/messages.entity';
import { User } from 'src/users/entities/users.entity';

export class CreateChannelDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @MinLength(2)
  readonly name: string;

  @IsString()
  @IsIn(["public", "private", "protected", "dm"])
  readonly privacy: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  readonly password?: string;

  @IsNotEmpty()
  readonly owner: User;

  @IsNotEmpty()
  readonly users: User[];

  @IsOptional()
  readonly messages: Message[];
}
