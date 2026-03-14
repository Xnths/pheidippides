import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally for scraperClient
global.fetch = vi.fn();

describe('scraperClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ok_response_returns_parsed_object', () => {
    // TODO: implement
  });

  it('non_ok_response_throws', () => {
    // TODO: implement
  });
});
