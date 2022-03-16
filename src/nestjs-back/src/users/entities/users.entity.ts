import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { Channel } from 'src/chat/channels/entities/channels.entity';
import { Game } from "src/games/entities/games.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ select: false, nullable: true })
    password: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ default: false })
    tfa: boolean;

    @Column({ nullable: true })
    pic: string;

    // should be null if user is not a duoquadra, otherwise must be set to the duoquadra's unique login
    @Column({ nullable: true, unique: true })
    duoquadra_login: string;

    @ManyToMany(() => Game, game => game.players)
    games: Game[];

    @Column({ default: 0 })
    wins: number;

    @Column({ default: 0 })
    losses: number;

    @Column({ type: 'decimal', default: 0 })
    ratio: number;

    @ManyToMany(() => User)
    @JoinTable()
    friends: User[];

    @OneToMany(() => Channel, channel => channel.owner, {
        cascade: true,
    })
    ownedChannels: Channel[];

    @ManyToMany(() => Channel, joinedChannels => joinedChannels.users)
    joinedChannels: Channel[];

    @Column({default: false})
    accountDeactivated: boolean;

    @Column({ nullable: true })
    tfaSecret: string;  
}
