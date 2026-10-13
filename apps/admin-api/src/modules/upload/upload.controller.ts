import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadFolder } from '@repo/types';
import {
  UploadService,
  type UploadResult,
  type UploadedFileDto,
} from './upload.service.js';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiOperation({ summary: 'Upload an image with folder namespace' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          enum: Object.values(UploadFolder),
          default: UploadFolder.PRODUCTS,
          description: 'Subfolder name (e.g. products, banners, categories, avatars, temp)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|avif)$/)) {
          return callback(
            new BadRequestException('Only image files (jpg, jpeg, png, gif, webp, avif) are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: UploadedFileDto,
    @Body('folder') folder: UploadFolder = UploadFolder.PRODUCTS,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.uploadService.uploadImage(file, folder);
  }
}
