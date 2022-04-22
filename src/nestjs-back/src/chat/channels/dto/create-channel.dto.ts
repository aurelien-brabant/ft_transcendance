import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
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

  @IsOptional()
  @IsNumber()
  @IsIn([1, 5, 15])
  readonly restrictionDuration?: number;

  @IsNotEmpty()
  readonly owner: User;

  @IsNotEmpty()
  @IsArray()
  @Type(() => User)
  @ArrayMinSize(1)
  readonly users: User[];

  @IsOptional()
  @IsArray()
  @Type(() => Message)
  readonly messages: Message[];
}
