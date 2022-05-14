import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channels.entity";
import { User } from "src/users/entities/users.entity";

export type PunishmentType = 'mute' | 'ban';

@Entity()
export class ChannelPunishment {
    @PrimaryGeneratedColumn()
    punishmentId: number;

    @ManyToOne(() => Channel, (channel) => channel.punishments, {
        onDelete: 'CASCADE'
    })
    channel: Channel;

    @ManyToOne(() => User, (user) => user.receivedChannelPunishments)
    punishedUser: User

    @ManyToOne(() => User, (user) => user.givenChannelPunishments)
    punishedByUser: User;

    @Column({
        type: 'timestamptz',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    startsAt: Date;

    /* punishment is permanent until explicit undo if this is nulled */
    @Column({ type: 'timestamptz', nullable: true })
    endsAt: Date;

    /* should be null if the intent is to apply the punishment permanently */
    @Column({ unsigned: true, nullable: true })
    durationInSeconds: number;

    @Column({ default: 'ban' })
    type: PunishmentType;

    @Column({ length: 1000, nullable: true })
    reason: string;
}
