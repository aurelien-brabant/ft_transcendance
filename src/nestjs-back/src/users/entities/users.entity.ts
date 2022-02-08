import { Friends } from "src/friends/entities/friends.entity";
import { Games } from "src/games/entities/games.entity";
import { GamesInvites } from "src/gamesInvites/entities/gamesInvites.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ nullable: true })
    password: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    pic: string;

    @Column()
    is_duoquadra: string;

    @Column({ nullable: true })
    rank: number;

    @JoinTable()
    @ManyToMany(
        type => Games,
        (games) => games.users,
    )
    games: Games[];

    @JoinTable()
    @ManyToMany(
        type => Friends,
        (users) => users.friends,
    )
    friends: Friends[];

    @JoinTable()
    @ManyToMany(
        type => GamesInvites,
        (invites) => invites.sender,
    )
    gamesInviteSender: GamesInvites[];

    @JoinTable()
    @ManyToMany(
        type => GamesInvites,
        (invites) => invites.receiver,
    )
    gamesInviteReceiver: GamesInvites[];
}
