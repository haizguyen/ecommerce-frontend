import type { NewsletterResponse } from '../data/models';

describe('NewsletterSection – data contract', () => {
  it('NewsletterResponse with success: true', () => {
    const res: NewsletterResponse = { success: true };
    expect(res.success).toBe(true);
    expect(res.message).toBeUndefined();
  });

  it('NewsletterResponse with success: false and optional message', () => {
    const res: NewsletterResponse = { success: false, message: 'Already subscribed.' };
    expect(res.success).toBe(false);
    expect(res.message).toBe('Already subscribed.');
  });

  it('NewsletterResponse success: false without message', () => {
    const res: NewsletterResponse = { success: false };
    expect(res.success).toBe(false);
    expect(res.message).toBeUndefined();
  });
});
