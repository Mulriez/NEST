import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Delete,
  Body,
} from '@nestjs/common';
import { KategoriService } from './kategori.service';
import {
  CreateKategoriDto,
  UpdateKategoriDto,
  findAllKategori,
} from './kategori.dto';
import { JwtGuard } from '../auth/auth.guard';
import { Pagination } from 'src/utils/decorator/pagination.decorator';
import { InjectCreatedBy } from 'src/utils/decorator/inject-created_by.decorator'; //import disini
import { InjectUpdatedBy } from 'src/utils/decorator/inject-updated_by.decorator';

@UseGuards(JwtGuard)
@Controller('kategori')
export class KategoriController {
  constructor(private kategoriService: KategoriService) {}

  @Get('list')
  async getAllCategory(@Pagination() query: findAllKategori) {
    return this.kategoriService.getAllCategory(query);
  }
  @Get('detail/:id')
  getDetailBooks(@Param('id') id: number) {
    return this.kategoriService.getDetail(id);
  }
  @Post('create')
  async create(@InjectCreatedBy() payload: CreateKategoriDto) {
    //ganti @Body() dengan @InjectCreatedBy()
    return this.kategoriService.create(payload);
  }
  @Post('createBulk')
  async createBull(@Body() payload: CreateKategoriDto[]) {
    return this.kategoriService.createBulk(payload);
  }
  @Put('update/:id')
  updateKategori(
    @Param('id') id: string,
    @InjectUpdatedBy() payload: UpdateKategoriDto,
  ) {
    return this.kategoriService.updateKategori(Number(id), payload);
  }
  @Delete('delete/:id')
  deleteBook(@Param('id') id: string) {
    return this.kategoriService.deleteKategori(+id);
  }
}
