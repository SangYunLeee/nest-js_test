import {
  WebSocketGateway,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected:', client.id);
  }

  @SubscribeMessage('enter_chat')
  enterChat(
    @MessageBody() message: number[],
    @ConnectedSocket() client: Socket,
  ) {
    for (const chatId of message) {
      client.join(chatId.toString());
      console.log('Client joined chat:', chatId);
    }
  }

  @SubscribeMessage('send_message')
  sendMessage(
    @MessageBody() message: { message: string; chatId: number },
    @ConnectedSocket() client: Socket,
  ) {
    // 나 빼고 모두에게
    client
      .to(message.chatId.toString())
      .emit('receive_message', message.message);
    console.log('Client message:', message);
    // 나 포함 모두에게
    this.server
      .in(message.chatId.toString())
      .emit('receive_message', message.message);
  }
}
