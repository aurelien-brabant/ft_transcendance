import { IsString, IsOptional, IsInt } from 'class-validator';
import { User } from 'src/users/entities/users.entity';

export class CreateGameDto {
    
    readonly players: User[];

    @IsOptional()
    @IsInt()
    readonly winnerId: number;
    
    @IsOptional()
    @IsInt()
    readonly loserId: number;
    
    @IsOptional()
    @IsInt()
    readonly winnerScore: number;

    @IsOptional()
    @IsInt()
    readonly loserScore: number;

    @IsOptional()
    @IsString()
    readonly createdAt: number;

    @IsOptional()
    @IsString()
    readonly endedAt: number;

    @IsOptional()
    @IsInt()
    readonly gameDuration: number;
}
