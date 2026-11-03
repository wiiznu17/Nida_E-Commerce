import { describe, it, expect } from 'vitest';
import {
  maskEmail,
  maskPhone,
  maskCustomerName,
  maskCardNumber,
  maskAddressLine,
} from '../../src/core/utils/sanitizer.js';
import {
  maskEmail as uiMaskEmail,
  maskPhone as uiMaskPhone,
  maskCustomerName as uiMaskCustomerName,
  maskCardNumber as uiMaskCardNumber,
  maskAddressLine as uiMaskAddressLine,
} from '../../../admin/src/utils/mask.js';

describe('Frontend UI Masking Utilities', () => {
  describe('Email Masking (maskEmail)', () => {
    it('masks standard email addresses correctly', () => {
      expect(uiMaskEmail('customer@example.com')).toBe('cu***@example.com');
      expect(uiMaskEmail('john.doe@brand.luxury')).toBe('jo***@brand.luxury');
    });

    it('handles short usernames gracefully', () => {
      expect(uiMaskEmail('a@b.com')).toBe('a***@b.com');
      expect(uiMaskEmail('ab@domain.com')).toBe('a***@domain.com');
    });

    it('handles invalid or empty inputs safely', () => {
      expect(uiMaskEmail(null)).toBe('-');
      expect(uiMaskEmail(undefined)).toBe('-');
      expect(uiMaskEmail('')).toBe('-');
      expect(uiMaskEmail('not-an-email')).toBe('not-an-email');
    });
  });

  describe('Phone Masking (maskPhone)', () => {
    it('masks 10-digit mobile phone numbers with hyphenation', () => {
      expect(uiMaskPhone('0812345678')).toBe('081-***-5678');
      expect(uiMaskPhone('081-234-5678')).toBe('081-***-5678');
    });

    it('masks 9-digit landline phone numbers with hyphenation', () => {
      expect(uiMaskPhone('021234567')).toBe('02-***-4567');
      expect(uiMaskPhone('02-123-4567')).toBe('02-***-4567');
    });

    it('masks international numbers gracefully', () => {
      expect(uiMaskPhone('+66812345678')).toBe('+66***78');
    });

    it('handles null, undefined, or empty values', () => {
      expect(uiMaskPhone(null)).toBe('-');
      expect(uiMaskPhone(undefined)).toBe('-');
      expect(uiMaskPhone('')).toBe('-');
    });
  });

  describe('Customer Name Masking (maskCustomerName)', () => {
    it('masks full names preserving first name and masking last name initial', () => {
      expect(uiMaskCustomerName('Somchai Prasert')).toBe('Somchai P.***');
      expect(uiMaskCustomerName('สมชาย ประเสริฐ')).toBe('สมชาย ป.***');
    });

    it('masks multi-word full names', () => {
      expect(uiMaskCustomerName('John Michael Smith')).toBe('John M.***');
    });

    it('masks single word names', () => {
      expect(uiMaskCustomerName('Somchai')).toBe('Som***');
      expect(uiMaskCustomerName('Bo')).toBe('Bo***');
    });

    it('handles null, undefined, or empty values', () => {
      expect(uiMaskCustomerName(null)).toBe('-');
      expect(uiMaskCustomerName(undefined)).toBe('-');
      expect(uiMaskCustomerName('')).toBe('-');
    });
  });

  describe('Card Number Masking (maskCardNumber)', () => {
    it('masks 16-digit card number retaining only last 4 digits', () => {
      expect(uiMaskCardNumber('4242424242424242')).toBe('•••• •••• •••• 4242');
      expect(uiMaskCardNumber('4242 4242 4242 1234')).toBe(
        '•••• •••• •••• 1234',
      );
    });

    it('formats short last-4 string correctly', () => {
      expect(uiMaskCardNumber('4242')).toBe('•••• 4242');
    });

    it('handles null, undefined, or empty strings with bullet placeholder', () => {
      expect(uiMaskCardNumber(null)).toBe('•••• •••• •••• ••••');
      expect(uiMaskCardNumber(undefined)).toBe('•••• •••• •••• ••••');
      expect(uiMaskCardNumber('')).toBe('•••• •••• •••• ••••');
    });
  });

  describe('Address Line Masking (maskAddressLine)', () => {
    it('masks house or building numbers from address line', () => {
      expect(uiMaskAddressLine('123/45 Sukhumvit 55')).toBe('*** Sukhumvit 55');
      expect(uiMaskAddressLine('99/101 ซอยทองหล่อ 10')).toBe(
        '*** ซอยทองหล่อ 10',
      );
    });

    it('handles empty or null values', () => {
      expect(uiMaskAddressLine(null)).toBe('-');
      expect(uiMaskAddressLine(undefined)).toBe('-');
      expect(uiMaskAddressLine('')).toBe('-');
    });
  });
});
