import { serve } from '@hono/node-server';
import { app } from './app.js';
import { initWorker, initQueue } from './queues/trendQueue.js';

initQueue();
initWorker();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
