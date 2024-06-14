import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessagesModel } from './entities/messages.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { PaginateChatMessageDto } from './dto/paginate-chat-message.dto';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

@Injectable()
export class ChatMassagesService {
  constructor(
    @InjectRepository(MessagesModel)
    private readonly chatMessagesRepository: Repository<MessagesModel>,
    private readonly commonService: CommonService,
  ) {}

  paginateMessages(
    dto: PaginateChatMessageDto,
    overrideOptions?: FindManyOptions<MessagesModel>,
  ) {
    return this.commonService.paginate(
      dto,
      this.chatMessagesRepository,
      {
        relations: ['author', 'chat'],
        ...overrideOptions,
      },
      'chatMessages',
    );
  }

  async createMessage(dto: CreateChatMessageDto, authorId: number) {
    const message = await this.chatMessagesRepository.save({
      message: dto.message,
      chat: { id: dto.chatId },
      author: { id: authorId },
    });

    console.log('message:', message);

    return this.chatMessagesRepository.findOne({
      where: { id: message.id },
      relations: ['author', 'chat'],
    });
  }
}
