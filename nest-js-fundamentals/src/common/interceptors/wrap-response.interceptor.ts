import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // console.log(context);

    console.log('Before...');

    // Must be called or the route handler wont be executed at all
    // return next.handle().pipe(tap((data) => console.log('After...', data)));
    // Transforming the result of the route handler (controller)
    return next.handle().pipe(map((data) => ({ data })));
  }
}
