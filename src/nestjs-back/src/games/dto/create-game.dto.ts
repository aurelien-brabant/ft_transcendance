import { IsString, IsInt } from 'class-validator';
import { Users } from 'src/users/entities/users.entity';

export class CreateGameDto {
    @IsInt()
    readonly winner: number;  

    @IsString()
    readonly startedAt: string;

    readonly gameInviteSender: Users;

    readonly gameInviteReceiver: Users
}