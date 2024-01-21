import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException>
  implements ExceptionFilter
{
  catch(exception: T, host: ArgumentsHost) {
    /*
      When you call host.switchToHttp(), you're telling NestJS to treat the current context as an HTTP context. This allows you to access HTTP-specific objects like the request and response.
    */
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const error =
      typeof response === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as object);

    // Sending response back
    response.status(status).json({
      ...error,
      timestamp: new Date().toISOString(),
    });
  }
}
