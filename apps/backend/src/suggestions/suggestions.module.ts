import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SuggestionsService } from './suggestions.service';
import { SuggestionsController } from './suggestions.controller';

@Module({
    imports: [AuthModule],
    controllers: [SuggestionsController],
    providers: [SuggestionsService],
})
export class SuggestionsModule { }
