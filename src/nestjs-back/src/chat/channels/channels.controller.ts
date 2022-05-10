import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

/**
 * Mostly built for test purposes, we should use the service with
 * websockets exclusively.
 */

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  //@UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.channelsService.findAll();
  }

  //@UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelsService.findOne(id);
  }

  //@UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createChannelDto: CreateChannelDto) {
    return this.channelsService.create(createChannelDto);
  }

  /* TODO: only for chat owner */
  //@UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
    return this.channelsService.update(id, updateChannelDto);
  }

  /* TODO: only for chat owner */
  //@UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelsService.remove(id);
  }
}
