import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;
    
    @Column()
    email: string;
    
    @Column('json', { nullable: true })
    testArray: string[];
}