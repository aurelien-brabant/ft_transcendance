import { IsNumber, IsString } from 'class-validator';

export class LoginTfaDto {
  @IsString()
  userId: string;
}
