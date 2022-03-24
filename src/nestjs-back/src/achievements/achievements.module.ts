import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { Achievement } from './entities/achievements.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Achievement])], 
    controllers: [AchievementsController], 
    providers: [AchievementsService]
})
export class AchievementsModule {}