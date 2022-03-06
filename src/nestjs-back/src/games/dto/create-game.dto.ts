import { IsDate, IsOptional } from 'class-validator';
// import { User } from 'src/users/entities/users.entity';

export class CreateGameDto {
    @IsOptional()
    @IsDate()
    readonly createdAt: Date;

    /*
    @IsOptional()
    readonly gameInviteSender: User;

    @IsOptional()
    readonly gameInviteReceiver: User;
    */
}
