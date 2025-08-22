import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UnliService } from './unli-dev.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const imageStorage = diskStorage({
  destination: './public',
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `imageFile-${unique}${extname(file.originalname)}`);
  },
});

const imageFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only images allowed'), false);
  }
  cb(null, true);
};

@Controller('unli-dev')
export class UnliDevController {
  constructor(private readonly unliDevService: UnliService) {}

  @Post('analyze')
  analyze(@Body('prompt') prompt: string) {
    return this.unliDevService.analyzeText(prompt);
  }

  @Post('analyze-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: imageStorage,
      fileFilter: imageFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async analyzeImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('prompt') prompt: string,
  ) {
    // Di sini kamu bisa:
    // - Ambil file.path / file.buffer (kalau pakai storage: memoryStorage)
    // - Convert ke base64
    // - Kirim ke service AI kamu
    return this.unliDevService.analyzeImage(file, prompt);
  }
}
