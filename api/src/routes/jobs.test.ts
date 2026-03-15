/**
 * @fileoverview Tests for the jobs route
 * 
 * It uses Input Space Partitioning and 
 * Each Choice Coverage (ECC) criteria, testing
 * at least one example of each partition.
 * 
 * It tests the following partitions:
 * 
 * 1. Topic is not provided
 * 2. Topic is empty
 * 3. Topic is not a string
 * 4. Redis is not available
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { app } from '../app.js';

let mockTrendQueue: any = { add: vi.fn() };

vi.mock('../queues/trendQueue.js', () => ({
  initQueue: vi.fn(() => {}),
  get trendQueue() { return mockTrendQueue; },
  set trendQueue(v) { mockTrendQueue = v; }
}));

describe('When the user request a batch of trends to be processed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should enqueue a job if redis is available', async () => {
    mockTrendQueue.add.mockResolvedValue({ id: '1' } as any);

    const res = await app.request('/jobs/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic: 'computer' }),
    });

    expect(res.status).toBe(202);

    const body = await res.json();
    expect(body).toHaveProperty('jobId', '1');

    expect(mockTrendQueue.add).toHaveBeenCalledTimes(1);
    expect(mockTrendQueue.add).toHaveBeenCalledWith(
      expect.any(String),
      { topic: 'computer' }
    );
  });

  it('should report unprocessable entity when topic is empty', async () => {

    const res = await app.request('/jobs/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic: '' }),
    });

    expect(res.status).toBe(422);
    expect(mockTrendQueue.add).toHaveBeenCalledTimes(0);
  });

  it('should report unprocessable entity when topic is not provided', async () => {

    const res = await app.request('/jobs/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(422);
    expect(mockTrendQueue.add).toHaveBeenCalledTimes(0);
  });

  it('should report unprocessable entity when user provide a non-string topic and redis is available', async () => {

    const res = await app.request('/jobs/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic: 123 }),
    });

    expect(res.status).toBe(422);
    expect(mockTrendQueue.add).toHaveBeenCalledTimes(0);
  });

  it('should report internal server error when redis is unavailable', async () => {
    mockTrendQueue.add.mockRejectedValue(new Error('Redis error'));

    const res = await app.request('/jobs/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic: 'computer' }),
    });

    expect(res.status).toBe(500);
    expect(mockTrendQueue.add).toHaveBeenCalledTimes(1);
  });
});
