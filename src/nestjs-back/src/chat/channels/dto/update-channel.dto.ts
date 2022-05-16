import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateChannelDto } from './create-channel.dto';
import { ChannelMessage } from 'src/chat/channels/entities/channel-messages.entity';
import { ChannelPunishment } from '../entities/punishment.entity';
import { User } from "src/users/entities/users.entity";

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
  @IsOptional()
  @IsArray()
  @Type(() => User)
  readonly admins?: User[];

  @IsOptional()
  @IsArray()
  @Type(() => ChannelMessage)
  readonly messages?: ChannelMessage[];

  @IsOptional()
  @IsArray()
  @Type(() => ChannelPunishment)
  readonly punishments?: ChannelPunishment[];
}
