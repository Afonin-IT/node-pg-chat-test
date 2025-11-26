import fp from 'fastify-plugin';
import basicAuth from '@fastify/basic-auth';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema';

const authPlugin = fp(async (fastify) => {
  await fastify.register(basicAuth, {
    validate: async (username, password, req): Promise<void | Error> => {
      const user = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (!user) {
        return new Error('User not found');
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return new Error('Invalid password');
      }

      (req as any).user = user;
    },
    authenticate: { realm: 'Chat' },
  });

  fastify.decorate('authenticate', fastify.basicAuth);
});

export default authPlugin;

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
  }
}
