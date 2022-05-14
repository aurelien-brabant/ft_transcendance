import {
  Controller,
  Delete,
  Get,
  Param,
} from '@nestjs/common';
import { DirectMessagesService } from './direct-messages.service';

/**
 * Mostly built for test purposes, we should use the service with
 * websockets exclusively.
 */

@Controller('direct-messages')
export class DirectMessagesController {
  // constructor(
  //   private readonly directMessagesService: DirectMessagesService
  // ) {}

  // @Get()
  // findAll() {
  //   return this.directMessagesService.findAll();
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.directMessagesService.remove(id);
  // }
}
