import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DmMessage } from 'src/chat/direct-messages/messages/entities/dm-messages.entity';
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
  @Type(() => DmMessage)
  readonly messages: DmMessage[];
}
