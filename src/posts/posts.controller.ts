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
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './entity/posts.entitiy';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginte-post.dto';
import { ImageModelType } from 'src/common/entity/image.entity';
import { DataSource, QueryRunner as QR } from 'typeorm';
import { LogInterceptor } from 'src/common/interceptor/log.interceptor';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { Roles } from 'src/users/decorator/role.decorator';
import { RolesEnum } from 'src/users/const/roles.const';
import { IsPublic } from 'src/common/decorator/is-public.decorator';

@Controller('posts')
export default class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly datasource: DataSource,
  ) {}

  @Get()
  @UseInterceptors(LogInterceptor)
  @IsPublic()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  // 포스트 생성
  @Post()
  @UseInterceptors(LogInterceptor)
  @UseInterceptors(TransactionInterceptor)
  async createPost(
    @Body() postDto: CreatePostDto,
    @User('id') userId: number,
    @QueryRunner() qr: QR,
  ): Promise<PostsModel> {
    const post = await this.postsService.createPost(postDto, userId, qr);

    for (let i = 0; i < postDto.images.length; i++) {
      await this.postsService.createPostImage({
        path: postDto.images[i],
        post: post,
        order: i,
        type: ImageModelType.POST_IMAGE,
      });
    }
    return await this.postsService.getPostById(post.id, qr);
  }

  @Post('random')
  createPostRandom(@User('id') userId: number) {
    return this.postsService.generatePosts(userId);
  }

  @Get(':id')
  @IsPublic()
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
  @Roles(RolesEnum.ADMIN)
  deletePostById(@Param('id') id: string): Promise<void> {
    return this.postsService.deletePostById(+id);
  }
}
