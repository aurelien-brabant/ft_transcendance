import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { AppService } from './app.service';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':get')
  getParam(@Param('get') get: string): {get: string} {
    return this.appService.getParam(get);
  }

  @Post(':post')
  getPost(@Param('post') post: string, @Body() data: string): {post: string} {
    return this.appService.postParam(post, data);
  } 
}