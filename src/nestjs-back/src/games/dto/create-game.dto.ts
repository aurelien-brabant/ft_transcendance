import { IsString, IsOptional } from 'class-validator';
// import { User } from 'src/users/entities/users.entity';

export class CreateGameDto {
    @IsOptional()
    @IsString()
    readonly createdAt: string;

    /*
    @IsOptional()
    readonly gameInviteSender: User;

    @IsOptional()
    readonly gameInviteReceiver: User;
    */
}
