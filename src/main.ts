import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as config from 'config';

async function bootstrap() {
  const serverConfig = config.get('server') as any;

  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || serverConfig.port);
  logger.log(`Application listening on port`);
}
bootstrap();
