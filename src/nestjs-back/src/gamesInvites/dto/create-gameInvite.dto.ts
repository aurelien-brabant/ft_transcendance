import { IsString, IsDate, IsInt } from 'class-validator';
// import { User } from 'src/users/entities/users.entity';

export class CreateGameInviteDto {
    // readonly sender: User;
    // readonly receiver: User;
    @IsInt()
    readonly sender: number;

    @IsInt()
    readonly receiver: number;

    @IsString()
    readonly status: string;

    @IsDate()
    readonly requestedAt: Date;
}
