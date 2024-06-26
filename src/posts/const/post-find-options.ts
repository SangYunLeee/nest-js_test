import { FindManyOptions } from 'typeorm';
import { PostsModel } from '../entity/posts.entitiy';

export const POST_FIND_OPTIONS: FindManyOptions<PostsModel> = {
  select: {
    id: true,
    title: true,
    content: true,
    createdAt: true,
    updatedAt: true,
  },
  relations: {
    images: true,
    author: true,
  },
};
