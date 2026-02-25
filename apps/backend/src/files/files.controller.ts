import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/lib/kb';
const MAX_PDF_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB
const ALLOWED_PDF_EXTS = ['.pdf'];
const ALLOWED_VIDEO_EXTS = ['.mp4', '.webm'];

@Controller('api/files')
export class FilesController {
  constructor(private readonly prisma: PrismaService) { }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const type = req.body?.type || 'pdfs';
          const dest = join(UPLOAD_DIR, type === 'VIDEO' ? 'videos' : 'pdfs');
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: MAX_VIDEO_SIZE },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const allAllowed = [...ALLOWED_PDF_EXTS, ...ALLOWED_VIDEO_EXTS];
        if (!allAllowed.includes(ext)) {
          return cb(new BadRequestException(`File type ${ext} not allowed`), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    // Validate size by type
    const ext = extname(file.originalname).toLowerCase();
    if (ALLOWED_PDF_EXTS.includes(ext) && file.size > MAX_PDF_SIZE) {
      throw new BadRequestException('PDF size exceeds 100 MB limit');
    }

    return {
      file_path: file.path,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Get(':moduleId')
  async serveFile(@Param('moduleId') moduleId: string, @Res() res: Response) {
    const mod = await this.prisma.module.findFirst({
      where: { id: moduleId, deleted_at: null },
    });

    if (!mod || !mod.file_path) {
      throw new NotFoundException('File not found');
    }

    if (!existsSync(mod.file_path)) {
      throw new NotFoundException('File not found on disk');
    }

    const ext = extname(mod.file_path).toLowerCase();
    const contentType = ext === '.pdf'
      ? 'application/pdf'
      : ext === '.mp4'
        ? 'video/mp4'
        : 'video/webm';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${mod.title || 'file'}${ext}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(mod.file_path);
  }
}
