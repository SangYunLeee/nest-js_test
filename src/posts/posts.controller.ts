import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './entities/posts.entitiy';
import { BearerTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entities/users.entity';

@Controller('posts')
export default class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts(): Promise<PostsModel[]> {
    return this.postsService.getAllPosts();
  }

  @Post()
  @UseGuards(BearerTokenGuard)
  createPost(
    @Body() post: PostsModel,
    @User('id') userId: number,
  ): Promise<PostsModel> {
    post.author = { id: userId } as UsersModel;
    return this.postsService.createPost(post);
  }

  @Get(':id')
  getPostById(@Param('id') id: string): Promise<PostsModel> {
    return this.postsService.getPostById(+id);
  }

  @Delete(':id')
  @UseGuards(BearerTokenGuard)
  deletePostById(@Param('id') id: string): Promise<void> {
    return this.postsService.deletePostById(+id);
  }
}
