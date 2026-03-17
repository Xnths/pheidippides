import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { trendQueue, initQueue } from '../queues/trendQueue.js';

const jobsRouter = new Hono();

const jobRequestSchema = z.object({
  topic: z.string().min(1, 'Topic cannot be empty'),
});

function validationFailureHandler(result: any, c: any) {
  if (!result.success) {
    return c.json(
      {
        error: 'Validation Error',
        issues: result.error.issues,
      },
      422
    );
  }
}

function queueFailureHandler(error: any, c: any) {
  console.error('Failed to enqueue job:', error);
  return c.json(
    {
      error: 'Internal Server Error',
      message: 'Failed to connect to the queue system',
    },
    500
  );
}

async function enqueueJob(topic: string, c: any) {
  try {
    initQueue();
    const job = await trendQueue.add('analyze-trend', { topic });

    return c.json(
      {
        message: 'Job enqueued successfully',
        jobId: job.id,
      },
      202
    );
  } catch (error) {
    return queueFailureHandler(error, c);
  }
}

/**
 * POST /trigger
 * 
 * Enqueues a new job to process a specific topic.
 * Uses Zod validator to ensure the topic is a non-empty string.
 * Returns 422 Unprocessable Entity if validation fails.
 * Returns 500 Internal Server Error if Redis connection fails.
 */
jobsRouter.post(
  '/trigger',
  zValidator('json', jobRequestSchema, validationFailureHandler),
  async (c) => {
    const { topic } = c.req.valid('json');
    return enqueueJob(topic, c);
  }
);

export { jobsRouter };
