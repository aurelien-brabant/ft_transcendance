import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
/*
export class UpdateUserDto extends PartialType(CreateUserDto) {}
//export class UpdateCoffeeDto {
 //   readonly name?: string;
   // readonly brand?: string;
    //readonly flavors?: string [];//
*/

export class RemoveUserDto extends PartialType(CreateUserDto) {}
/*{
  username?: string;
  email?: string;
  testArray?: string [];
}*/