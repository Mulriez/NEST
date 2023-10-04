import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { Between, Like, Repository } from 'typeorm';
import { CreateBookDto, FindBookDto, UpdateBookDto } from './book.dto';
import {
  ResponsePagination,
  ResponseSuccess,
} from 'src/interface/response/response.interface';
import BaseResponse from 'src/utils/response/base.response';

@Injectable()
export class BookService extends BaseResponse {
  constructor(
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
  ) {
    super();
  }
  // async getAllBooks() {
  //   const books = await this.bookRepository.find();
  //   return {
  //     data: books,
  //   };
  // }
  async getAllBooks(query: FindBookDto): Promise<ResponsePagination> {
    console.log('uqwey', query);
    const { page, pageSize, limit, title, author, from_year, to_year } = query;
    const filter: {
      [key: string]: any;
    } = {};

    if (title) {
      filter.title = Like(`%${title}%`);
    }
    if (author) {
      filter.author = Like(`%${author}%`);
    }

    if (from_year && to_year) {
      filter.year = Between(from_year, to_year);
    }

    if (from_year && !!to_year === false) {
      filter.year = Between(from_year, from_year);
    }

    const total = await this.bookRepository.count({ where: filter });
    const book = await this.bookRepository.find({
      where: filter,
      skip: limit,
      take: pageSize,
    });

    return this._pagination('Success', book, total, page, pageSize);

    // return {
    //   status: 'Success',
    //   message: 'List Buku ditermukan',
    //   data: book,
    //   pagination: {
    //     total: total,
    //     page: page,
    //     pageSize: pageSize,
    //   },
    // };
  }

  async getDetail(id: number): Promise<ResponseSuccess> {
    const detail = await this.bookRepository.findOne({
      where: {
        id,
      },
    });
    if (detail === null) {
      throw new HttpException(
        `Buku dengan ${id} tidak ditemukan`,
        HttpStatus.NOT_FOUND,
      );
    } else {
      return {
        status: 'Success',
        message: 'Detail buku ditemukan',
        data: detail,
      };
    }
  }

  async create(payload: CreateBookDto): Promise<ResponseSuccess> {
    try {
      await this.bookRepository.save(payload);
      return this._success('Create berhasil', payload);
    } catch (error) {
      throw new HttpException('Ada yang salah :(', HttpStatus.BAD_REQUEST);
    }
  }
  async updateBook(
    id: number,
    updateBookDto: UpdateBookDto,
  ): Promise<ResponseSuccess> {
    const check = await this.bookRepository.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Buku dengan id ${id} tidak ditemukan`);

    const update = await this.bookRepository.save({ ...updateBookDto, id: id });
    return {
      status: 'Success',
      message: 'Buku berhasil di update',
      data: update,
    };
  }
  async deleteBook(id: number): Promise<ResponseSuccess> {
    const check = await this.bookRepository.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Buku dengan id ${id} tidak ditemukan`);
    await this.bookRepository.delete(id);
    return {
      status: 'Success',
      message: 'Berhasil menghapus buku',
    };
  }
}
