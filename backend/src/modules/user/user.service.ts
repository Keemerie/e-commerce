import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../../../generated/prisma/client';
import { Nullable } from '../../custom';
import { PrismaService } from '../../prisma.service';
import { OAuthUser } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findById(id: string): Promise<Nullable<User>> {
    return await this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<Nullable<User>> {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async createUserViaOAuth(user: OAuthUser): Promise<User> {
    return await this.prismaService.user.create({
      data: {
        name: user.name,
        email: user.email,
        avatar: user.picture,
      },
    });
  }

  async register(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    return this.prismaService.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: await hash(dto.password),
      },
    });
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    const updated = await this.prismaService.user.update({
      where: { id },
      data: {
        refreshToken,
      },
    });

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }
}
