import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const now = Date.now();
    console.log(
      `[REQ] ${req.originalUrl} ${new Date(now).toLocaleString('ko')}`,
    );
    return next
      .handle()
      .pipe(
        tap((observable) =>
          console.log(
            `[RES] ${req.originalUrl} ${new Date().toLocaleString('ko')} ${Date.now() - now}ms`,
          ),
        ),
      );
  }
}
