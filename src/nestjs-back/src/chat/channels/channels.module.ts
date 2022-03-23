import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channels.entity';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Channel]), UsersModule],
  controllers: [ChannelsController],
  providers: [ChannelsService]
})
export class ChannelsModule {}
