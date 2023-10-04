import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root', // username default xampp root
  password: '',
  database: 'belajar_nest_js',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: true,
};
