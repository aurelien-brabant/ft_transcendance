import { IsBoolean, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { Users } from 'src/users/entities/users.entity';

export class CreateChannelDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    readonly name: string;

    @IsNotEmpty()
    readonly owner: Users;

    @IsBoolean()
    readonly isPublic: boolean;

    @IsBoolean()
    readonly isProtected: boolean;

    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(50)
    readonly password: string;

    // @ArrayContains(owner)
    // readonly users: Users [];
}
