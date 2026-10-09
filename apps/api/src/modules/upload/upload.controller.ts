import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Upload an image to Cloudinary (or local media storage) with folder namespace' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'folder',
    required: false,
    enum: ['products', 'categories', 'banners', 'avatars', 'reviews', 'slips', 'temp'],
    description: 'Subfolder to group images (e.g. products, banners, categories, avatars)',
  })
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
          enum: ['products', 'categories', 'banners', 'avatars', 'reviews', 'slips'],
          default: 'temp',
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
    @UploadedFile() file: any,
    @Body('folder') bodyFolder?: string,
    @Query('folder') queryFolder?: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const folder = bodyFolder || queryFolder || 'products';
    return this.uploadService.uploadImage(file as UploadedFileDto, folder);
  }
}
