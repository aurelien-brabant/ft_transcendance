import { User } from 'src/users/entities/users.entity';
import { Socket } from 'socket.io';

export interface TokenPayload extends Socket { 
  user: User;
}
