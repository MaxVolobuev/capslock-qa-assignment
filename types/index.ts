// contains all type definitions used across the project
export type Step = 1 | 2 | 3 | 4 | 5;

export type OwnedEstimateRequest = {
  zip: string;
  whyInterested: WhyInterested[];
  propertyType: typeof PROPERTY_TYPES.OWNED;
  name: string;
  email: string;
  phone: string;
};

export type NonOwnedEstimateRequest = {
  zip: string;
  whyInterested: WhyInterested[];
  propertyType: Exclude<PropertyType, typeof PROPERTY_TYPES.OWNED>; // RENTAL | MOBILE
};

export type OutOfAreaRequest = {
  zip: string;
  email: string;
  expectedHeaderText: string;
  expectedThankYouText: string;
};

export const PROPERTY_TYPES = {
  OWNED: 'Owned House / Condo',
  RENTAL: 'Rental Property',
  MOBILE: 'Mobile Home',
} as const;

export const WHY_INTERESTED_OPTIONS = {
  INDEPENDENCE: 'Independence',
  SAFETY: 'Safety',
  THERAPY: 'Therapy',
  OTHER: 'Other',
} as const;

export type WhyInterested = (typeof WHY_INTERESTED_OPTIONS)[keyof typeof WHY_INTERESTED_OPTIONS];

export type PropertyType = (typeof PROPERTY_TYPES)[keyof typeof PROPERTY_TYPES];

export type EstimateRequest = OwnedEstimateRequest | NonOwnedEstimateRequest;

export type GoToNameEmailRequest = Pick<
  OwnedEstimateRequest,
  'zip' | 'whyInterested' | 'propertyType'
>;

export type GoToPhoneRequest = Pick<
  OwnedEstimateRequest,
  'zip' | 'whyInterested' | 'propertyType' | 'name' | 'email'
> & {
  phone?: string;
};
