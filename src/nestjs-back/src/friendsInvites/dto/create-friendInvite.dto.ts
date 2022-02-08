import { IsInt, IsString } from 'class-validator';

export class CreateFriendInviteDto {
    @IsInt()
    readonly sender: number; 

    @IsInt()
    readonly receiver: number;  

    @IsString()
    readonly status: string;  

    @IsString()
    readonly requestedAt: string; 

}
