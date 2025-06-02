import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { db } from 'src/db/db';

describe('AgentController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await db.deleteFrom('chunks').execute();
    await db.deleteFrom('transcripts').execute();
  });

  it('/agent/upload/:transcriptId (POST)', async () => {
    const transcriptId = 'sample_transcript';

    const res = await request(app.getHttpServer())
      .post(`/agent/upload/${transcriptId}`)
      .send({ content: '[Speaker:1] Hello world.\n[Speaker:2] Hi there.' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: `Indexed transcript: ${transcriptId}`,
      status: 'ok'
    });
  });

  it('/agent/ask (POST)', async () => {
    const res = await request(app.getHttpServer()).post('/agent/ask').send({
      question: 'Who said hello?',
      transcriptId: 'sample_transcript',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('summary');
    expect(res.body).toHaveProperty('quotes');
    expect(Array.isArray(res.body.quotes)).toBe(true);
  });

  it('should return 409 for duplicate transcript upload', async () => {
    const transcriptId = 'duplicate_test';

    await request(app.getHttpServer())
      .post(`/agent/upload/${transcriptId}`)
      .send({ content: '[Speaker:1] Hello again.' });

    const res = await request(app.getHttpServer())
      .post(`/agent/upload/${transcriptId}`)
      .send({ content: '[Speaker:1] Hello again.' });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/);
  });
});
