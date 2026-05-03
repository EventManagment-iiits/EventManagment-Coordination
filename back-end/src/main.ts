import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,x-user-role,x-user-id',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('EMCP API')
    .setDescription(
      'Event Management & Coordination Platform REST API. ' +
      'Role is passed via the x-user-role header. ' +
      'User ID is passed via the x-user-id header for user-specific operations.',
    )
    .setVersion('1.0')
    .addGlobalParameters(
      { name: 'x-user-role', in: 'header', required: false, description: 'Role: SUPER_USER | ADMIN | ORGANIZER | ATTENDEE | STAFF' },
      { name: 'x-user-id', in: 'header', required: false, description: 'User ID for user-specific operations' },
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3002);
  console.log('🚀 EMCP Backend running at http://localhost:3002');
  console.log('📚 Swagger docs at http://localhost:3002/api/docs');
}
bootstrap();
