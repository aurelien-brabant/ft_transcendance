import {
    IsEmail,
    IsString,
    IsUrl
} from "class-validator";

/**
 * NOTE: as of now this DTO is not used in its quality of DTO, but more as a standard typescript type.
 * The reason for that is that there is no special route to create a duoquadra: a duoquadra ft_transcendance account
 * is automatically created when a login is attempted using the 42 API (endpoint /auth/login42).
 *
 * It's still implemented as a DTO in case we would want to change how things are handled later.
 */

export class CreateDuoQuadraDto {
    @IsString()
    login: string;
 
    @IsUrl()
    imageUrl: string;

    @IsEmail()
    email: string;
}
