import { IsInt, IsDate } from 'class-validator';

export class CreateGameDto {
    @IsInt()
    readonly player1: number;   //link with player entity ???

    @IsInt()
    readonly player2: number;   //link with player entity ???

    @IsInt()
    readonly winner: number;     //link with player entity ???

    @IsDate()
    readonly started_at: Date;    // change Date to timestamp ??

}
