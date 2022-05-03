import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Message } from 'src/chat/messages/entities/messages.entity';
import { User } from 'src/users/entities/users.entity';

export class CreateDirectMessageDto {
  @IsNotEmpty()
  @IsArray()
  @Type(() => User)
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  readonly users: User[];

  @IsOptional()
  @IsArray()
  @Type(() => Message)
  readonly messages: Message[];
}
