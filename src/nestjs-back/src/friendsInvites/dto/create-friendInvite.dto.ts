import { IsInt, IsDate, IsString } from 'class-validator';

export class CreateFriendInviteDto {
    @IsInt()
    readonly sender: number; 

    @IsInt()
    readonly receiver: number;  

    @IsString()
    readonly status: string;  

    @IsDate()
    readonly requested_at: Date; 

}
