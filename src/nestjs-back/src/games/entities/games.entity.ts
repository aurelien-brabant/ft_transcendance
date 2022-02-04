import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Games {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    player1: number;

    @Column()
    player2: number;

    @Column({nullable: true})
    winner: number;

    @Column()
    started_at: Date;
}