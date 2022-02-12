import { IsOptional } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Channels {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true })
    name: string;

    @Column()
    owner: number;

    @Column({ default: true })
    isPublic: boolean;

    @Column({ default: false })
    isProtected: boolean;

    @IsOptional()
    @Column({ length: 255, nullable: true })
    password: string;
}
