import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { join } from 'path';
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
  @Transform(
    ({ value }) => value && `${join(process.env.BASE_URL, '/public/temp/', value)}`,
  )
  image?: string;
}
