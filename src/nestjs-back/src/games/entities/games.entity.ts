import { Users } from "src/users/entities/users.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Games {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(
        type => Users,
        user => user.games
    )
    users: Users[];

    @Column( {nullable: true} )
    winner: number;

    @Column( { nullable: true } ) //only for testing
    started_at: Date;
}