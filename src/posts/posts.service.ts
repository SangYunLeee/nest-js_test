import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entitiy';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginte-post.dto';
import { CommonService } from 'src/common/common.service';
import {
  POSTS_FOLDER_PATH,
  TEMP_FOLDER_PATH,
} from 'src/common/const/serve-file.const';
import { join } from 'path';
import { promises } from 'fs';
import { ImagesModel } from 'src/common/entities/image.entity';
import { CreatePostImageDto } from './images/dto/create-image.dto';
import { POST_FIND_OPTIONS } from './const/post-find-options';
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    @InjectRepository(ImagesModel)
    private readonly imagesRepository: Repository<ImagesModel>,
    private readonly commonService: CommonService,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({
      ...POST_FIND_OPTIONS,
    });
  }

  async getPostById(id: number): Promise<PostsModel> {
    const post = await this.postsRepository.findOne({
      ...POST_FIND_OPTIONS,
      where: { id },
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async createPostImage(postImgDto: CreatePostImageDto) {
    if (!postImgDto.path) {
      return true;
    }
    const postImagePath = join(TEMP_FOLDER_PATH, postImgDto.path);
    try {
      await promises.access(postImagePath);
    } catch (error) {
      throw new NotFoundException('이미지를 찾을 수 없습니다.');
    }
    const postMovedImagePath = join(POSTS_FOLDER_PATH, postImgDto.path);
    this.imagesRepository.save(postImgDto);
    await promises.rename(postImagePath, postMovedImagePath);
    return true;
  }

  async createPost(
    postDto: CreatePostDto,
    authorId: number,
  ): Promise<PostsModel> {
    const post = this.postsRepository.create({
      ...postDto,
      author: { id: authorId },
      likeCount: 0,
      commentCount: 0,
      images: [],
    });
    return this.postsRepository.save(post);
  }

  async deletePostById(id: number): Promise<void> {
    const post = await this.getPostById(id);
    await this.postsRepository.remove(post);
  }

  async updatePost(postId: number, postDto: UpdatePostDto) {
    // save의 기능
    // 1) 만약에 데이터가 존재하지 않는다면 (id 기준으로) 새로 생성한다.
    // 2) 만약에 데이터가 존재한다면 (같은 id의 값이 존재한다면) 존재하던 값을 업데이트한다.

    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    if (postDto.title) {
      post.title = postDto.title;
    }

    if (postDto.content) {
      post.content = postDto.content;
    }

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      POST_FIND_OPTIONS,
      'posts',
    );
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(
        {
          title: `임의 제목: ${i}`,
          content: `임의 내용:  ${i}`,
          images: [],
        },
        userId,
      );
    }
    return true;
  }
}
