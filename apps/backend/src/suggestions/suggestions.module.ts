import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SuggestionsService } from './suggestions.service';
import { SuggestionsController } from './suggestions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule, JwtModule.register({ secret: process.env.JWT_SECRET || 'secret' })],
    controllers: [SuggestionsController],
    providers: [SuggestionsService],
})
export class SuggestionsModule { }
