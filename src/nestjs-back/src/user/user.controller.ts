import { Controller, Get, Param, Post, Patch, Delete, Body, HttpCode, HttpStatus, Res, Query } from '@nestjs/common';
import { response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Get() 
    find(@Query() paginationQuery){
        const { limit, offset } = paginationQuery;
        return `limit: ${limit} - offset: ${offset}`;
    }
    @Get('all')
    findAll() {
//    findAll(@Res() response) {
     //   response.status(200).send('Gimme coffee');
    //    return ('gimme coffee');
            return this.userService.findAll();
    }
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
     //   return `gimme ${id} coffee`;
    }

    @Post()
   // @HttpCode(HttpStatus.OK)
//    create(@Body('title') body) {
  //  create(@Body() body) {
    create(@Body() createUserDto: CreateUserDto) {
        console.log(createUserDto instanceof CreateUserDto);
        return this.userService.create(createUserDto);
//            return body;
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
//        return `update ${id} coffee`;
    }

   /* @Delete(':id')
    remove(@Param('id') id: string) {
        return this.coffeeService.remove(id);
 //       return `remove ${id} coffee`;
    }*/
}
