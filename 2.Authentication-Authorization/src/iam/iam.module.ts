import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: HashingService,
      // If we ever want to switch to a different hashing algorithm, we can just switch the implementation here
      useClass: BcryptService,
    },
    AuthenticationService,
  ],
  controllers: [AuthenticationController],
})
export class IamModule { }
