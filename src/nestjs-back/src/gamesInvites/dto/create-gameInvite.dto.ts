import { IsInt, IsString, IsDate } from 'class-validator';

export class CreateGameInviteDto {
    @IsInt()
    readonly sender: number;   

    @IsInt()
    readonly receiver: number;  

    @IsString()
    readonly status: string;    

    @IsDate()
    readonly requested_at: Date;  
}
