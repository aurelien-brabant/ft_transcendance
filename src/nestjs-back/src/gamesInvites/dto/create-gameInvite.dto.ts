import { IsString, IsDate, IsInt } from 'class-validator';
import { Users } from 'src/users/entities/users.entity';

export class CreateGameInviteDto {
//    readonly sender: Users;
  //  readonly receiver: Users;   
    @IsInt()
    readonly sender: number; 

    @IsInt()
    readonly receiver: number;  

    @IsString()
    readonly status: string;    

    @IsDate()
    readonly requestedAt: Date;  
}
