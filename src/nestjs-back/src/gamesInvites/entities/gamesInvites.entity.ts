import { Games } from "src/games/entities/games.entity";
import { Users } from "src/users/entities/users.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GamesInvites {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(
        type => Games,
        game => game.gameInviteSender
    )
    sender: Users;

    @ManyToMany(
        type => Games,
        game => game.gameInviteReceiver
    )
    receiver: Users;

    //@Column()
    //sender: number;

    //@Column()
    //receiver: number;

    @Column()
    status: string;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    requestedAt: string;
}