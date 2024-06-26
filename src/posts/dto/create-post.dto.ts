import { IsOptional, IsString } from 'class-validator';
import { PostsModel } from '../entity/posts.entitiy';
import { PickType } from '@nestjs/mapped-types';

export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsOptional()
  @IsString({ each: true })
  images: string[] = [];
}
