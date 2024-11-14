import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';

@Module({
  providers: [
    {
      provide: HashingService,
      // If we ever want to switch to a different hashing algorithm, we can just switch the implementation here
      useClass: BcryptService,
    },
  ],
})
export class IamModule {}
