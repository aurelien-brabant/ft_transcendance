import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { CreateChannelDto } from './create-channel.dto';
import { User } from "src/users/entities/users.entity";

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
  @IsOptional()
  readonly admins?: User[];
}
