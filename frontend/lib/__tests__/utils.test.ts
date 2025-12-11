import { cn } from '../utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', false && 'hidden', 'visible');
    expect(result).not.toContain('hidden');
    expect(result).toContain('visible');
  });

  it('should merge Tailwind classes correctly', () => {
    const result = cn('p-4', 'p-2');
    // tailwind-merge should keep only the last one
    expect(result).toBe('p-2');
  });

  it('should handle undefined and null', () => {
    const result = cn('base', undefined, null, 'visible');
    expect(result).not.toContain('undefined');
    expect(result).not.toContain('null');
    expect(result).toContain('visible');
  });
});

