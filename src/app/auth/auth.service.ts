import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BaseResponse from 'src/utils/response/base.response';
import { User } from './auth.entity';
import { Repository } from 'typeorm';
import { ResponseSuccess } from 'src/interface/response/response.interface';
import { LoginDto, RegisterDto } from './auth.dto';
import { compare, hash } from 'bcrypt'; //import hash
import { JwtService } from '@nestjs/jwt';
import { jwt_config } from 'src/config/jwt.config';
import { JwtPayload } from './auth.interface';

@Injectable()
export class AuthService extends BaseResponse {
  constructor(
    @InjectRepository(User) private readonly authRepository: Repository<User>,
    private jwtService: JwtService, // panggil kelas jwt service
  ) {
    super();
  }

  private generateJWT(
    payload: JwtPayload,
    expiresIn: string | number,
    secret: string,
  ) {
    return this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: expiresIn,
    });
  } //membuat method untuk generate jwt

  async register(payload: RegisterDto): Promise<ResponseSuccess> {
    const checkUserExists = await this.authRepository.findOne({
      where: {
        email: payload.email,
      },
    });
    if (checkUserExists) {
      throw new HttpException(
        'User already registered',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    payload.password = await hash(payload.password, 12); //hash password
    await this.authRepository.save(payload);

    return this._success('Register Berhasil');
  }
  async login(payload: LoginDto): Promise<ResponseSuccess> {
    const checkUserExists = await this.authRepository.findOne({
      where: {
        email: payload.email,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        password: true,
        refresh_token: true,
      },
    });

    if (!checkUserExists) {
      throw new HttpException(
        'User tidak ditemukan',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const checkPassword = await compare(
      payload.password,
      checkUserExists.password,
    );
    if (checkPassword) {
      const jwtPayload: JwtPayload = {
        id: checkUserExists.id,
        nama: checkUserExists.nama,
        email: checkUserExists.email,
      };

      const access_token = await this.generateJWT(
        jwtPayload,
        '1d',
        jwt_config.access_token_secret,
      ); //expired untuk access token adalah 1 hari dari ketika di buat
      const refresh_token = await this.generateJWT(
        jwtPayload,
        '7d',
        jwt_config.refresh_token_secret,
      ); //expired untuk access token adalah 7 hari dari ketika di buat
      await this.authRepository.save({
        refresh_token: refresh_token,
        id: checkUserExists.id,
      }); // simpan refresh token ke dalam tabel
      return this._success('Login Success', {
        ...checkUserExists,
        access_token: access_token, // tambakan access_token ketika return
        refresh_token: refresh_token, // tambakan refresh_token ketika return
      });
    } else {
      throw new HttpException(
        'email dan password tidak sama',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
  async refreshToken(id: number, token: string): Promise<ResponseSuccess> {
    const checkUserExists = await this.authRepository.findOne({
      where: {
        id: id,
        refresh_token: token,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        password: true,
        refresh_token: true,
      },
    });

    console.log('user', checkUserExists);
    if (checkUserExists === null) {
      throw new UnauthorizedException();
    }

    const jwtPayload: JwtPayload = {
      id: checkUserExists.id,
      nama: checkUserExists.nama,
      email: checkUserExists.email,
    };

    const access_token = await this.generateJWT(
      jwtPayload,
      '1d',
      jwt_config.access_token_secret,
    );

    const refresh_token = await this.generateJWT(
      jwtPayload,
      '7d',
      jwt_config.refresh_token_secret,
    );

    await this.authRepository.save({
      refresh_token: refresh_token,
      id: checkUserExists.id,
    });

    return this._success('Success', {
      ...checkUserExists,
      access_token: access_token,
      refresh_token: refresh_token,
    });
  }
}
