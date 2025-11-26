import Fastify from 'fastify';

const fastify = Fastify({
  logger: true,
});

fastify.get('/', function (_request, reply) {
  reply.send({ hello: 'world' });
});

export default fastify;
