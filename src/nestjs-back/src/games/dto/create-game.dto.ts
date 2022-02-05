import { IsInt, IsDate } from 'class-validator';

export class CreateGameDto {
    @IsInt()
    readonly winner: number;  

    @IsDate()
    readonly started_at: Date;
}
