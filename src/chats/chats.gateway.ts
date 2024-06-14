import {
  WebSocketGateway,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  WsException,
  OnGatewayInit,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat-dto';
import { ChatsService } from './chats.service';
import { EnterChatDto } from './dto/enter-chat.dto';
import { CreateChatMessageDto } from './messages/dto/create-chat-message.dto';
import { ChatMassagesService } from './messages/messages.service';
import {
  UnauthorizedException,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SocketExceptionFilter } from 'src/common/exception-filter/socket.exception-filter';
import { SocketBearerTokenGuard } from 'src/auth/guard/socket-bearer-token.guard';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { UsersModel } from 'src/users/entity/users.entity';
@WebSocketGateway({
  namespace: 'chats',
})
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messageService: ChatMassagesService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
  }
  afterInit(server: any) {
    console.log('Socket server initialized');
  }

  @WebSocketServer()
  server: Server;

  async handleConnection(
    client: Socket & { user: UsersModel },
    ...args: any[]
  ) {
    console.log('Client connected:', client.id);
    const rawToken = client.handshake.headers['authorization'];
    try {
      if (!rawToken) {
        throw new UnauthorizedException('토큰이 없습니다!');
      }
      const token = this.authService.extractTokenFromHeader(rawToken, true);
      const paload = await this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(paload.email);
      client.user = user;
      return true;
    } catch (exception: any) {
      client.emit('exception', { data: exception.getResponse() });
      client.disconnect();
    }
  }

  @UseFilters(SocketExceptionFilter)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() message: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const chat = await this.chatsService.createChat(message);
    console.log('created chat:', chat);
    return message;
  }

  @UseFilters(SocketExceptionFilter)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @SubscribeMessage('enter_chat')
  async enterChat(
    @MessageBody() enterDto: EnterChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Client message:', enterDto);
    try {
      await Promise.all(
        enterDto.chatRoomIds.map((chatId) =>
          this.chatsService.checkChatExist(chatId),
        ),
      );
    } catch (exeption: any) {
      throw new WsException(exeption.message);
    }

    await client.join(enterDto.chatRoomIds.map((chatId) => chatId.toString()));
  }

  @UseFilters(SocketExceptionFilter)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() dto: CreateChatMessageDto,
    @ConnectedSocket() client: Socket & { user: UsersModel },
  ) {
    try {
      await this.chatsService.checkChatExist(dto.chatId);
    } catch (exeption: any) {
      throw new WsException(exeption.message);
    }
    const message = await this.messageService.createMessage(
      dto,
      client.user.id,
    );
    // 나 빼고 모두에게
    client.to(message.chat.id.toString()).emit('receive_message', dto.message);
    // 나 포함 모두에게
    this.server
      .in(message.chat.id.toString())
      .emit('receive_message', dto.message);
  }
}
