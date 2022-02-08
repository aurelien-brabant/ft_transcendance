import { IsString, IsDate } from 'class-validator';
import { Users } from 'src/users/entities/users.entity';

export class CreateGameInviteDto {
    //@IsInt()
//    readonly sender: number;   
    readonly sender: Users;
    readonly receiver: Users;   

    //@IsInt()
    //readonly receiver: number;  

    @IsString()
    readonly status: string;    

    @IsString()
    readonly requestedAt: string;  
}
