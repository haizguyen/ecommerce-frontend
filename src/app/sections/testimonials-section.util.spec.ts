import type { Testimonial } from '../data/models';
import { getInitials } from './testimonials-section.util';

describe('TestimonialsSection – data contract', () => {
  it('instantiates Testimonial with all fields', () => {
    const t: Testimonial = {
      id: 't-001',
      quote: 'Great product!',
      authorName: 'Sarah Chen',
      authorTitle: 'Engineer',
      avatarUrl: 'https://example.com/avatar.jpg',
      rating: 5,
    };
    expect(t.id).toBe('t-001');
    expect(t.quote).toBe('Great product!');
    expect(t.authorName).toBe('Sarah Chen');
    expect(t.authorTitle).toBe('Engineer');
    expect(t.avatarUrl).toBe('https://example.com/avatar.jpg');
    expect(t.rating).toBe(5);
  });

  it('Testimonial can have null avatarUrl and no title', () => {
    const t: Testimonial = {
      id: 't-002',
      quote: 'Good value.',
      authorName: 'Marcus Webb',
      avatarUrl: null,
      rating: 4,
    };
    expect(t.avatarUrl).toBeNull();
    expect(t.authorTitle).toBeUndefined();
  });

  it('rating is a number 0–5', () => {
    const t: Testimonial = {
      id: 't-003',
      quote: 'Okay.',
      authorName: 'Priya Kapoor',
      avatarUrl: null,
      rating: 3,
    };
    expect(t.rating).toBeGreaterThanOrEqual(0);
    expect(t.rating).toBeLessThanOrEqual(5);
  });
});

describe('TestimonialsSection – getInitials', () => {
  it('uses first letter of each word for multi-word names', () => {
    expect(getInitials('Sarah Chen')).toBe('SC');
    expect(getInitials('Marcus Webb')).toBe('MW');
    expect(getInitials('Priya Kapoor')).toBe('PK');
  });

  it('uses first 2 chars for single-word names', () => {
    expect(getInitials('Jamie')).toBe('JA');
    expect(getInitials('Alex')).toBe('AL');
  });

  it('handles extra whitespace', () => {
    expect(getInitials('  Morgan   Lee  ')).toBe('ML');
  });

  it('uppercases result', () => {
    expect(getInitials('jamie torres')).toBe('JT');
  });
});
