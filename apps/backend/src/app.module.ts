import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SectionsModule } from './sections/sections.module';
import { PagesModule } from './pages/pages.module';
import { ModulesModule } from './modules/modules.module';
import { FilesModule } from './files/files.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { SettingsModule } from './settings/settings.module';
import { VersionsModule } from './versions/versions.module';
import { TemplatesModule } from './templates/templates.module';
import { ActivityModule } from './activity/activity.module';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    SectionsModule,
    PagesModule,
    ModulesModule,
    FilesModule,
    SuggestionsModule,
    SettingsModule,
    VersionsModule,
    TemplatesModule,
    ActivityModule,
  ],
  controllers: [AppController],
  providers: [
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
