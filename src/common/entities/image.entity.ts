import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from './base.entity';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { join } from 'path';
import {
  BASE_URL,
  POSTS_FOLDER_NAME,
  PUBLIC_FOLDER_NAME,
} from '../const/serve-file.const';
import { PostsModel } from 'src/posts/entities/posts.entitiy';

export enum ImageModelType {
  POST_IMAGE,
}

@Entity()
export class ImagesModel extends BaseModel {
  @Column({
    default: 0,
  })
  @IsInt()
  @IsOptional()
  order: number;

  // UsersModel -> 사용자 프로필 이미지
  // PostsModel -> 포스트 이미지
  @Column({
    enum: ImageModelType,
  })
  @IsEnum(ImageModelType)
  @IsString()
  type: ImageModelType;

  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    if (obj.type === ImageModelType.POST_IMAGE) {
      return `${BASE_URL}/${join(PUBLIC_FOLDER_NAME, POSTS_FOLDER_NAME, value)}`;
    } else {
      return value;
    }
  })
  path: string;

  @ManyToOne((type) => PostsModel, (post) => post.images)
  post?: PostsModel;
}
