import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { Channels } from "src/channels/entities/channels.entity";
import { Users } from "src/users/entities/users.entity";

@Entity()
export class Messages {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;

    @Column({ length: 640 })
    content: string;

    @ManyToOne(() => Users, sender => sender.sentMessages, {
        onDelete: "CASCADE",
    })
    sender: Users;

    @ManyToOne(() => Channels, channel => channel.messages, {
        onDelete: "CASCADE",
    })
    channel: Channels;
}
