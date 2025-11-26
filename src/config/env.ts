import 'dotenv/config';
import { z } from 'zod';

const checkPort = (port) => parseInt(port) > 0 && parseInt(port) < 65536;

const EnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  DB_HOST: z.string(),
  DB_PORT: z
    .string()
    .refine(checkPort, 'Invalid port number')
    .transform((input) => parseInt(input, 10)),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
});

const result = EnvSchema.safeParse(process.env);

if (!result.success) {
  throw new Error(`Config validation error: ${result.error.message}`);
}

export const ENV = {
  dev: result.data.NODE_ENV === 'development',
  db: {
    host: result.data.DB_HOST,
    port: result.data.DB_PORT,
    user: result.data.DB_USER,
    password: result.data.DB_PASSWORD,
    name: result.data.DB_NAME,
  },
};
