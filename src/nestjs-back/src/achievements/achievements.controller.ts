import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';

@Controller('achievements')
export class AchievementsController {
    constructor(private readonly achievementsService: AchievementsService) {}

    @Get()
    findAll() {
        return this.achievementsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.achievementsService.findOne(id).catch((err) => {
            throw new NotFoundException(err.message);
        });
    }

    @Post()
    create(@Body() createAchievementDto: CreateAchievementDto) {
        return this.achievementsService.create(createAchievementDto);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateAchievementDto: UpdateAchievementDto) {
        return this.achievementsService.update(id, updateAchievementDto).catch((err) => {
            throw new NotFoundException(err.message);
        });
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.achievementsService.remove(id);
    }
}
