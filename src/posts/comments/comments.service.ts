import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entity/comments.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { PaginateCommentDto } from './dto/paginte-comment.dto';
import { COMMENT_FIND_OPTIONS } from './const/comment-find-options';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  getCommentRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(CommentsModel)
      : this.commentsRepository;
  }

  async createComment(
    commentDto: CreateCommentDto,
    postId: number,
    authorId: number,
    qr?: QueryRunner,
  ): Promise<CommentsModel> {
    const repo = this.getCommentRepository(qr);
    const comment = repo.create({
      ...commentDto,
      author: { id: authorId },
      post: { id: postId },
    });
    return repo.save(comment);
  }

  async paginateComments(dto: PaginateCommentDto, postId: number) {
    return this.commonService.paginate(
      dto,
      this.commentsRepository,
      {
        ...COMMENT_FIND_OPTIONS,
        where: { post: { id: postId } },
      },
      `posts/${postId}/comments`,
    );
  }

  async getCommentById(id: number, qr?: QueryRunner): Promise<CommentsModel> {
    const repo = this.getCommentRepository(qr);
    const comment = await repo.findOne({
      ...COMMENT_FIND_OPTIONS,
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async updateComment(
    id: number,
    commentDto: UpdateCommentDto,
    userId: number,
  ) {
    const _comment = await this.commentsRepository.preload({
      id,
      ...commentDto,
    });

    if (!_comment) {
      throw new NotFoundException();
    }

    const newComment = await this.commentsRepository.save(_comment);
    return newComment;
  }

  async deleteCommentById(id: number): Promise<void> {
    const _comment = await this.getCommentById(id);
    await this.commentsRepository.remove(_comment);
  }

  async deleteComment(id: number, userId: number) {
    const comment = await this.getCommentById(id);
    if (comment.author.id !== userId) {
      throw new ForbiddenException();
    }
    await this.commentsRepository.remove(comment);
  }
}
