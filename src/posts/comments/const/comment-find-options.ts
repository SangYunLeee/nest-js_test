import { FindManyOptions } from 'typeorm';
import { CommentsModel } from '../entity/comments.entity';

export const COMMENT_FIND_OPTIONS: FindManyOptions<CommentsModel> = {
  relations: {
    post: true,
    author: true,
  },
  select: {
    author: {
      id: true,
      nickname: true,
    },
    post: {
      id: true,
    },
  },
};
