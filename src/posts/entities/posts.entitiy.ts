import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { join } from 'path';
import {
  POSTS_FOLDER_NAME,
  PUBLIC_FOLDER_NAME,
} from 'src/common/const/serve-file.const';
import { BaseModel } from 'src/common/entities/base.entity';
import { ImagesModel } from 'src/common/entities/image.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

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

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;

  @OneToMany((type) => ImagesModel, (image) => image.post)
  images: ImagesModel[];
}
