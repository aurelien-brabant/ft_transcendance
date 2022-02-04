import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column()
    pic: string;

    @Column()
    is_duoquadra: boolean;

    @Column()
    rank: number;

    @Column('json', { nullable: true })
    games: number[];

    @Column('json', { nullable: true })
    friends: number[];
}