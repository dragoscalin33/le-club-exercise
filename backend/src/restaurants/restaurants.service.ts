import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { User } from '../users/user.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantsRepository: Repository<Restaurant>,
  ) {}

  findAll(): Promise<Restaurant[]> {
    return this.restaurantsRepository.find({
      relations: ['createdBy'],
      select: {
        createdBy: { id: true, email: true, role: true },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantsRepository.findOne({
      where: { id },
      relations: ['createdBy'],
      select: {
        createdBy: { id: true, email: true, role: true },
      },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${id} not found`);
    }
    return restaurant;
  }

  async create(dto: CreateRestaurantDto, user: User): Promise<Restaurant> {
    const restaurant = this.restaurantsRepository.create({
      ...dto,
      createdBy: user,
    });
    const saved = await this.restaurantsRepository.save(restaurant);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateRestaurantDto): Promise<Restaurant> {
    const restaurant = await this.findOne(id);
    Object.assign(restaurant, dto);
    return this.restaurantsRepository.save(restaurant);
  }

  async remove(id: number): Promise<void> {
    const restaurant = await this.findOne(id);
    await this.restaurantsRepository.remove(restaurant);
  }
}
