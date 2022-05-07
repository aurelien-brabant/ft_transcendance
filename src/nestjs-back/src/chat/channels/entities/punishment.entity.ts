import { User } from "src/users/entities/users.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ChannelPunishment {
    @PrimaryGeneratedColumn()
    punishmentId: number;

    @OneToOne(() => User)
    punishedUser: User

    @Column({ type: 'timestamptz' })
    startsAt: Date;

    @Column({ type: 'timestamptz' })
    endsAt: Date;

    @Column({ unsigned: true })
    durationInSeconds: number;
}