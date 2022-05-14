import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { Achievement } from './entities/achievements.entity';
import achievementsList from '../constants/achievementsList';

@Injectable()
export class AchievementsService implements OnModuleInit {
  private logger: Logger = new Logger('Achievements Service');

  constructor(
    @InjectRepository(Achievement)
    private readonly achievementsRepository: Repository<Achievement>,
  ) {}

  async onModuleInit() {
    this.logger.log('Populating achievements...');
    for (const achievement of achievementsList) {
      await this.achievementsRepository.preload(achievement);
    }
  }

  findAll() {
    return this.achievementsRepository.find({
      relations: ['users'],
      order: {
        levelToReach: 'ASC',
      },
    });
  }

  findAchievements() {
    return this.achievementsRepository.find();
  }

  async findOne(id: string) {
    const achievement = await this.achievementsRepository.findOne(id, {
      relations: ['users'],
    });
    if (!achievement)
      throw new NotFoundException(`Achievement [${id}] not found`);
    return achievement;
  }

  create(createAchievementDto: CreateAchievementDto) {
    const achievement =
      this.achievementsRepository.create(createAchievementDto);
    return this.achievementsRepository.save(achievement);
  }

  async update(id: string, updateAchievementDto: UpdateAchievementDto) {
    let achievement: Achievement | null = null;

    achievement = await this.findOne(id);
    if (!achievement)
      throw new NotFoundException(
        `Cannot update achievement[${id}]: Not found`,
      );

    const oldUsers = achievement.users;

    let updated = [];
    for (let i in oldUsers) updated.push({ id: oldUsers[i].id });
    for (let i in updateAchievementDto.users)
      updated.push({ id: updateAchievementDto.users[i].id });

    achievement = await this.achievementsRepository.preload({
      id: +id,
      users: updated,
    });

    return this.achievementsRepository.save(achievement);
  }

  async remove(id: string) {
    const game = await this.findOne(id);
    return this.achievementsRepository.remove(game);
  }
}
