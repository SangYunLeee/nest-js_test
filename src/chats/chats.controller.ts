import { Controller, Get, Query } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { PaginateChatDto } from './dto/paginate-chat.dto';
import { IsPublic } from 'src/common/decorator/is-public.decorator';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  @IsPublic()
  paginateChats(@Query() dto: PaginateChatDto) {
    return this.chatsService.paginateChat(dto);
  }
}
