import 'dotenv/config';
import { z } from 'zod';

const checkPort = (port) => parseInt(port) > 0 && parseInt(port) < 65536;

const EnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z
    .string()
    .refine(checkPort, 'Invalid port number')
    .transform((input) => parseInt(input, 10)),
  DATABASE_URL: z.url(),
});

const result = EnvSchema.safeParse(process.env);

if (!result.success) {
  throw new Error(`Config validation error: ${result.error.message}`);
}

export const ENV = {
  dev: result.data.NODE_ENV === 'development',
  port: result.data.PORT,
  db: {
    url: result.data.DATABASE_URL,
  },
};
