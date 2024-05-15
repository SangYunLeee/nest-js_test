import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersModel } from './entities/users.entity';
import { Get, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() user: UsersModel): Promise<UsersModel> {
    console.log('user', user);
    return this.usersService.createUser(user);
  }

  @Get(':id')
  getUserById(@Param('id') id: string): Promise<UsersModel> {
    return this.usersService.getUserById(id);
  }

  @Get()
  getAllUsers(): Promise<UsersModel[]> {
    return this.usersService.getAllUsers();
  }
}
