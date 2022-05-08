import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelMessageDto } from './create-channel-message.dto';

export class UpdateChannelMessageDto extends PartialType(CreateChannelMessageDto) {}
