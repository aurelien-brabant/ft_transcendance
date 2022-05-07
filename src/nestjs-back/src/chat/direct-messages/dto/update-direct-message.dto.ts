import { PartialType } from '@nestjs/mapped-types';
import { CreateDirectMessageDto } from './create-direct-message.dto';

export class UpdateDirectMessageDto extends PartialType(CreateDirectMessageDto) {}
