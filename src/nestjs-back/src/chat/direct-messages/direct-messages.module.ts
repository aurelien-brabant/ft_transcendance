import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessage } from './entities/direct-messages';
import { DirectMessagesService } from './direct-messages.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([DirectMessage]), UsersModule],
  providers: [DirectMessagesService],
  exports: [DirectMessagesService]
})
export class DirectMessagesModule {}
