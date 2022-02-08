import { IsOptional } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FriendsInvites {
    @PrimaryGeneratedColumn()
    id: number;

    @IsOptional()
    @Column()
    sender: number;

    @IsOptional()
    @Column()
    receiver: number;

    @IsOptional()
    @Column()
    status: string;

    @Column({
        type: 'date',
        default: () => 'CURRENT_DATE',
    })
    requestedAt: Date;
}