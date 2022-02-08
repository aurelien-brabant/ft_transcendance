import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FriendsInvites {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sender: number;

    @Column()
    receiver: number;

    @Column()
    status: string;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    requestedAt: string;
}