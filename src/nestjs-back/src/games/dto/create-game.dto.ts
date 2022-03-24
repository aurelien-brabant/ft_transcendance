import { IsString, IsOptional } from 'class-validator';

export class CreateGameDto {
    @IsOptional()
    @IsString()
    readonly createdAt: string;
}
