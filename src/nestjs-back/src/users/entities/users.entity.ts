import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { Channel } from 'src/channels/entities/channels.entity';
import { Game } from "src/games/entities/games.entity";
//import { GamesInvite } from "src/gamesInvites/entities/gamesInvites.entity";

@Entity()
export class User {
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

    // should be null if user is not a duoquadra, otherwise must be set to the duoquadra's unique login
    @Column({ nullable: true, unique: true })
    duoquadra_login: string;

    @Column({ nullable: true })
    rank: number;

    @ManyToMany(() => Game, game => game.players)
    games: Game[];

    @OneToMany(() => Game, game => game.winner, {
        cascade: true,
    })
    wins: Game[];

    @Column({ default: 0 })
    losses: number;

    @ManyToMany(() => User)
    @JoinTable()
    friends: User[];

    /*
    @Column()
    @JoinTable()
    @ManyToMany(
        type => Friend,
        (friend) => friend.friends,
    )
    friends: Friend[];
    friends: User[];
    friends: number[]

    @JoinTable()
    @ManyToMany(
        type => GamesInvite,
        (invite) => invite.sender,
    )
    gamesInviteSender: GamesInvite[];

    @JoinTable()
    @ManyToMany(
        type => GamesInvite,
        (invite) => invite.receiver,
    )
    gamesInviteReceiver: GamesInvite[];
    */

    @OneToMany(() => Channel, channel => channel.owner, {
        cascade: true,
    })
    ownedChannels: Channel[];

    @ManyToMany(() => Channel, joinedChannels => joinedChannels.users)
    joinedChannels: Channel[];
}
