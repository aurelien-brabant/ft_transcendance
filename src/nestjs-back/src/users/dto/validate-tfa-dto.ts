import { IsString } from 'class-validator';

export class ValidateTfaDto {
  @IsString()
  code: string;
}
