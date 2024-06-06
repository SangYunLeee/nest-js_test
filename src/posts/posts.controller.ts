import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './entities/posts.entitiy';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginte-post.dto';
import { ImageModelType } from 'src/common/entities/image.entity';
import { DataSource } from 'typeorm';

@Controller('posts')
export default class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly datasource: DataSource,
  ) {}

  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  // 포스트 생성
  @Post()
  @UseGuards(AccessTokenGuard)
  async createPost(
    @Body() postDto: CreatePostDto,
    @User('id') userId: number,
  ): Promise<PostsModel> {
    const qr = this.datasource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const post = await this.postsService.createPost(postDto, userId, qr);

      for (let i = 0; i < postDto.images.length; i++) {
        await this.postsService.createPostImage({
          path: postDto.images[i],
          post: post,
          order: i,
          type: ImageModelType.POST_IMAGE,
        });
      }
      await qr.commitTransaction();
      return await this.postsService.getPostById(post.id);
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  createPostRandom(@User('id') userId: number) {
    return this.postsService.generatePosts(userId);
  }

  @Get(':id')
  getPostById(@Param('id') id: string): Promise<PostsModel> {
    return this.postsService.getPostById(+id);
  }

  @Patch(':postId')
  patchPost(
    @Param('postId', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  deletePostById(@Param('id') id: string): Promise<void> {
    return this.postsService.deletePostById(+id);
  }
}
