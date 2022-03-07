import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { Channels } from 'src/channels/entities/channels.entity';
import { Games } from "src/games/entities/games.entity";
//import { GamesInvites } from "src/gamesInvites/entities/gamesInvites.entity";
import { Messages } from 'src/messages/entities/messages.entity';

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
    tfa: string;

    @Column({ nullable: true })
    pic: string;

    // should be null if user is not a duoquadra, otherwise must be set to the duoquadra's unique login
    @Column({ nullable: true, unique: true })
    duoquadra_login: string;

    @Column({ nullable: true })
    rank: number;

    @ManyToMany(() => Games, games => games.players)
    games: Games[];

    @OneToMany(() => Games, game => game.winner, {
        cascade: true,
    })
    wins: Games[];

    @Column({ default: 0 })
    losses: number;

    @ManyToMany(() => Users)
    @JoinTable()
    friends: Users[];

/*    @JoinTable()
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
    */

    @OneToMany(() => Channels, channel => channel.owner, {
        cascade: true,
    })
    ownedChannels: Channels[];

    @ManyToMany(() => Channels, joinedChannels => joinedChannels.users)
    joinedChannels: Channels[];

    @OneToMany(() => Messages, message => message.sender, {
        cascade: true,
    })
    sentMessages: Messages[];
}
