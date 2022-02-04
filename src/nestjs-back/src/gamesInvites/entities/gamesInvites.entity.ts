import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GamesInvites {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sender: number;

    @Column()
    receiver: number;

    @Column()
    status: string;

    @Column()
    started_at: Date;
}