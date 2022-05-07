import { User } from "src/users/entities/users.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channels.entity";

@Entity()
export class ChannelPunishment {
    @PrimaryGeneratedColumn()
    punishmentId: number;
    
    @OneToOne(() => Channel, {
        onDelete: 'CASCADE'
    })
    channel: Channel;

    @OneToOne(() => User, {
        onDelete: 'CASCADE'
    })
    punishedUser: User

    @OneToOne(() => User)
    punishedByUser: User;

    @Column({ type: 'timestamptz' })
    startsAt: Date;

    /* punishment is permanent until explicit undo if this is nulled */
    @Column({ type: 'timestamptz', nullable: true })
    endsAt: Date;

    /* should be null if the intent is to apply the punishment permanently */
    @Column({ unsigned: true, nullable: true })
    durationInSeconds: number;

    @Column({ length: 1000, nullable: true })
    reason: string;
}