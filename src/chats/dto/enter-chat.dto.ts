import { IsNumber } from 'class-validator';

export class EnterChatDto {
  @IsNumber({}, { each: true })
  chatRoomIds: number[];

  @IsNumber()
  userId: number;
}
