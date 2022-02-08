import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional } from 'class-validator';
import { Users } from 'src/users/entities/users.entity';
import { CreateGameDto } from './create-game.dto';

export class UpdateGameDto extends PartialType(CreateGameDto) {
    @IsOptional()
    @IsInt()
    readonly winner: number;
//    readonly winner: Users;  

    @IsOptional()
    readonly players: Users[];
}