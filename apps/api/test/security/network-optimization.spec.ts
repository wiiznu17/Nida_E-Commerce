import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Controller, Get, Header } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import compression from 'compression';

@Controller('test-opt')
class TestOptimizationController {
  @Get('large')
  getLargePayload() {
    return {
      message: 'x'.repeat(2048),
      data: Array.from({ length: 50 }, (_, i) => ({
        id: `item-${i}`,
        name: `Product ${i}`,
        description: 'Luxury apparel item designed for performance testing',
      })),
    };
  }

  @Get('small')
  getSmallPayload() {
    return { ok: true };
  }

  @Get('cached')
  @Header(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  )
  getCachedPayload() {
    return { categories: ['Men', 'Women'] };
  }
}

describe('Network Optimization & Response Compression', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestOptimizationController],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(compression({ threshold: 1024 }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('compresses payloads larger than 1KB with Gzip when Accept-Encoding is gzip', async () => {
    const res = await request(app.getHttpAdapter().getInstance())
      .get('/test-opt/large')
      .set('Accept-Encoding', 'gzip')
      .expect(200);

    expect(res.headers['content-encoding']).toBe('gzip');
  });

  it('does not compress payloads smaller than threshold (1KB)', async () => {
    const res = await request(app.getHttpAdapter().getInstance())
      .get('/test-opt/small')
      .set('Accept-Encoding', 'gzip')
      .expect(200);

    expect(res.headers['content-encoding']).toBeUndefined();
  });

  it('delivers Cache-Control headers on cached public endpoints', async () => {
    const res = await request(app.getHttpAdapter().getInstance())
      .get('/test-opt/cached')
      .expect(200);

    expect(res.headers['cache-control']).toBe(
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    );
  });
});
