import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { join } from 'path';
import {
  POSTS_FOLDER_NAME,
  PUBLIC_FOLDER_NAME,
} from 'src/common/const/serve-file.const';
import { BaseModel } from 'src/common/entities/base.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

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

  @Column({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Transform(
    ({ value }) =>
      value &&
      `${join(process.env.BASE_URL, PUBLIC_FOLDER_NAME, POSTS_FOLDER_NAME, value)}`,
    { toPlainOnly: true },
  )
  image?: string;
}
