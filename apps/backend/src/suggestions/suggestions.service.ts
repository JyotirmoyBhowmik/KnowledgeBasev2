import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { UpdateSuggestionDto } from './dto/update-suggestion.dto';

@Injectable()
export class SuggestionsService {
    constructor(private readonly prisma: PrismaService) { }

    create(dto: CreateSuggestionDto, userId: string) {
        return this.prisma.suggestion.create({
            data: {
                message: dto.message,
                user_id: userId,
            },
        });
    }

    findAll() {
        return this.prisma.suggestion.findMany({
            orderBy: { created_at: 'desc' },
            include: { user: { select: { name: true, email: true } } },
        });
    }

    async findOne(id: string) {
        const suggestion = await this.prisma.suggestion.findUnique({
            where: { id },
            include: { user: { select: { name: true, email: true } } },
        });
        if (!suggestion) throw new NotFoundException(`Suggestion ${id} not found`);
        return suggestion;
    }

    update(id: string, dto: UpdateSuggestionDto) {
        return this.prisma.suggestion.update({
            where: { id },
            data: dto,
        });
    }

    remove(id: string) {
        return this.prisma.suggestion.delete({ where: { id } });
    }
}
