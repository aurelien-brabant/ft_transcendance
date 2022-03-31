import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { User } from 'src/users/entities/users.entity';
import { CreateGameDto } from './create-game.dto';

export class UpdateGameDto extends PartialType(CreateGameDto) {
    // @IsOptional()
    // readonly players: User[];

    // @IsOptional()
    // readonly winnerId: number;

    // @IsOptional()
    // readonly loserId: number;

    // @IsOptional()
    // @IsString()
    // readonly endedAt: number;

    // @IsOptional()
    // @IsInt()
    // readonly gameDuration: number;

    // @IsOptional()
    // @IsInt()
    // readonly winnerScore: number;

    // @IsOptional()
    // @IsInt()
    // readonly loserScore: number;
}
