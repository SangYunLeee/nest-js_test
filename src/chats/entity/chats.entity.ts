import { BaseModel } from 'src/common/entity/base.entity';
import { UsersModel } from 'src/users/entity/users.entity';
import { Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { MessagesModel } from '../messages/entities/messages.entity';

@Entity()
export class ChatsModel extends BaseModel {
  @ManyToMany((type) => UsersModel, (user) => user.chats)
  @JoinTable()
  users: UsersModel[];

  @OneToMany((type) => MessagesModel, (message) => message.chat)
  messages: MessagesModel[];
}
