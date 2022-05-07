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
import { ChanMessage } from 'src/chat/channels/messages/entities/chan-messages.entity';
import { User } from "src/users/entities/users.entity";
import { ChannelPunishment } from "./punishment.entity";

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
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

  @OneToMany(() => ChanMessage, message => message.channel, {
    cascade: true
  })
  messages: ChanMessage[];

  @OneToMany(() => ChannelPunishment, (punishment) => punishment.channel)
  punishments: ChannelPunishment[];
}
