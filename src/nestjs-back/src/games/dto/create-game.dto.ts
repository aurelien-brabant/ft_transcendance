import { IsString, IsOptional } from 'class-validator';
import { User } from 'src/users/entities/users.entity';

export class CreateGameDto {

    readonly players: User[];

    @IsOptional()
    @IsString()
    readonly createdAt: number;
}
