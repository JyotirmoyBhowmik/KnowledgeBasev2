import {
    Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { DatabaseService } from '../../database/database.service';

/**
 * AuditLogInterceptor captures before/after snapshots for every
 * mutating API call (POST, PATCH, PUT, DELETE) and stores them
 * in the audit_logs table.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    constructor(private readonly db: DatabaseService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;

        if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
            return next.handle();
        }

        const userId = request.user?.sub || null;
        const path = request.route?.path || request.url;
        const entityId = request.params?.id || 'new';
        const before = method !== 'POST' ? { params: request.params, query: request.query } : null;

        return next.handle().pipe(
            tap(async (response) => {
                try {
                    await this.db.execute(
                        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, before, after)
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [
                            userId,
                            `${method} ${path}`,
                            this.extractEntityType(path),
                            entityId,
                            before ? JSON.stringify(before) : null,
                            response ? JSON.stringify(typeof response === 'object' ? response : { result: response }) : null,
                        ],
                    );
                } catch (err) {
                    console.error('Audit log failed:', err);
                }
            }),
        );
    }

    private extractEntityType(path: string): string {
        const match = path.match(/\/api\/(\w+)/);
        return match ? match[1] : 'unknown';
    }
}
