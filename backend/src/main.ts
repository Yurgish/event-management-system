import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import cookieParser from 'cookie-parser';

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production';
  const swaggerEnabled =
    (process.env.SWAGGER_ENABLED ?? (isProduction ? 'false' : 'true')) ===
    'true';
  const swaggerPath = process.env.SWAGGER_PATH ?? 'docs';
  const corsOriginRaw =
    process.env.CORS_ORIGIN ?? process.env.FRONTEND_URL ?? 'http://localhost:5173';
  const corsOrigins = corsOriginRaw.split(',').map((origin) => origin.trim());

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Event Management API')
      .setDescription('Backend API for event management system')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup(swaggerPath, app, swaggerDocument, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(process.env.SERVER_PORT ?? 3000, () =>
    console.log(
      `Server successfully started on port: ${process.env.SERVER_PORT}`,
    ),
  );
}

void bootstrap();
