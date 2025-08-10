import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true); // allow Postman, curl, etc.
      const allowedOrigins = [
        'https://beblocky.com',
        'https://www.beblocky.com',
        'https://admin.beblocky.com',
        'https://code.beblocky.com',
        'https://ide.beblocky.com',
      ];
      const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin);
      const isLocalIP = /^http:\/\/(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(origin);
      const isSubdomain = /^https:\/\/[a-zA-Z0-9-]+\.beblocky\.com$/.test(
        origin,
      );

      if (
        allowedOrigins.includes(origin) ||
        isLocalhost ||
        isLocalIP ||
        isSubdomain
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  await app.listen(process.env.PORT || 2000);
  console.log(`Application is running on port 8000`);
}

bootstrap().catch((err) => {
  console.error('Failed to start the application:', err);
  process.exit(1);
});
