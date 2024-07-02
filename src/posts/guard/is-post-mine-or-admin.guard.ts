import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PostsService } from '../posts.service';
import { RolesEnum } from 'src/users/const/roles.const';

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { user } = req;
    if (!user) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
    if (user.role === RolesEnum.ADMIN) {
      return true;
    }
    const { postId } = req.params;

    const isOk = await this.postsService.isPostMine(Number(postId), user.id);
    if (!isOk) {
      throw new UnauthorizedException('권한이 없습니다.');
    }
    return true;
  }
}
