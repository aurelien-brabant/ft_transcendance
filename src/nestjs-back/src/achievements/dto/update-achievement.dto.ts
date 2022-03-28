import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { User } from 'src/users/entities/users.entity';
import { CreateAchievementDto } from './create-achievement.dto';

export class UpdateAchievementDto extends PartialType(CreateAchievementDto) {
    @IsOptional()
    readonly users: User[];
}
