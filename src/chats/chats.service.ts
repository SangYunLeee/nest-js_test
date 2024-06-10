import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ChatsModel } from './entities/chats.entity';
import { CreateChatDto } from './dto/create-chat-dto';
import { PaginateChatDto } from './dto/paginate-chat.dto';
import { CommonService } from 'src/common/common.service';
import { UsersService } from 'src/users/users.service';
import { EnterChatDto } from './dto/enter-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
    private readonly commonService: CommonService,
    private readonly userService: UsersService,
  ) {}

  async paginateChat(dto: PaginateChatDto) {
    return this.commonService.paginate(
      dto,
      this.chatsRepository,
      {
        relations: ['users'],
      },
      'chats',
    );
  }

  async createChat(dto: CreateChatDto) {
    const users = await this.userService.getUsersByIds(dto.userIds);

    if (users.length !== dto.userIds.length) {
      throw new Error('존재하지 않는 사용자가 포함되어 있습니다.');
    }

    const chat = await this.chatsRepository.save({
      users: dto.userIds.map((id) => ({ id })),
    });

    return this.chatsRepository.findOne({
      where: { id: chat.id },
    });
  }

  async createChatUser(dto: EnterChatDto) {
    await this.checkChatExist(dto.chatRoomIds);
    await this.userService.getUserById(dto.userId.toString());
    // TODO 이미 채팅방에 있는 사용자인지 확인하는 로직 추가
    return this.chatsRepository
      .createQueryBuilder()
      .relation(ChatsModel, 'users')
      .of(dto.chatRoomIds)
      .add(dto.userId);
  }

  async checkChatExist(chatId: number | number[]) {
    if (!Array.isArray(chatId)) {
      chatId = [chatId];
    }
    const chat = await this.chatsRepository.exists({
      where: { id: In(chatId) },
    });

    if (!chat) {
      throw new Error('존재하지 않는 채팅방입니다.');
    }

    return chat;
  }

  // TODO 단순히 존재하는 지 확인하는 용도이므로 조인이 필요없을 것 같다. ManyToMany 관계의 테이블에서 존재하는지 확인하는 방법을 찾아보자.
  async existChatUser(chatId: number, userId: number) {
    const chat = await this.chatsRepository.findOne({
      where: { id: chatId },
      relations: ['users'],
    });

    return chat.users.some((user) => +user.id === userId);
  }
}
