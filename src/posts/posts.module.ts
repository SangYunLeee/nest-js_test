import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import PostsController from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entitiy';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { SERVE_PATH } from 'src/common/const/serve-file.const';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [
    TypeOrmModule.forFeature([PostsModel]),
    AuthModule,
    UsersModule,
    CommonModule,
    MulterModule.register({
      // file size limit 5MB
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('지원하지 않는 파일 형식입니다.'), false);
        }
      },
      storage: multer.diskStorage({
        destination: (() => {
          console.log(process.cwd());
          return SERVE_PATH + '/public/temp';
        })(),
        filename: (req, file, cb) => {
          const now = new Date(Date.now());
          const year = now.getFullYear().toString().slice(2);
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const day = now.getDate().toString().padStart(2, '0');
          const formattedDate = `${year}${month}${day}`;
          cb(
            null,
            formattedDate +
              '__' +
              file.originalname +
              '__' +
              Math.round(Math.random() * 1e9),
          );
        },
      }),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
