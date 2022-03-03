import { IsDate, IsOptional } from 'class-validator';
// import { Users } from 'src/users/entities/users.entity';

export class CreateGameDto {
    @IsOptional()
    @IsDate()
    readonly createdAt: Date;

    /*
    @IsOptional()
    readonly gameInviteSender: Users;

    @IsOptional()
    readonly gameInviteReceiver: Users;
    */
}
