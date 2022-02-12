import { IsOptional } from "class-validator";
// import { Users } from "src/users/entities/users.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Channels {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column()
    owner: number;

    @Column({ default: true })
    isPublic: boolean;

    @Column({ default: false })
    isProtected: boolean;

    @IsOptional()
    @Column({ nullable: true })
    password: string;
}
