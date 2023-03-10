import supertest from 'supertest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../server';
import { UrlModel } from '../models/url.model';
import { UrlStatModel } from '../models/url-stat.model';
import { UrlService } from '../services/url.service';

const shortId = 'abcd';
const originalUrl = 'https://google.com';

describe('Create Route', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = createServer({ logger: false });
    await server.ready();
  });

  afterEach(async () => {
    await UrlService.cleanup();
    await server.close();
  });

  it('should redirect to original url', async () => {
    await UrlModel.create({ originalUrl, shortId });

    await supertest(server.server)
      .get('/redirect/abcd')
      .expect(302)
      .expect('Location', originalUrl);
  });

  it('should increment visit counter', async () => {
    await UrlModel.create({ originalUrl, shortId });
    await UrlStatModel.create({ visits: 1, shortId });

    await supertest(server.server)
      .get('/redirect/abcd')
      .expect(302)
      .expect('Location', originalUrl);

    const result = await UrlStatModel.findOne({ shortId });

    expect(result).toMatchObject({ visits: 2 });
  });

  it('should return not found when url doesnt exist', async () => {
    await supertest(server.server).get('/redirect/abcd').expect(404);
  });
});
