import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { User } from 'src/users/entities/users.entity';

export class CreateDirectMessageDto {
  @IsNotEmpty()
  @IsArray()
  @Type(() => User)
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  readonly users: User[];
}
