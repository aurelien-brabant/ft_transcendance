import { PartialType } from '@nestjs/mapped-types';
import { CreateChanMessageDto } from './create-chan-message.dto';

export class UpdateChanMessageDto extends PartialType(CreateChanMessageDto) {}
