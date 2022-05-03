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
import { Message } from 'src/chat/messages/entities/messages.entity';
import { User } from "src/users/entities/users.entity";

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  /* public, private, protected */
  @Column({ default: "private" })
  privacy: string

  @IsOptional()
  @Column({ select: false, nullable: true })
  password: string;

  /* Mute/ban duration in minutes */
  @Column({ default: 1 }) /* very short for test purposes */
  restrictionDuration: number;

  @ManyToOne(() => User, owner => owner.ownedChannels, {
    onDelete: "CASCADE"
  })
  owner: User;

  @ManyToMany(() => User, user => user.joinedChannels)
  @JoinTable()
  users: User[];

  @ManyToMany(() => User)
  @JoinTable()
  admins: User[];

  @ManyToMany(() => User)
  @JoinTable()
  mutedUsers: User[];

  @ManyToMany(() => User)
  @JoinTable()
  bannedUsers: User[];

  @OneToMany(() => Message, message => message.channel, {
    cascade: true
  })
  messages: Message[];
}
