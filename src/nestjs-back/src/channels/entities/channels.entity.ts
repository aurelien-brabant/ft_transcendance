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

    @ManyToOne(() => Users, owner => owner.ownedChannels)
    owner: Users;

    @Column({ default: true })
    isPublic: boolean;

    @Column({ default: false })
    isProtected: boolean;

    @IsOptional()
    @Column({ length: 50, nullable: true })
    password: string;

    @ManyToMany(() => Users, user => user.joinedChannels)
    @JoinTable()
    users: Users[];

    @OneToMany(() => Messages, message => message.channel)
    messages: Messages[];
}
