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
  UploadedFile,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './entities/posts.entitiy';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginte-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export default class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  // 포스트 생성
  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  createPost(
    @Body() post: CreatePostDto,
    @User('id') userId: number,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<PostsModel> {
    post.image = image?.filename;
    console.log(image);
    return this.postsService.createPost(post, userId);
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
