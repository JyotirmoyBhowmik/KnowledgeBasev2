import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * SecurityHeadersMiddleware applies VAPT-oriented HTTP security headers
 * per SOW Section 3 requirements.
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // HSTS — enforce HTTPS
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');

        // Prevent MIME-type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // Referrer policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Content Security Policy (strict)
        res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http://localhost:*; frame-ancestors 'none';",
        );

        // Permissions Policy
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // XSS Protection (legacy, but harmless)
        res.setHeader('X-XSS-Protection', '1; mode=block');

        next();
    }
}
