import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * AuditLogInterceptor captures before/after snapshots for every
 * mutating API call (POST, PATCH, PUT, DELETE) and stores them
 * in the audit_logs table.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    constructor(private readonly prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;

        // Only audit mutating operations
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
                    await this.prisma.auditLog.create({
                        data: {
                            user_id: userId,
                            action: `${method} ${path}`,
                            entity_type: this.extractEntityType(path),
                            entity_id: entityId,
                            before: before as any,
                            after: response ? (typeof response === 'object' ? response : { result: response }) : null,
                        },
                    });
                } catch (err) {
                    // Silently fail — audit logging should never break business logic
                    console.error('Audit log failed:', err);
                }
            }),
        );
    }

    private extractEntityType(path: string): string {
        // Extract entity from path like /api/sections/:id → sections
        const match = path.match(/\/api\/(\w+)/);
        return match ? match[1] : 'unknown';
    }
}
