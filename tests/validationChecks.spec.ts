import { test } from '@playwright/test';
import { EstimateFormPage } from '../pages/home';
import { generateEmail } from '../utils/emailGenerator';
import { PROPERTY_TYPES, WHY_INTERESTED_OPTIONS } from '../types/index';
import { USER, INVALID_EMAILS_HTML5, INVALID_PHONES } from '../data/userData';
import { FORM_CONTAINERS } from '../constants/formContainers';
import { getContent } from '../content';

test('Validation: email uses native HTML5 validation (FOOTER quiz)', async ({ page }) => {
  const form = new EstimateFormPage(page, FORM_CONTAINERS.FOOTER);
  await form.open();

  await form.goToNameAndEmailStep({
    zip: USER.valid.zip,
    whyInterested: [WHY_INTERESTED_OPTIONS.SAFETY],
    propertyType: PROPERTY_TYPES.OWNED,
  });

  // Contract: email input must use native HTML5 validation
  await form.expectEmailHtml5Validation(form.emailInput());

  // Invalid emails should be blocked
  await form.assertEmailHtml5Blocks(INVALID_EMAILS_HTML5, USER.valid.name);

  // Recovery: valid email allows progression
  await form.resetStepNameEmail();
  await form.nameInput().fill(USER.valid.name);
  await form.emailInput().fill(generateEmail());
  await form.submitStep();

  // Step 5 visible
  await form.expectStayOnStep(5);
  await form.expectStepState(5, 'visible');
});

test('Validation: phone must have exactly 10 digits (TOP quiz)', async ({ page }, testInfo) => {
  const lang = (testInfo.project.name as 'en') ?? 'en';
  const T = getContent(lang);
  const form = new EstimateFormPage(page, FORM_CONTAINERS.TOP);
  await form.open();

  await form.goToPhoneStep({
    zip: USER.valid.zip,
    whyInterested: [WHY_INTERESTED_OPTIONS.SAFETY],
    propertyType: PROPERTY_TYPES.OWNED,
    name: USER.valid.name,
    email: generateEmail(),
  });

  // All invalid cases in one go
  await form.assertPhoneRejectedCases(INVALID_PHONES, T.errors);

  // Recovery: 10 digits allows progression
  await form.resetStepPhone?.();
  await form.phoneInput().fill(USER.valid.phone);
  await form.expectPhoneDigitsCount(10);
  await form.submitStep();

  // Should reach Thank you page
  await form.expectUrlToBe(T.thankYou.url);
});
