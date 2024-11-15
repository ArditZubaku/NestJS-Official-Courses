import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard, AccessTokenGuard } from './authentication/guards';
import { RefreshTokenIDsStorage } from './authentication/refresh-token-ids.storage';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    {
      provide: HashingService,
      // If we ever want to switch to a different hashing algorithm, we can just switch the implementation here
      useClass: BcryptService,
    },
    {
      // Instead of applying this to each route, we are doing this globally
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
    AuthenticationService,
    RefreshTokenIDsStorage,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
