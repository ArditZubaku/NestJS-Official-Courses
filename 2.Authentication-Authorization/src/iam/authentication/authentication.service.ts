import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDTO } from './dto/sign-up.dto';
import { SignInDTO } from './dto/sign-in.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
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
      const pgUniquenessViolationErrorCode = '23505';
      if (error.code === pgUniquenessViolationErrorCode) {
        throw new ConflictException();
      }

      throw error;
    }
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

    // TODO:
    return true;
  }
}
