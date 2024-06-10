import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ChatMassagesService } from './messages.service';
import { PaginateChatMessageDto } from './dto/paginate-chat-message.dto';

@Controller('chats/:chatId/messages')
export class MessagesController {
  constructor(private readonly messagesService: ChatMassagesService) {}
  @Get()
  paginateMessages(
    @Query() dto: PaginateChatMessageDto,
    @Param('chatId', ParseIntPipe) chatId: number,
  ) {
    return this.messagesService.paginateMessages(dto, {
      where: { chat: { id: chatId } },
    });
  }
}
