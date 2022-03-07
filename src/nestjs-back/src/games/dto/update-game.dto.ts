import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional } from 'class-validator';
import { User } from 'src/users/entities/users.entity';
import { CreateGameDto } from './create-game.dto';

export class UpdateGameDto extends PartialType(CreateGameDto) {
    @IsOptional()
    readonly players: User[];

    @IsOptional()
    @IsInt()
    readonly winner: User;
}
