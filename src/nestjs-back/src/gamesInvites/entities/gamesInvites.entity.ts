import { IsOptional } from "class-validator";
import { Game } from "src/games/entities/games.entity";
import { User } from "src/users/entities/users.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GamesInvite {
    @PrimaryGeneratedColumn()
    id: number;

    @IsOptional()
    @Column()
    sender: number;

    @IsOptional()
    @Column()
    receiver: number;

/*    @IsOptional()
    @ManyToMany(
        type => Game,
        game => game.gameInviteSender
    )
    sender: Users;

    @IsOptional()
    @ManyToMany(
        type => Game,
        game => game.gameInviteReceiver
    )
    receiver: User;
*/
    @IsOptional()
    @Column()
    status: string;

    @Column({
        type: 'date',
        default: () => 'CURRENT_DATE',
    })
    requestedAt: Date;
}