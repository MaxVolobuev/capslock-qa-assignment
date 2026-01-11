// contains selectors for different form containers on the page
export const FORM_CONTAINERS = {
  TOP: '#form-container-1',
  FOOTER: '#form-container-2',
} as const;

export type FormContainer = (typeof FORM_CONTAINERS)[keyof typeof FORM_CONTAINERS];
