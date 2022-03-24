import { IsString } from 'class-validator';

export class CreateAchievementDto {
    @IsString()
    readonly achievement: string;

    @IsString()
    readonly icon: string;
}
