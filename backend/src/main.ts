import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

import { AppModule } from '@/app.module';
import { setupSwagger } from '@/config/swagger.config';

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin
      ? corsOrigin.split(',').map((origin) => origin.trim())
      : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.use(cookieParser());
  setupSwagger(app);

  await app.listen(process.env.SERVER_PORT ?? 3000, () =>
    console.log(
      `Server successfully started on port: ${process.env.SERVER_PORT}`,
    ),
  );
}

void bootstrap();
