import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDTO } from './dto/sign-up.dto';
import { SignInDTO } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService, ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signUp(signUpDTO: SignUpDTO) {
    try {
      //const user = new User(signUpDTO.email, await this.hashingService.hash(signUpDTO.password));
      //user.email = signUpDTO.email;
      //user.password = await this.hashingService.hash(signUpDTO.password);

      await this.usersRepository.save(
        new User(
          signUpDTO.email,
          await this.hashingService.hash(signUpDTO.password),
        ),
      );
    } catch (error) {
      // SQLite uses a constraint error with code 'SQLITE_CONSTRAINT' for uniqueness violations
      const sqliteUniquenessViolationCode = 'SQLITE_CONSTRAINT';

      if (
        error.code === sqliteUniquenessViolationCode &&
        error.message.includes('UNIQUE')
      ) {
        throw new ConflictException();
      }

      throw error;
    }
    //} catch (error) {
    //const pgUniquenessViolationErrorCode = '23505';
    //if (error.code === pgUniquenessViolationErrorCode) {
    //throw new ConflictException();
    //}

    //throw error;
    //}
  }

  async signIn(signInDTO: SignInDTO) {
    const user = await this.usersRepository.findOneBy({
      email: signInDTO.email,
    });

    if (!user) {
      throw new UnauthorizedException('User does not exist!');
    }

    const isValid = await this.hashingService.compare(
      signInDTO.password,
      user.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Wrong password!');
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.accessTokenTTL,
      },
    );

    return {
      accessToken,
    };
  }
}
