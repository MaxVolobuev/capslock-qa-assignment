// contains valid and invalid user data for testing purposes
export const USER = {
  valid: {
    zip: '68901',
    name: 'Test Tester',
    phone: '2234567890',
  },

  invalid: {
    zip: '11111',
  },
} as const;

export const INVALID_EMAILS_HTML5 = [
  '',
  'plainaddress',
  'a@',
  '@b.com',
  'a@b.',
  'a@.b',
  'a@b..com',
] as const;

export const INVALID_PHONES = [
  { label: 'empty', value: '', expectTextKey: 'phoneRequired' },
  { label: 'starts with 1', value: '1234567890', expectTextKey: 'wrongPhoneNumber' },
  { label: '9 digits', value: '123456789', expectTextKey: 'wrongPhoneNumber' },
] as const;
