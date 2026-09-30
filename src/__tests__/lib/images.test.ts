import { describe, it, expect } from 'vitest';
import { firstImage } from '@/lib/images';

describe('firstImage', () => {
  it('takes the first URL of an array', () => {
    expect(firstImage(['https://a.test/1.jpg', 'https://a.test/2.jpg'])).toBe('https://a.test/1.jpg');
  });

  it('parses an array stored as a JSON string', () => {
    expect(firstImage('["https://a.test/1.jpg","https://a.test/2.jpg"]')).toBe('https://a.test/1.jpg');
  });

  it('accepts a bare URL', () => {
    expect(firstImage('https://a.test/1.jpg')).toBe('https://a.test/1.jpg');
  });

  it('returns null for empty or invalid values', () => {
    expect(firstImage(null)).toBeNull();
    expect(firstImage([])).toBeNull();
    expect(firstImage('')).toBeNull();
    expect(firstImage('[not json')).toBeNull();
  });
});
