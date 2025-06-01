import { capitalizeFirstLetter, truncate } from './string-utils';

describe('String Utils', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('world')).toBe('World');
    });

    it('should return the same string if it is already capitalized', () => {
      expect(capitalizeFirstLetter('Hello')).toBe('Hello');
      expect(capitalizeFirstLetter('World')).toBe('World');
    });

    it('should handle empty strings', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(capitalizeFirstLetter(null as unknown as string)).toBe(null);
      expect(capitalizeFirstLetter(undefined as unknown as string)).toBe(
        undefined,
      );
    });
  });

  describe('truncate', () => {
    it('should truncate a string if it exceeds the maximum length', () => {
      expect(truncate('Hello, world!', 5)).toBe('Hello...');
      expect(truncate('This is a long string', 10)).toBe('This is a ...');
    });

    it('should not truncate a string if it does not exceed the maximum length', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
      expect(truncate('Short', 5)).toBe('Short');
    });

    it('should handle empty strings', () => {
      expect(truncate('', 5)).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(truncate(null as unknown as string, 5)).toBe(null);
      expect(truncate(undefined as unknown as string, 5)).toBe(undefined);
    });
  });
});
