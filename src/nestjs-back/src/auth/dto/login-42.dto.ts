import { IsString } from "class-validator";

export class Login42Dto {
  @IsString()
  apiCode: string; // the code returned in the redirection URI, passed in the request body by the nextjs app
}
