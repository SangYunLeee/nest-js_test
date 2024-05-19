import { Injectable, NotFoundException } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entitiy';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginte-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({
      relations: ['author'],
    });
  }

  async getPostById(id: number): Promise<PostsModel> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async createPost(
    postDto: CreatePostDto,
    authorId: number,
  ): Promise<PostsModel> {
    const post = this.postsRepository.create({
      ...postDto,
      author: { id: authorId },
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

    const newPost = await this.postsRepository.save(postDto);

    return newPost;
  }

  async paginatePosts(dto: PaginatePostDto) {
    return this.postsRepository.find({
      where: {
        id: MoreThan(dto.where__id__more_than),
      },
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });
  }
}
