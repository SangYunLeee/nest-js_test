import { PostsModel } from '../entities/posts.entitiy';
import { PickType } from '@nestjs/mapped-types';

export class CreatePostDto extends PickType(PostsModel, [
  'title',
  'content',
  'image',
]) {}
