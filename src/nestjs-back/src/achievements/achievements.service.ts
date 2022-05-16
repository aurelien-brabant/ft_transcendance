import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { Achievement } from './entities/achievements.entity';
import achievementsList from '../constants/achievementsList';
import { User } from 'src/users/entities/users.entity';

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
      await this.achievementsRepository.save(achievement);
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

  async findOne(id: string) {
    const achievement = await this.achievementsRepository.findOne(id, {
      relations: ['users'],
    });

    if (!achievement) {
      throw new Error(`Achievement [${id}] not found`);
    }

    return achievement;
  }

  create(createAchievementDto: CreateAchievementDto) {
    const achievement = this.achievementsRepository.create(createAchievementDto);

    return this.achievementsRepository.save(achievement);
  }

  async update(id: string, updateAchievementDto: UpdateAchievementDto) {
    const achievement = await this.achievementsRepository.preload({
      id: +id,
      ...updateAchievementDto
    });

    if (!achievement) {
      throw new Error(`Cannot update achievement[${id}]: Not found`);
    }

    return this.achievementsRepository.save(achievement);
  }

  async remove(id: string) {
    const achievement = await this.findOne(id);

    return this.achievementsRepository.remove(achievement);
  }

  async addUserAchievement(id: string, updateAchievementDto: UpdateAchievementDto) {
    const achievement = await this.findOne(id);

    this.logger.log(`Add Achievement [${achievement.description}] to User`);

    return await this.update(id, {
      users: [
        ...achievement.users,
        ...updateAchievementDto.users
      ]
    });
  }

  async checkUserAchievement(user: User, type: string, levelReached: number) {
    const achievement = await this.achievementsRepository.createQueryBuilder('achievement')
      .where('achievement.type = :type', { type })
      .andWhere('achievement.levelToReach = :levelReached', { levelReached })
      .getOne();

    if (achievement) {
      await this.addUserAchievement(achievement.id.toString(), {
        users: [ user ]
      });
    }
  }
}
