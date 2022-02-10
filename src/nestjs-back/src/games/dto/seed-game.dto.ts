import { IsInt, IsDate, IsOptional } from 'class-validator';
import { Users } from '../../users/entities/users.entity';

export class SeedGameDto {
 
    @IsOptional()
    @IsInt()
    readonly winner: number;
   //@IsOptional()
    //readonly winner: Users;  

    @IsOptional()
    readonly players: Users[];

    @IsOptional()
    @IsDate()
    readonly createdAt: Date;
}
