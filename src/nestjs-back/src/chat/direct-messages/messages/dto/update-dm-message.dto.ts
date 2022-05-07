import { PartialType } from '@nestjs/mapped-types';
import { CreateDmMessageDto } from './create-dm-message.dto';

export class UpdateDmMessageDto extends PartialType(CreateDmMessageDto) {}
