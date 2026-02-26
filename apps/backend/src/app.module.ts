import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SectionsModule } from './sections/sections.module';
import { PagesModule } from './pages/pages.module';
import { ModulesModule } from './modules/modules.module';
import { FilesModule } from './files/files.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    SectionsModule,
    PagesModule,
    ModulesModule,
    FilesModule,
    SuggestionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityHeadersMiddleware).forRoutes('*');
  }
}
