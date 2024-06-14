import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { LogInterceptor } from 'src/common/interceptor/log.interceptor';
import { PaginateCommentDto } from './dto/paginte-comment.dto';
import { CommentsModel } from './entity/comments.entity';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * @description
   * Entity: Comment
   * author: User
   * post: Post
   * comment: string
   * likeCount: number
   *
   * id @PrimaryGeneratedColumn
   * createdAt @CreateDateColumn
   * updatedAt @UpdateDateColumn
   */

  @Get()
  @UseInterceptors(LogInterceptor)
  getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: PaginateCommentDto,
  ) {
    return this.commentsService.paginateComments(query, postId);
  }

  @Get(':id')
  getCommentById(@Param('id') id: string): Promise<CommentsModel> {
    return this.commentsService.getCommentById(+id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  createComment(
    @Body() commentDto: CreateCommentDto,
    @Param('postId', ParseIntPipe) postId: number,
    @User('id') userId: number,
  ) {
    return this.commentsService.createComment(commentDto, postId, userId);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  updateComment(
    @Body() commentDto: UpdateCommentDto,
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ) {
    return this.commentsService.updateComment(id, commentDto, userId);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ) {
    return this.commentsService.deleteComment(id, userId);
  }
}
