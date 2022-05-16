import { Controller, Get, UseGuards } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";

@Controller('achievements')
export class AchievementsController {
    constructor(private readonly achievementsService: AchievementsService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.achievementsService.findAll();
    }
}
