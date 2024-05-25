import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import PostsController from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entitiy';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerOption } from 'src/common/const/multer.const';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [
    TypeOrmModule.forFeature([PostsModel]),
    AuthModule,
    UsersModule,
    CommonModule,
    MulterModule.register(multerOption),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
