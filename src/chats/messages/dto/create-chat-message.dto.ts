import { PickType } from '@nestjs/mapped-types';
import { IsNumber, IsString } from 'class-validator';
import { MessagesModel } from '../entities/messages.entity';

export class CreateChatMessageDto extends PickType(MessagesModel, ['message']) {
  @IsNumber()
  chatId: number;
}
