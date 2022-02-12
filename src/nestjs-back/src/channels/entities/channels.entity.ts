import { IsOptional } from "class-validator";
import { Users } from "src/users/entities/users.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Channels {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true })
    name: string;

    @Column()
    owner: number;

    // @ManyToOne(type => Users, owner => owner.ownedChannels)
    // owner: Users;

    @Column({ default: true })
    isPublic: boolean;

    @Column({ default: false })
    isProtected: boolean;

    @IsOptional()
    @Column({ length: 255, nullable: true })
    password: string;

    @ManyToMany(() => Users)
    @JoinTable()
    users: Users[];
}
