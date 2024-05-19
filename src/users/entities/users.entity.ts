import { Column, Entity, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from 'src/posts/entities/posts.entitiy';
import { BaseModel } from 'src/common/entities/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { Exclude } from 'class-transformer';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    unique: true,
    length: 20,
  })
  @IsString()
  @Length(3, 20)
  nickname: string;

  @Column({
    unique: true,
    length: 50,
  })
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  @Length(3, 20)
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
