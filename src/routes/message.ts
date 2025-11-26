import * as util from 'util';
import { pipeline } from 'stream';
import * as path from 'path';
import { FastifyPluginAsync } from 'fastify';
import * as fs from 'fs';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { randomUUID } from 'crypto';
import { count, desc, eq } from 'drizzle-orm';

const pump = util.promisify(pipeline);
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const messageRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post(
    '/text',
    {
      schema: {
        tags: ['Message'],
        summary: 'Send text message',
        body: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string', minLength: 1 } },
        },
      },
    },
    async (req) => {
      const { content } = req.body as any;
      const user = (req as any).user;

      const [message] = await db
        .insert(messages)
        .values({
          type: 'TEXT',
          content,
          mimeType: 'text/plain',
          authorId: user.id,
        })
        .returning();

      return message;
    },
  );

  fastify.post(
    '/file',
    {
      schema: {
        tags: ['Message'],
        summary: 'Send file message',
        consumes: ['multipart/form-data'],
      },
    },
    async (req, reply) => {
      const data = await req.file();
      if (!data) {
        return reply.code(400).send({ message: 'File is required' });
      }

      const user = (req as any).user;
      const fileName = `${randomUUID()}_${data.filename}`;
      const filePath = path.join(UPLOAD_DIR, fileName);

      await pump(data.file, fs.createWriteStream(filePath));

      const [message] = await db
        .insert(messages)
        .values({
          type: 'FILE',
          content: fileName,
          mimeType: data.mimetype,
          authorId: user.id,
        })
        .returning();

      return message;
    },
  );

  fastify.get(
    '/list',
    {
      schema: {
        tags: ['Message'],
        summary: 'Get list of messages',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1, minimum: 1 },
            limit: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
          },
        },
      },
    },
    async (req) => {
      const { page, limit } = req.query as any;
      const offset = (page - 1) * limit;

      const [totalResult] = await db.select({ count: count() }).from(messages);
      const total = totalResult.count;

      const result = await db.query.messages.findMany({
        limit,
        offset,
        orderBy: [desc(messages.createdAt)],
        with: {
          author: {
            columns: { id: true, username: true },
          },
        },
      });

      return {
        data: result,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    },
  );

  fastify.get(
    '/content',
    {
      schema: {
        tags: ['Message'],
        summary: 'Get raw content of a message',
        querystring: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'integer' } },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.query as any;

      const message = await db.query.messages.findFirst({
        where: eq(messages.id, id),
      });

      if (!message) {
        return reply.code(404).send({ message: 'Message not found' });
      }

      reply.type(message.mimeType);

      if (message.type === 'TEXT') {
        return reply.send(message.content);
      } else {
        const filePath = path.join(UPLOAD_DIR, message.content);
        if (!fs.existsSync(filePath)) {
          return reply.code(404).send({ message: 'File on disk not found' });
        }
        return reply.send(fs.createReadStream(filePath));
      }
    },
  );
};

export default messageRoutes;
