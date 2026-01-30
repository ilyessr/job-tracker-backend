import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientRustPanicError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P1001' || exception.code === 'P1002') {
        return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'DATABASE_UNAVAILABLE',
          error: 'Service Unavailable',
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'DATABASE_UNAVAILABLE',
        error: 'Service Unavailable',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'INTERNAL_SERVER_ERROR',
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
