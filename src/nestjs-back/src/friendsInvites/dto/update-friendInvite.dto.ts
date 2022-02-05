import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendInviteDto } from './create-friendInvite.dto';

export class UpdateFriendInviteDto extends PartialType(CreateFriendInviteDto) {}