import Fastify, { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import accountRoutes from '@/routes/accounts';
import messageRoutes from '@/routes/message';
import authPlugin from '@/plugins/auth';

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: true });

  await app.register(multipart);

  await app.register(swagger, {
    swagger: {
      info: { title: 'BIMP Chat test', description: 'API Documentation', version: '1.0.0' },
      securityDefinitions: { basicAuth: { type: 'basic' } },
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  await app.register(authPlugin);
  await app.register(accountRoutes, { prefix: '/account' });
  await app.register(messageRoutes, { prefix: '/message' });

  return app;
};

export default buildApp;
