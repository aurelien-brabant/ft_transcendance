import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channels } from './entities/channels.entity';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';

@Module({
    imports: [TypeOrmModule.forFeature([Channels])],
    controllers: [ChannelsController ],
    providers: [ChannelsService]
})
export class ChannelsModule {}
