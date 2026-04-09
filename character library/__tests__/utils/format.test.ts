import { formatDate, formatDateTime, formatRelativeTime } from '@/utils/format';

describe('Format Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      // Use a Date object to avoid timezone issues
      const date = new Date(2026, 1, 24);
      const formatted = formatDate(date);
      expect(formatted).toContain('February');
      expect(formatted).toContain('24');
      expect(formatted).toContain('2026');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date(2026, 1, 24, 10, 30);
      const formatted = formatDateTime(date);
      expect(formatted).toContain('February');
      expect(formatted).toContain('24');
      expect(formatted).toContain('2026');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "just now" for recent dates', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('just now');
    });

    it('should return minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatRelativeTime(fiveMinutesAgo);
      expect(result).toContain('minute');
      expect(result).toContain('ago');
    });

    it('should return hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoHoursAgo);
      expect(result).toContain('hour');
      expect(result).toContain('ago');
    });

    it('should return days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(threeDaysAgo);
      expect(result).toContain('day');
      expect(result).toContain('ago');
    });
  });
});
