import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}
  async create({ category, data, price, title, type }: CreateTransactionDto) {
    const createdTransaction = await this.prisma.transaction.create({
      data: {
        title,
        category,
        data,
        price,
        type,
      },
    });
    return createdTransaction;
  }

  async findAll(page = 1, limit = 5) {
    const pageNumber = Number.isInteger(page) && page > 0 ? page : 1;
    const limitNumber = Number.isInteger(limit) && limit > 0 ? limit : 5;

    const skip = (pageNumber - 1) * limitNumber;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        skip,
        take: limitNumber,
        orderBy: { data: 'desc' },
      }),
      this.prisma.transaction.count(),
    ]);

    const lastPage = Math.ceil(total / limitNumber);

    return {
      data,
      total,
      page: pageNumber,
      lastPage,
    };
  }

  async findOne(id: string) {
    const foundTransaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    return foundTransaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    const foundTransaction = await this.findOne(id);

    if (!foundTransaction) {
      throw new BadRequestException(`Transaction with id ${id} not found`);
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });
    return updatedTransaction;
  }

  async remove(id: string) {
    const foundTransaction = await this.findOne(id);

    if (!foundTransaction) {
      throw new BadRequestException(`Transaction with id ${id} not found`);
    }

    await this.prisma.transaction.delete({
      where: { id },
    });
  }
}
