import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { Channel } from 'src/chat/channels/entities/channels.entity';
import { ChannelPunishment } from "src/chat/channels/entities/punishment.entity";
import { DirectMessage } from "src/chat/direct-messages/entities/direct-messages";
import { Game } from "src/games/entities/games.entity";
import { Achievement } from "src/achievements/entities/achievements.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    /* Informations */
    @Column({ unique: true })
    username: string;

    /**
     * Should be null if user is not a duoquadra,
     * otherwise must be set to the duoquadra's unique login
     */
    @Column({ nullable: true, unique: true })
    duoquadra_login: string;

    @Column({ select: false, unique: true })
    email: string;

    @Column({ nullable: true })
    pic: string;

    /* Security */
    @Column({ select: false, nullable: true })
    password: string;

    @Column({ default: false })
    tfa: boolean;

    @Column({ select: false, nullable: true })
    tfaSecret: string;

    @Column({ select: false, default: false })
    hasTfaBeenValidated: boolean;

    /**
     * Used to determine if the tfa request has expired or not.
     * See the TFA_REQUEST_EXPIRES_IN environment variable
     */
    @Column({
        type: 'timestamp',
        nullable: true,
    })
    lastTfaRequestTimestamp: string | number | Date;

    @Column({ default: false })
    accountDeactivated: boolean;

    /* Games */
    @ManyToMany(() => Game, game => game.players)
    games: Game[];

    @Column({ default: 0 })
    wins: number;

    @Column({ default: 0 })
    losses: number;

    @Column({ default: 0 })
    draws: number;

    @Column({
        type: 'decimal',
        default: 0
    })
    ratio: number;

    @ManyToMany(() => Achievement, achievement => achievement.users)
    achievements: Achievement[];

    /* Relationships */
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

    /* Chat */
    @OneToMany(() => Channel, channel => channel.owner, {
        cascade: true,
    })
    ownedChannels: Channel[];

    @ManyToMany(() => Channel, joinedChannels => joinedChannels.users)
    joinedChannels: Channel[];

    @ManyToMany(() => DirectMessage, directMessages => directMessages.users)
    directMessages: DirectMessage[];

    @OneToMany(() => ChannelPunishment, (punishment) => punishment.punishedUser)
    receivedChannelPunishments: ChannelPunishment[];

    @OneToMany(() => ChannelPunishment, (punishment) => punishment.punishedByUser)
    givenChannelPunishments: ChannelPunishment[];
}
