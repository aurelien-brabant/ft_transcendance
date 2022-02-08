import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    @IsInt()
    readonly rank: number;

/*    @IsOptional()
    @IsInt({ each: true })
    readonly games: number [];*/
}