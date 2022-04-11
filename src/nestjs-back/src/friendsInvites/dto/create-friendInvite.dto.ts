import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateFriendInviteDto {
    @IsOptional()
    @IsInt()
    readonly sender: number;

    @IsOptional()
    @IsInt()
    readonly receiver: number;

    @IsOptional()
    @IsString()
    readonly status: string;

    @IsDate()
    readonly requestedAt: Date;

}
