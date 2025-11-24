import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserResponseDto } from './dto/get-user-response.dto';
import { Auth } from '../../decorators/jwt-auth.decorator';
import { SuccessDto } from '../../dto/success.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<SuccessDto> {
    const user = await this.userService.register(createUserDto);
    return new SuccessDto(!!user);
  }

  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }

  @Get(':id')
  @Auth()
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.findByIdOrFail(id);

    return new UserResponseDto(user);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }
}
