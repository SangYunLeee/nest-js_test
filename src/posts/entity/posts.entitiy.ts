import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { join } from 'path';
import {
  POSTS_FOLDER_NAME,
  PUBLIC_FOLDER_NAME,
} from 'src/common/const/serve-file.const';
import { BaseModel } from 'src/common/entity/base.entity';
import { ImagesModel } from 'src/common/entity/image.entity';
import { UsersModel } from 'src/users/entity/users.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CommentsModel } from '../comments/entity/comments.entity';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @Column()
  @IsString()
  title: string;

  @Column()
  @IsString()
  content: string;

  @Column({
    default: 0,
  })
  likeCount: number;

  @Column({
    default: 0,
  })
  commentCount: number;

  @OneToMany((type) => ImagesModel, (image) => image.post)
  images: ImagesModel[];

  @OneToMany((type) => CommentsModel, (comment) => comment.post)
  comments: CommentsModel[];
}
