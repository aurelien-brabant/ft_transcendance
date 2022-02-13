import {
    IsNotEmpty,
    IsString,
    MaxLength
} from 'class-validator';

export class UpdateMessageDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(640)
    readonly content: string;
}
