import { IsIn, IsInt, IsString } from 'class-validator';

export class CreateAchievementDto {
    @IsString()
    @IsIn(["friends", "wins", "games"])
    readonly type: string;

    @IsInt()
    @IsIn([1, 3, 10])
    readonly levelToReach: number;

    @IsString()
    readonly description: string;
}
