import type { Brand } from './types';

/**
 * Partner brand / logo fixtures for the homepage BrandSection.
 *
 * Covers: brands with logo images and brands with null logoUrl (initials fallback).
 * Logo URLs use picsum.photos, consistent with existing product fixtures.
 */
export const BRANDS: Brand[] = [
  {
    id: 'br-001',
    name: 'AudioPro',
    logoUrl: 'https://picsum.photos/seed/audiopro/160/80',
  },
  {
    id: 'br-002',
    name: 'Nimbus Labs',
    logoUrl: 'https://picsum.photos/seed/nimbus/160/80',
  },
  {
    id: 'br-003',
    name: 'Vertex Gear',
    logoUrl: null,
  },
  {
    id: 'br-004',
    name: 'EcoLiving',
    logoUrl: 'https://picsum.photos/seed/ecoliving/160/80',
  },
  {
    id: 'br-005',
    name: 'Halcyon',
    logoUrl: 'https://picsum.photos/seed/halcyon/160/80',
  },
  {
    id: 'br-006',
    name: 'Pulse Dynamics',
    logoUrl: null,
  },
];
