import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  // Handles everything before it reaches the controller, or guard, or pipe or interceptor.
  use(req: any, res: any, next: () => void) {
    console.time('Request-response time');
    console.log('Middleware');

    res.on('finish', () => console.timeEnd('Request-response time'));
    // Alway call the next() function or the request will hang.
    next();
  }
}
