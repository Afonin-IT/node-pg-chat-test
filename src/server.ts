import buildApp from '@/app';
import { ENV } from '@/config/env';

const start = async () => {
  try {
    const app = await buildApp();
    const port = ENV.port || 3000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
