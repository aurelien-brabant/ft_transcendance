import { IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { DmMessage } from 'src/chat/direct-messages/entities/dm-messages.entity';
import { PartialType } from '@nestjs/mapped-types';
import { CreateDirectMessageDto } from './create-direct-message.dto';

export class UpdateDirectMessageDto extends PartialType(CreateDirectMessageDto) {
  @IsOptional()
  @IsArray()
  @Type(() => DmMessage)
  readonly messages: DmMessage[];
}
