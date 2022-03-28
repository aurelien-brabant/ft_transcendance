import { IsInt, IsString } from 'class-validator';

export class CreateAchievementDto {
    @IsString()
    readonly type: string;

    @IsInt()
    readonly levelToReach: number;

    @IsString()
    readonly description: string;
}
