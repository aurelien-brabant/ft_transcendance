import { IsString, IsInt } from 'class-validator';

export class CreateUserDto {
    @IsString()
    readonly username: string;

    @IsString()
    readonly password: string;

    @IsString()
    readonly email: string;

    @IsString()
    readonly phone: string;

    @IsString()
    readonly pic: string;

    @IsString()
    readonly is_duoquadra: boolean;

    @IsInt()
    readonly rank: number;

    @IsInt({ each: true })
    readonly games: number [];

    @IsInt({ each: true })
    readonly friends: number [];
}
