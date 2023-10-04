import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto, FindBookDto, UpdateBookDto } from './book.dto';
import { Pagination } from 'src/utils/decorator/pagination.decorator';

@Controller('book')
export class BookController {
  constructor(private bookService: BookService) {}

  @Get('list')
  getAllBooks(@Pagination() query: FindBookDto) {
    console.log('query ===>', query);
    return this.bookService.getAllBooks(query);
  }

  @Get('detail/:id')
  getDetailBooks(@Param('id') id: number) {
    return this.bookService.getDetail(id);
  }

  @Post('create')
  createBook(@Body() payload: CreateBookDto) {
    // return payload;
    return this.bookService.create(payload);
  }
  @Put('update/:id')
  updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.updateBook(Number(id), updateBookDto);
  }
  @Delete('delete/:id')
  deleteBook(@Param('id') id: string) {
    return this.bookService.deleteBook(+id);
  }
}
