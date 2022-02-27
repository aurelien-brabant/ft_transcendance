import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { IsOptional } from "class-validator";
import { Messages } from 'src/messages/entities/messages.entity';
import { Users } from "src/users/entities/users.entity";

@Entity()
export class Channels {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true })
    name: string;

    @ManyToOne(() => Users, owner => owner.ownedChannels, {
        onDelete: "CASCADE"
    })
    owner: Users;

    /* public, private, protexted */
    @Column({ default: "public" })
    visibility: string

    @IsOptional()
    @Column({ length: 50, nullable: true })
    password: string;

    @ManyToMany(() => Users, user => user.joinedChannels)
    @JoinTable()
    users: Users[];

    @OneToMany(() => Messages, message => message.channel, {
        cascade: true
    })
    messages: Messages[];
}
