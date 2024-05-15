import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async createUser(user: UsersModel): Promise<UsersModel> {
    return this.usersRepository.save(user);
  }

  async getUserById(id: string): Promise<UsersModel> {
    return this.usersRepository.findOne({ where: { id: +id } });
  }

  async getAllUsers(): Promise<UsersModel[]> {
    return this.usersRepository.find();
  }
}
