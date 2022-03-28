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
import { Achievement } from "src/achievements/entities/achievements.entity";

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
    tfaSecret: string;

    @Column({ nullable: true })
    pic: string;

    // should be null if user is not a duoquadra, otherwise must be set to the duoquadra's unique login
    @Column({ nullable: true, unique: true })
    duoquadra_login: string;

    @Column({ default: false })
    accountDeactivated: boolean;

    @ManyToMany(() => Game, game => game.players)
    games: Game[];

    @Column({ default: 0 })
    wins: number;

    @Column({ default: 0 })
    losses: number;

    @Column({ default: 0 })
    draws: number;

    @Column({ type: 'decimal', default: 0 })
    ratio: number;

    @ManyToMany(() => Achievement, achievement => achievement.users)
    achievements: Achievement[];

    @ManyToMany(() => User)
    @JoinTable()
    friends: User[];

    @ManyToMany(() => User)
    @JoinTable()
    pendingFriendsSent: User[];

    @ManyToMany(() => User)
    @JoinTable()
    pendingFriendsReceived: User[];

    @ManyToMany(() => User)
    @JoinTable()
    blockedUsers: User[];

    @OneToMany(() => Channel, channel => channel.owner, {
        cascade: true,
    })
    ownedChannels: Channel[];

    @ManyToMany(() => Channel, joinedChannels => joinedChannels.users)
    joinedChannels: Channel[];
}

