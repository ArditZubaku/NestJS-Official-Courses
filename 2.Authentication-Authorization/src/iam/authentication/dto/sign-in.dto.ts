import { IsEmail, MinLength } from 'class-validator';

export class SignInDTO {
  @IsEmail()
  email: string;

  @MinLength(10)
  password: string;
}
