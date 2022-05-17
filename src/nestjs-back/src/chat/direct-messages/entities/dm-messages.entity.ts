import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DirectMessage } from 'src/chat/direct-messages/entities/direct-messages';
import { User } from 'src/users/entities/users.entity';

@Entity()
export class DmMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @Column({ length: 640 })
  content: string;

  @ManyToOne(() => User)
  author: User;

  @ManyToOne(() => DirectMessage, (dm) => dm.messages, {
    onDelete: 'CASCADE',
  })
  dm: DirectMessage;
}
