import {
  IsOptional,
  IsString,
  MinLength
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelDto } from './create-channel.dto';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
  @IsOptional()
  @IsString()
  @MinLength(8)
  readonly password?: string;
}
