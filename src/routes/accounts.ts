import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

const accountRoutes: FastifyPluginAsync = async (fastify) => {
  const registerSchema = {
    body: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string', minLength: 3 },
        password: { type: 'string', minLength: 6 },
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          username: { type: 'string' },
        },
      },
      409: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  };

  fastify.post(
    '/register',
    {
      schema: {
        ...registerSchema,
        tags: ['Account'],
        summary: 'Register a new user',
      },
    },
    async (req, reply) => {
      const { username, password } = req.body as any;

      const existing = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (existing) {
        return reply.code(StatusCodes.CONFLICT).send({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [newUser] = await db
        .insert(users)
        .values({
          username,
          passwordHash: hashedPassword,
        })
        .returning({ id: users.id, username: users.username });

      return reply.code(201).send(newUser);
    },
  );
};

export default accountRoutes;
