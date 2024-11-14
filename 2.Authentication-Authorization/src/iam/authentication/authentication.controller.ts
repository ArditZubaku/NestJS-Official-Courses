import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDTO } from './dto/sign-up.dto';
import { SignInDTO } from './dto/sign-in.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-up')
  signUp(@Body() signUpDTO: SignUpDTO) {
    return this.authenticationService.signUp(signUpDTO);
  }

  // Since by default for a successful operation Nest returns 201, for this case we want 200
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDTO: SignInDTO) {
    return this.authenticationService.signIn(signInDTO);
  }
}
