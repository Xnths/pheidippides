import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { jobsRouter } from './routes/jobs.js';

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

app.get('/health', (c) => {
  return c.json({ status: 'ok', time: new Date().toISOString() });
});

app.route('/jobs', jobsRouter);

export { app };
