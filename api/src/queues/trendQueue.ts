import { Queue, Worker, QueueEvents, Job } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
};

const QUEUE_NAME = 'trendQueue';

export let trendQueue: Queue;

export const initQueue = () => {
    if (trendQueue) return;
    trendQueue = new Queue(QUEUE_NAME, { connection });
};

export let queueEvents: QueueEvents;

export let trendWorker: Worker;

export const initWorker = () => {
  if (trendWorker) return;
  
  queueEvents = new QueueEvents(QUEUE_NAME, { connection });
  trendWorker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      console.log(`[Worker] Started processing job ${job.id} of type ${job.name}`);
      console.log(`[Worker] Job data:`, job.data);
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      if (!job.data.topic) {
          throw new Error("Topic is required for processing");
      }

      console.log(`[Worker] Finished processing job ${job.id}`);
      
      return {
        status: 'success',
        result: `Processed trends for ${job.data.topic}`,
      };
    },
    { 
      connection,
      concurrency: 5 
    }
  );

  trendWorker.on('completed', (job: Job) => {
    console.log(`[Queue] Job ${job.id} has completed!`);
  });

  trendWorker.on('failed', (job: Job | undefined, err: Error) => {
    console.log(`[Queue] Job ${job?.id} has failed with error ${err.message}`);
  });
};

export const closeQueueConnections = async () => {
    await trendQueue.close();
    if (queueEvents) await queueEvents.close();
    if (trendWorker) await trendWorker.close();
};
