import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { UpdateSuggestionDto } from './dto/update-suggestion.dto';

@Injectable()
export class SuggestionsService {
    constructor(private readonly db: DatabaseService) { }

    async create(dto: CreateSuggestionDto, userId: string) {
        return this.db.queryOne(
            `INSERT INTO suggestions (message, user_id) VALUES ($1, $2) RETURNING *`,
            [dto.message, userId],
        );
    }

    async findAll() {
        return this.db.query(
            `SELECT s.*, json_build_object('name', u.name, 'email', u.email) AS user
             FROM suggestions s
             LEFT JOIN users u ON u.id = s.user_id
             ORDER BY s.created_at DESC`,
        );
    }

    async findOne(id: string) {
        const suggestion = await this.db.queryOne(
            `SELECT s.*, json_build_object('name', u.name, 'email', u.email) AS user
             FROM suggestions s
             LEFT JOIN users u ON u.id = s.user_id
             WHERE s.id = $1`,
            [id],
        );
        if (!suggestion) throw new NotFoundException(`Suggestion ${id} not found`);
        return suggestion;
    }

    async update(id: string, dto: UpdateSuggestionDto) {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        for (const [key, value] of Object.entries(dto)) {
            if (value !== undefined) {
                fields.push(`${key} = $${idx}`);
                values.push(value);
                idx++;
            }
        }

        if (fields.length === 0) return this.findOne(id);
        values.push(id);

        return this.db.queryOne(
            `UPDATE suggestions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
            values,
        );
    }

    async remove(id: string) {
        await this.db.execute(`DELETE FROM suggestions WHERE id = $1`, [id]);
        return { deleted: true };
    }
}
