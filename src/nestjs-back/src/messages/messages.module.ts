import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Messages } from './entities/messages.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
    imports: [TypeOrmModule.forFeature([Messages])],
    controllers: [MessagesController],
    providers: [MessagesService]
})
export class MessagesModule {}
