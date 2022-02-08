import { IsInt } from "class-validator";
//import { Users } from "src/users/entities/users.entity";

export class CreateFriendDto {
//  readonly friends: Users;
    @IsInt({ each: true })
    readonly friends: number[];
}
