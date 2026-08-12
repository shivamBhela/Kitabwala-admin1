import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

interface NestErrorBody {
  message?: string | string[];
  errors?: Record<string, string[]>;
  error?: string;
}

/**
 * Normalizes every thrown error into the shape kitabwalah-admin's
 * `types/api.ts` ApiErrorResponse expects: {success:false, statusCode, message, errors?}.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = isHttpException ? (exception.getResponse() as NestErrorBody | string) : null;
    const rawMessage =
      typeof body === 'string' ? body : body?.message ?? 'Internal server error';
    const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
    const errors =
      typeof body === 'object' && body && !Array.isArray(body.message) ? body.errors : Array.isArray(rawMessage) ? { form: rawMessage } : undefined;

    if (!isHttpException) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
    });
  }
}
