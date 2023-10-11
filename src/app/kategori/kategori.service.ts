import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BaseResponse from 'src/utils/response/base.response';
import { Kategori } from './kategori.entity';
import {
  CreateKategoriDto,
  UpdateKategoriDto,
  findAllKategori,
} from './kategori.dto';
import {
  ResponsePagination,
  ResponseSuccess,
} from '../../interface/response/response.interface';
import { Like, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class KategoriService extends BaseResponse {
  constructor(
    @InjectRepository(Kategori)
    private readonly kategoriRepository: Repository<Kategori>,
    @Inject(REQUEST) private req: any, // inject request agar bisa mengakses req.user.id dari  JWT token pada service
  ) {
    super();
  }

  async getAllCategory(query: findAllKategori): Promise<ResponsePagination> {
    const { page, pageSize, limit, nama_kategori } = query;

    const filterQuery: {
      [key: string]: any;
    } = {};
    if (nama_kategori) {
      filterQuery.nama_kategori = Like(`%${nama_kategori}%`);
    }
    const total = await this.kategoriRepository.count({
      where: filterQuery,
    });
    const result = await this.kategoriRepository.find({
      where: filterQuery,
      relations: ['created_by', 'updated_by'],
      select: {
        id: true,
        nama_kategori: true,
        created_by: {
          id: true,
          nama: true,
        },
        updated_by: {
          id: true,
          nama: true,
        },
      },
      skip: limit,
      take: pageSize,
    });

    return this._pagination('OK', result, total, page, pageSize);
  }

  async getDetail(id: number): Promise<ResponseSuccess> {
    const detail = await this.kategoriRepository.findOne({
      where: {
        id,
      },
    });
    if (detail === null) {
      throw new HttpException(
        `Kategori dengan ${id} tidak ditemukan`,
        HttpStatus.NOT_FOUND,
      );
    } else {
      return {
        status: 'Success',
        message: 'Detail kategori ditemukan',
        data: detail,
      };
    }
  }

  async create(payload: CreateKategoriDto): Promise<ResponseSuccess> {
    try {
      await this.kategoriRepository.save(payload);

      return this._success('OK', payload);
    } catch {
      throw new HttpException('Ada Kesalahan', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async createBulk(payload: CreateKategoriDto[]): Promise<ResponseSuccess> {
    console.log(payload);
    try {
      const kategori = payload.map((kategoriDto) => ({
        ...kategoriDto,
        created_by: { id: this.req.user.id },
      }));

      await this.kategoriRepository.save(kategori);

      return this._success('create bulk berhasil', payload);
    } catch (error) {
      throw new HttpException('Ada Kesalahan', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async updateKategori(
    id: number,
    payload: UpdateKategoriDto,
  ): Promise<ResponseSuccess> {
    const check = await this.kategoriRepository.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Kategori dengan id ${id} tidak ditemukan`);

    const update = await this.kategoriRepository.save({ ...payload, id: id });
    return {
      status: 'Success',
      message: 'Kategori berhasil di update',
      data: update,
    };
  }
  async deleteKategori(id: number): Promise<ResponseSuccess> {
    const check = await this.kategoriRepository.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Kategori dengan id ${id} tidak ditemukan`);
    await this.kategoriRepository.delete(id);
    return {
      status: 'Success',
      message: 'Berhasil menghapus kategori',
    };
  }
}
