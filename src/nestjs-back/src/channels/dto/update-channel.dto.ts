import { PartialType } from '@nestjs/mapped-types';
import { CreateChannelDto } from './create-channel.dto';
import { IsBoolean, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { Users } from 'src/users/entities/users.entity';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    readonly name: string;

    @IsOptional()
    @IsNotEmpty()
    readonly owner: Users;

    @IsOptional()
    @IsBoolean()
    readonly isPublic: boolean;

    @IsOptional()
    @IsBoolean()
    readonly isProtected: boolean;

    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(50)
    readonly password: string;

    @IsOptional()
    readonly users: Users [];
}
