import { INestApplication, ValidationPipe } from '@nestjs/common';
import { requestIdMiddleware } from './request-id.middleware';
import { HttpProblemFilter } from './http-problem.filter';
import { RequestLogInterceptor } from './request-log.interceptor';

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
  app.use(requestIdMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpProblemFilter());
  app.useGlobalInterceptors(new RequestLogInterceptor());
}
