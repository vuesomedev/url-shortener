import { FastifyInstance, FastifySchema } from 'fastify';
import { nanoid } from 'nanoid';
import { config } from '../config';
import { Url } from '../models/url.model';

interface CreateBody {
  url: string;
}

interface CreateResponse {
  originalUrl: string;
  shortUrl: string;
}

const schema: FastifySchema = {
  body: {
    type: 'object',
    required: ['url'],
    properties: {
      url: { type: 'string' },
    },
  },
};

export const createRoute = (server: FastifyInstance): void => {
  server.post<{ Body: CreateBody; Reply: CreateResponse }>(
    '/create',
    { schema },
    async (request, reply) => {
      const shortId = nanoid(13);
      const shortUrl = `${config.baseUrl}/redirect/${shortId}`;
      const originalUrl = request.body.url;

      await Url.create({ originalUrl, shortId });
      request.log.info('url created', { originalUrl, shortId });

      reply.status(200).send({ originalUrl, shortUrl });
    },
  );
};