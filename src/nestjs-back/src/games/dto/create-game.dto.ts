import { IsString, IsOptional } from 'class-validator';
import { Users } from 'src/users/entities/users.entity';

export class CreateGameDto {
    @IsOptional()
    @IsString()
    readonly createdAt: string;

    @IsOptional()
    readonly gameInviteSender: Users;

    @IsOptional()
    readonly gameInviteReceiver: Users;
}