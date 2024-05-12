import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './entity/posts.entitiy';

@Controller('posts')
export default class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts(): Promise<PostsModel[]> {
    return this.postsService.getAllPosts();
  }

  @Post()
  createPost(@Body() post: PostsModel): Promise<PostsModel> {
    return this.postsService.createPost(post);
  }

  @Get(':id')
  getPostById(@Param('id') id: string): Promise<PostsModel> {
    return this.postsService.getPostById(+id);
  }

  @Delete(':id')
  deletePostById(@Param('id') id: string): Promise<void> {
    return this.postsService.deletePostById(+id);
  }
}