import {
  Controller, Get, Post, Param, Res, UploadedFile, UseInterceptors,
  BadRequestException, NotFoundException, Body, UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { extname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/lib/kb';
const ALLOWED_EXTS = ['.pdf', '.mp4', '.webm', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico'];

// Ensure upload directories exist at startup
['pdfs', 'videos', 'images', 'icons'].forEach(dir => {
  const path = join(UPLOAD_DIR, dir);
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
});

@Controller('api/files')
export class FilesController {
  constructor(private readonly db: DatabaseService) { }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const type = req.body?.type || 'pdfs';
          const folder = type === 'VIDEO' ? 'videos' : type === 'IMAGE' ? 'images' : type === 'ICON' ? 'icons' : 'pdfs';
          const dest = join(UPLOAD_DIR, folder);
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTS.includes(ext)) return cb(new BadRequestException(`File type ${ext} not allowed`), false);
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File, @Body('type') type: string) {
    if (!file) throw new BadRequestException('No file provided');
    return {
      file_path: file.path,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/api/files/static/${file.filename}`,
    };
  }

  // Serve file by module ID (public — for published pages)
  @Get(':moduleId')
  async serveFile(@Param('moduleId') moduleId: string, @Res() res: Response) {
    const mod = await this.db.queryOne(
      `SELECT * FROM modules WHERE id = $1 AND deleted_at IS NULL`, [moduleId],
    );
    if (!mod || !mod.file_path) throw new NotFoundException('File not found');
    if (!existsSync(mod.file_path)) throw new NotFoundException('File not found on disk');
    this.sendFileResponse(res, mod.file_path, mod.title);
  }

  // Serve static uploaded file by filename (for icons, settings images)
  @Get('static/:filename')
  serveStaticFile(@Param('filename') filename: string, @Res() res: Response) {
    // Sanitize: prevent path traversal
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    for (const dir of ['icons', 'images', 'pdfs', 'videos']) {
      const filePath = join(UPLOAD_DIR, dir, safeName);
      if (existsSync(filePath)) {
        return this.sendFileResponse(res, filePath, safeName);
      }
    }
    throw new NotFoundException('File not found');
  }

  private sendFileResponse(res: Response, filePath: string, title?: string) {
    const ext = extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
      contentType = `image/${ext === '.jpg' || ext === '.jpeg' ? 'jpeg' : ext.substring(1)}`;
    } else if (ext === '.ico') contentType = 'image/x-icon';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${title || 'file'}${ext}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(filePath);
  }

  // Utility: delete file from disk (called by modules service)
  static deleteFile(filePath: string) {
    try { if (filePath && existsSync(filePath)) unlinkSync(filePath); } catch { }
  }
}
