//import { userInfo } from "os";
//import { GamesInvites } from "src/gamesInvites/entities/gamesInvites.entity";
import { Users } from "src/users/entities/users.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Games {
    @PrimaryGeneratedColumn()
    id: number;

//    @JoinTable()
    @ManyToMany(
        type => Users,
        user => user.games,
    )
    players: Users[];

    @ManyToMany(
        type => Users,
        user => user.gamesInviteSender
    )
    gameInviteSender: Users;

    @ManyToMany(
        type => Users,
        user => user.gamesInviteReceiver
    )
    gameInviteReceiver: Users;

//    @OneToMany(
  //      type => Users,
    //    user => user.winner
   // )
//    winner: Users;
    @Column( {nullable: true} )
    winner: number;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: string;
}