import { test } from '@playwright/test';
import { EstimateFormPage } from '../pages/home';
import { generateEmail } from '../utils/emailGenerator';
import { PROPERTY_TYPES, WHY_INTERESTED_OPTIONS } from '../types/index';
import { USER } from '../data/userData';
import { FORM_CONTAINERS } from '../constants/formContainers';
import { waitForZipSubmit, assertZipSubmitted } from '../utils/network';
import { getContent } from '../content';

const userData = {
  zip: USER.valid.zip,
  name: USER.valid.name,
  phone: USER.valid.phone,
};

test('Submit top form and reach Thank you page (TOP quiz)', async ({ page }, testInfo) => {
  const lang = (testInfo.project.name as 'en') ?? 'en';
  const T = getContent(lang);
  const topForm = new EstimateFormPage(page, FORM_CONTAINERS.TOP);
  const email = generateEmail();
  await topForm.open();

  const zipRequest = waitForZipSubmit(page, userData.zip);

  await topForm.submitOwnedFlow({
    ...userData,
    whyInterested: [WHY_INTERESTED_OPTIONS.INDEPENDENCE],
    propertyType: PROPERTY_TYPES.OWNED,
    email,
  });

  await assertZipSubmitted(zipRequest, userData.zip);

  await topForm.expectUrlToBe(T.thankYou.url);
  await topForm.expectThankYou(T.thankYou);
});

test('BUG: Rental should be blocked on step 3 (FOOTER quiz)', async ({ page }, testInfo) => {
  test.fail(true, 'Known bug: rental/mobile are allowed to proceed to step 4');

  const lang = (testInfo.project.name as 'en') ?? 'en';
  const T = getContent(lang);

  const form = new EstimateFormPage(page, FORM_CONTAINERS.FOOTER);
  await form.open();

  await form.submitNonOwnedFlow(
    {
      zip: USER.valid.zip,
      whyInterested: [WHY_INTERESTED_OPTIONS.SAFETY],
      propertyType: PROPERTY_TYPES.RENTAL,
    },
    { propertyErrorText: T.errors.weDontInstall },
  );
});

test('BUG: Out of Area zipCode (TOP quiz)', async ({ page }, testInfo) => {
  test.fail(true, 'Known bug: out-of-area email input is type="text" (no HTML5 validation)');
  const lang = (testInfo.project.name as 'en') ?? 'en';
  const T = getContent(lang);
  const topForm = new EstimateFormPage(page, FORM_CONTAINERS.TOP);
  await topForm.open();

  await topForm.submitOutOfAreaFlow({
    zip: USER.invalid.zip,
    email: generateEmail(),
    expectedHeaderText: T.outOfArea.blockMessage,
    expectedThankYouText: T.outOfArea.thankYouMessage,
  });
});
