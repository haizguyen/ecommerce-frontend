import type { Brand } from '../data/models';
import { getInitials } from './brand-section.util';

describe('BrandSection – data contract', () => {
  it('instantiates Brand with all fields', () => {
    const b: Brand = { id: 'br-001', name: 'AudioPro', logoUrl: 'https://example.com/logo.png' };
    expect(b.id).toBe('br-001');
    expect(b.name).toBe('AudioPro');
    expect(b.logoUrl).toBe('https://example.com/logo.png');
  });

  it('Brand can have null logoUrl', () => {
    const b: Brand = { id: 'br-002', name: 'Nimbus Labs', logoUrl: null };
    expect(b.logoUrl).toBeNull();
  });

  it('Brand IDs are unique', () => {
    const brands: Brand[] = [
      { id: 'br-001', name: 'A', logoUrl: null },
      { id: 'br-002', name: 'B', logoUrl: null },
    ];
    const ids = brands.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('BrandSection – getInitials', () => {
  it('uses first letter of each word for multi-word names', () => {
    expect(getInitials('Nimbus Labs')).toBe('NL');
    expect(getInitials('Pulse Dynamics')).toBe('PD');
    expect(getInitials('Vertex Gear')).toBe('VG');
  });

  it('uses first 2 chars for single-word names', () => {
    expect(getInitials('AudioPro')).toBe('AU');
    expect(getInitials('Halcyon')).toBe('HA');
    expect(getInitials('EcoLiving')).toBe('EC');
  });

  it('handles extra whitespace', () => {
    expect(getInitials('  Nimbus   Labs  ')).toBe('NL');
  });

  it('uppercases result', () => {
    expect(getInitials('eco living')).toBe('EL');
  });
});
