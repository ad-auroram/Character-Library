import { isValidEmail, isValidPassword, validateSignUpForm } from '@/utils/validation';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for passwords with 6 or more characters', () => {
      expect(isValidPassword('123456')).toBe(true);
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('LongP@ssw0rd!')).toBe(true);
    });

    it('should return false for passwords with less than 6 characters', () => {
      expect(isValidPassword('12345')).toBe(false);
      expect(isValidPassword('abc')).toBe(false);
      expect(isValidPassword('')).toBe(false);
    });
  });

  describe('validateSignUpForm', () => {
    it('should return valid for correct email and password', () => {
      const result = validateSignUpForm('test@example.com', 'password123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return errors for invalid email', () => {
      const result = validateSignUpForm('invalid-email', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should return errors for invalid password', () => {
      const result = validateSignUpForm('test@example.com', '123');
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });

    it('should return errors for both invalid email and password', () => {
      const result = validateSignUpForm('invalid', '123');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });
  });
});
