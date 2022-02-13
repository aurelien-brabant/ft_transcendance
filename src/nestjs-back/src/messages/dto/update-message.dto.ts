import {
    IsDate,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength
} from 'class-validator';
import { Users } from "src/users/entities/users.entity";

export class UpdateMessageDto {
    @IsOptional()
    @IsDate()
    readonly createdAt: Date;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(640)
    readonly content: string;

    @IsOptional()
    @IsNotEmpty()
    sender: Users;
}
