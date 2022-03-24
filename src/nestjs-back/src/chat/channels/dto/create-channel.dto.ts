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

  @IsNotEmpty()
  readonly owner: User;

  @IsString()
  @IsIn(["public", "private", "protected"])
  readonly privacy: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  readonly password?: string;

  @IsNotEmpty()
  readonly users: User[];

  @IsOptional()
  readonly messages: Message[];
}
