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
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { SignUpDTO, SignInDTO } from './dto';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenIDsStorage } from './refresh-token-ids.storage';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIDsStorage: RefreshTokenIDsStorage,
  ) {}

  async signUp(signUpDTO: SignUpDTO): Promise<void> {
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

  async signIn(
    signInDTO: SignInDTO,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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

    return await this.generateTokens(user);
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { sub, refreshTokenID } = await this.jwtService.verifyAsync<{
        sub: number;
        refreshTokenID: string;
      }>(refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.usersRepository.findOneByOrFail({ id: sub });

      const isValid = await this.refreshTokenIDsStorage.validate(
        user.id,
        refreshTokenID,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Invalidate the old refresh token
      await this.refreshTokenIDsStorage.invalidate(user.id);

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshTokenID = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTTL,
        { email: user.email },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTTL, {
        refreshTokenID,
      }),
    ]);

    // Store the refresh token ID
    await this.refreshTokenIDsStorage.insert(user.id, refreshTokenID);

    return { accessToken, refreshToken };
  }

  private async signToken<T>(
    userID: number,
    expiresIn: number,
    payload?: T,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: userID,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  // Helper methods to get TTL values
  getAccessTokenTTL(): number {
    return this.jwtConfiguration.accessTokenTTL;
  }

  getRefreshTokenTTL(): number {
    return this.jwtConfiguration.refreshTokenTTL;
  }
}
