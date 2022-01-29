import { IsString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    readonly username: string;

    @IsString()
    readonly email: string;

    @IsString({ each: true })
    readonly testArray: string [];
}
