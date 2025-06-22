import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { CloudinaryService } from '../../cloudinary/services/cloudinary.service';
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async create(createUserDto: CreateUserDto, file: Express.Multer.File): Promise<User> {
    if (file) {
      const imageUrl = await this.cloudinaryService.uploadFile(file);
      createUserDto.image = imageUrl; 
    }
    return this.userRepository.create(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findByIdAndUpdate(id, updateUserDto);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async remove(id: string): Promise<User> {
    const user = await this.userRepository.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
