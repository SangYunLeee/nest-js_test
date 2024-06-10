import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async createUser(
    user: Pick<UsersModel, 'nickname' | 'email' | 'password'>,
  ): Promise<UsersModel> {
    const existNickname = await this.usersRepository.exists({
      where: { nickname: user.nickname },
    });
    if (existNickname) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }

    const existEmail = await this.usersRepository.exists({
      where: { email: user.email },
    });
    if (existEmail) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    return this.usersRepository.save(user);
  }

  async getUserById(id: string): Promise<UsersModel> {
    return this.usersRepository.findOne({ where: { id: +id } });
  }

  async getUsersByIds(ids: number[]): Promise<UsersModel[]> {
    return this.usersRepository.find({
      where: { id: In(ids) },
    });
  }

  async getAllUsers(): Promise<UsersModel[]> {
    return this.usersRepository.find();
  }

  async getUserByEmail(email: string): Promise<UsersModel> {
    return this.usersRepository.findOne({ where: { email } });
  }
}
