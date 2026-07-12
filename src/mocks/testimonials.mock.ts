import type { Testimonial } from './types';

/**
 * Customer testimonial fixtures for the homepage TestimonialsSection.
 *
 * Covers: quotes of varying length, ratings from 3 to 5, one null avatarUrl.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-001',
    quote:
      'The Aurora headphones completely changed my workflow. The noise cancellation is incredible — I can focus for hours without distraction.',
    authorName: 'Sarah Chen',
    authorTitle: 'Software Engineer, Melbourne',
    avatarUrl: 'https://picsum.photos/seed/sarah-chen/96/96',
    rating: 5,
  },
  {
    id: 't-002',
    quote:
      'Bought the mechanical keyboard on a whim and it is now my favourite desk accessory. The build quality is outstanding for the price.',
    authorName: 'Marcus Webb',
    authorTitle: 'Product Designer, Sydney',
    avatarUrl: null,
    rating: 4,
  },
  {
    id: 't-003',
    quote:
      'Fast shipping and great customer service. The desk mat I ordered arrived in two days and looks even better in person.',
    authorName: 'Priya Kapoor',
    authorTitle: 'Remote Worker, Brisbane',
    avatarUrl: 'https://picsum.photos/seed/priya-kapoor/96/96',
    rating: 5,
  },
  {
    id: 't-004',
    quote: 'Good quality for the price. Would have liked more colour options, but overall very happy with my purchase.',
    authorName: 'Jamie Torres',
    rating: 3,
    avatarUrl: 'https://picsum.photos/seed/jamie-torres/96/96',
  },
];
