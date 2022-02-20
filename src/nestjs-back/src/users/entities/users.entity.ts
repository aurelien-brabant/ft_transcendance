import { Games } from "src/games/entities/games.entity";
//import { GamesInvites } from "src/gamesInvites/entities/gamesInvites.entity";
import { Channels } from 'src/channels/entities/channels.entity';
import { Messages } from 'src/messages/entities/messages.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

    // should be null if user is not a duoquadra, otherwise must be set to the duoquadra's unique login
    @Column({ nullable: true, unique: true })
    duoquadra_login: string;

    @Column({ nullable: true })
    rank: number;

    @Column({ default: 0 })
    win: number;

    @Column({ default: 0 })
    loose: number;

    @JoinTable()
    @ManyToMany(() => Games)
//    @ManyToMany(
  //      type => Games,
    //    (games) => games.players,
//        {
  //          cascade: true,
    //    }
    //)
    games: Games[];

   /* @JoinTable()
    @OneToMany(
        type => Games,
        (games) => games.winner,
    )
    win: Games;
*/
//    @Column()
//    @JoinTable()
  //  @ManyToMany(
    //    type => Friends,
      //  (friends) => friends.friends,
   // )
    //friends: Friends[];
//    friends: Users[];
//    friends: number[]
    @JoinTable()
    @ManyToMany(() => Users)
    friends: Users[];
/*
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
