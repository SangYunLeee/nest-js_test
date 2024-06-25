import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const myUUID = generateShortUUID();
    const req = context.switchToHttp().getRequest();
    const now = Date.now();
    console.log(
      `[REQ] ${myUUID} ${req.originalUrl} ${new Date(now).toLocaleString('ko')}`,
    );
    return next.handle().pipe(
      catchError(async (e: HttpException) => {
        console.error(`[ERR] ${myUUID} ${req.originalUrl}`);
        console.error(`stack: \n ${e.stack}`);
        console.log(
          `[RES] ${myUUID} ${req.originalUrl} ${new Date().toLocaleString('ko')} ${Date.now() - now}ms`,
        );
        throw e;
      }),
      tap((observable) => {
        console.log(
          `[RES] ${myUUID} ${req.originalUrl} ${new Date().toLocaleString('ko')} ${Date.now() - now}ms`,
        );
      }),
    );
  }
}

function generateShortUUID() {
  const fullUUID = uuidv4();
  return fullUUID.split('-')[0];
}
