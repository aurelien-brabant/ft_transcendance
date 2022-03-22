import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelDto } from './create-channel.dto';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @MinLength(8)
  readonly password?: string;
}
