// contains a utility function to generate unique email addresses for testing purposes
export function generateEmail(prefix = 'e2eTest') {
  return `${prefix}+${Date.now()}@example.com`;
}
