import { PartialType } from '@nestjs/mapped-types';
import { CreateGameInviteDto } from './create-gameInvite.dto';

export class UpdateGameInviteDto extends PartialType(CreateGameInviteDto) {}