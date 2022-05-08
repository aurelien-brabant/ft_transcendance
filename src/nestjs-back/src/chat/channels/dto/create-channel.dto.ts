import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PasswordValidator } from 'src/utils/patternValidator';
import { Transform, Type } from 'class-transformer';
import { ChannelMessage } from 'src/chat/channels/messages/entities/channel-messages.entity';
import { User } from 'src/users/entities/users.entity';

export class CreateChannelDto {
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_ ]+$/, {
    message:
      'The channel name must contain alphanumeric characters, underscores and spaces only.',
  })
  @MaxLength(20)
  @MinLength(2)
  readonly name: string;

  @IsString()
  @IsIn(["public", "private", "protected"])
  readonly privacy: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @PasswordValidator()
  password?: string;

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
  @Type(() => ChannelMessage)
  readonly messages: ChannelMessage[];
}
