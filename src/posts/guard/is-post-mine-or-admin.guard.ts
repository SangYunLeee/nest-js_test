import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PostsService } from '../posts.service';

@Injectable()
export class IsPostMineOrAdmin implements CanActivate {
  constructor(private readonly postsService: PostsService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { user } = req;
    if (!user) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
    const { postId } = req.params;
    return true;
  }
}
