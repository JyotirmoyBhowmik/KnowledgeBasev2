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

        // Prevent MIME-type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // Referrer policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        // For file serving routes (PDFs, videos, images), skip iframe-blocking headers
        const isFileRoute = req.path.startsWith('/api/files/');

        if (!isFileRoute) {
            // Prevent clickjacking (skip for files so PDFs render in iframes)
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');

            // Content Security Policy
            res.setHeader(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http://localhost:*; frame-src 'self' blob: data:; object-src 'self'; frame-ancestors 'self' http://localhost:3000;",
            );
        }

        // Permissions Policy
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // XSS Protection (legacy, but harmless)
        res.setHeader('X-XSS-Protection', '1; mode=block');

        next();
    }
}
