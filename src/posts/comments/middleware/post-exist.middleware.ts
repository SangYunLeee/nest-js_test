import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class PostExistMiddleware implements NestMiddleware {
  constructor(private readonly postsService: PostsService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId;
    if (!postId) {
      throw new BadRequestException('Post ID is required');
    }
    await this.postsService.checkExistPost(+postId);
    next();
  }
}
