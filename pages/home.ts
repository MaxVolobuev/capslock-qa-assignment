import { Page, Locator, expect } from '@playwright/test';
import {
  Step,
  GoToNameEmailRequest,
  GoToPhoneRequest,
  NonOwnedEstimateRequest,
  OwnedEstimateRequest,
  PROPERTY_TYPES,
  PropertyType,
  WhyInterested,
  OutOfAreaRequest,
} from '../types/index';
import { ATTR } from '../constants/dom';
import { INVALID_PHONES } from '../data/userData';

// EstimateFormPage models the multi-step estimate request form on the home page
// It supports interactions and assertions for the form, including different user flows
// such as owned property, non-owned property, and out-of-area scenarios.
export class EstimateFormPage {
  constructor(
    private page: Page,
    private containerSelector: string,
  ) {}

  private root(): Locator {
    return this.page.locator(this.containerSelector);
  }

  // Locators
  zipInput(): Locator {
    return this.root().locator('[data-zip-code-input]');
  }
  nameInput(): Locator {
    return this.root().locator('[data-name-input]');
  }
  phoneInput(): Locator {
    return this.root().locator('[data-phone-input]');
  }
  emailInput(): Locator {
    return this.root().locator('input[name="email"]:visible');
  }

  progressValue(): Locator {
    return this.root().locator('[data-form-progress-value]');
  }

  outOfAreaHeader(): Locator {
    return this.root().locator('[data-sorry-fade-out]');
  }

  thankYouOutOfArea(): Locator {
    return this.root().locator('[data-sorry-fade-in]');
  }

  progressCurrentStep(): Locator {
    return this.root().locator('[data-form-progress-current-step]');
  }

  progressTotalSteps(): Locator {
    return this.root().locator('[data-form-progress-total-steps]');
  }

  stepForm(): Locator {
    return this.root().locator('.step-3 form');
  }

  thankYouRoot(): Locator {
    return this.page.locator('.heroThankYou');
  }

  thankYouHeader(): Locator {
    return this.page.locator('h1.heroThankYou__hdr');
  }

  thankYouCallText(prefix: string): Locator {
    return this.page.locator('.heroThankYou__txt').filter({ hasText: prefix });
  }

  nextButton(): Locator {
    return this.root().locator('button[type="submit"]:visible');
  }

  step(step: Step): Locator {
    return this.root().locator(`.step-${step}`);
  }

  async expectStayOnStep(step: Step) {
    await expect(this.progressCurrentStep()).toHaveText(String(step));
    await expect(this.step(step)).toBeVisible();
  }

  stepErrorBlock(step: Step): Locator {
    return this.step(step).locator('[data-error-block]');
  }

  stepErrorText(step: Step): Locator {
    return this.stepErrorBlock(step).filter({ hasText: /\S/ });
  }

  async expectStepState(step: Step, state: 'visible' | 'hidden') {
    const s = this.step(step);

    if (state === 'visible') {
      await expect(s).toBeVisible();
    } else {
      await expect(s).toBeHidden();
    }
  }

  // Actions and assertions
  async open() {
    await this.page.goto('/');
  }

  async submitStep() {
    await this.nextButton().click();
  }

  whyInterestedCheckbox(labelText: WhyInterested): Locator {
    return this.root().locator('label', { hasText: labelText });
  }

  ownedPropertyRadio(value: PropertyType): Locator {
    return this.root().locator('label', { hasText: value });
  }

  async fillZip(zip: string) {
    await this.zipInput().fill(zip);
  }

  async expectOutOfAreaVisible(expectedText: string) {
    const block = this.outOfAreaHeader();

    await expect(block).toBeVisible();
    await expect(block).toContainText(expectedText);
  }

  async expectOutOfAreaThankYouVisible(expectedText: string) {
    const header = this.thankYouOutOfArea();

    await expect(header).toBeVisible();
    await expect(header).toHaveText(expectedText);
  }

  async pickWhyInterested(...options: WhyInterested[]) {
    for (const opt of new Set(options)) {
      await this.whyInterestedCheckbox(opt).click();
    }
  }

  async fillNameEmail(name: string, email: string) {
    await this.nameInput().fill(name);
    await this.emailInput().fill(email);
  }

  async fillPhone(phone: string) {
    await this.phoneInput().fill(phone);
  }

  async expectThankYouCallText(prefix: string, minutes: string) {
    const text = this.thankYouCallText(prefix);
    await expect(text).toBeVisible();
    await expect(text).toContainText(prefix);
    await expect(text).toContainText(minutes);
  }

  async expectThankYou(expected: { header: string; callPrefix: string; callMinutes: string }) {
    // Page visible
    await expect(this.thankYouRoot()).toBeVisible();

    // Header
    await expect(this.thankYouHeader()).toHaveText(expected.header);

    // Call text visible and correct
    await this.expectThankYouCallText(expected.callPrefix, expected.callMinutes);
  }

  async expectErrorVisible(error: Locator) {
    await expect(error).toBeVisible();
  }

  async expectErrorHidden(error: Locator) {
    await expect(error).toBeHidden();
  }

  async expectEmailHtml5Validation(input: Locator) {
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'email');
  }

  async expectHtml5Invalid(input: Locator, opts?: { expectMessage?: boolean }) {
    await expect
      .poll(async () => input.evaluate((el) => (el as HTMLInputElement).checkValidity()))
      .toBe(false);

    if (opts?.expectMessage ?? true) {
      await expect
        .poll(async () => input.evaluate((el) => (el as HTMLInputElement).validationMessage))
        .not.toBe('');
    }
  }

  async resetStepNameEmail() {
    await this.nameInput().clear();
    await this.emailInput().clear();
  }

  async resetStepPhone() {
    await this.phoneInput().clear();
  }

  async expectUrlToBe(url: string) {
    await expect(this.page).toHaveURL(url);
  }

  async expectPhoneDigitsCount(expected: number) {
    const digits = await this.phoneInput().evaluate((el) =>
      (el as HTMLInputElement).value.replace(/\D/g, ''),
    );
    expect(digits.length).toBe(expected);
  }

  // Flows
  async submitOwnedFlow(request: OwnedEstimateRequest) {
    // Step 1
    await this.fillZip(request.zip);
    await this.submitStep();

    // Step 2
    await this.pickWhyInterested(...request.whyInterested);
    await this.submitStep();

    // Step 3
    await this.ownedPropertyRadio(request.propertyType).click();
    await this.submitStep();

    // Step 4
    await this.fillNameEmail(request.name, request.email);
    await this.submitStep();

    // Step 5
    await this.fillPhone(request.phone);
    await this.submitStep();
  }

  async expectStepPropertyRestriction(expectedText: string) {
    const form = this.stepForm();

    await expect(form).toBeVisible();

    await expect(form).toHaveAttribute(ATTR.ERROR_TEXT, expectedText);

    await expect(this.stepErrorText(3)).toBeVisible();
    await expect(this.stepErrorText(3)).toHaveText(expectedText);
  }

  async submitNonOwnedFlow(
    request: NonOwnedEstimateRequest,
    expected: { propertyErrorText: string },
  ) {
    await this.fillZip(request.zip);
    await this.submitStep();

    await this.pickWhyInterested(...request.whyInterested);
    await this.submitStep();

    await this.ownedPropertyRadio(request.propertyType).click();
    await this.submitStep();

    await this.expectStepPropertyRestriction(expected.propertyErrorText);

    // Step 4 should not be visible
    await this.expectStepState(4, 'hidden');
  }

  async submitOutOfAreaFlow(request: OutOfAreaRequest) {
    // Step 1: zip
    await this.fillZip(request.zip);
    await this.submitStep();

    // Out-of-area gate
    await this.expectOutOfAreaVisible(request.expectedHeaderText);

    // Contract: email input must use native HTML5 validation
    await this.expectEmailHtml5Validation(this.emailInput());

    // Email submit
    await this.emailInput().fill(request.email);
    await this.submitStep();

    // Thank-you text in out-of-area block
    await this.expectOutOfAreaThankYouVisible(request.expectedThankYouText);
  }

  async goToNameAndEmailStep(request: GoToNameEmailRequest) {
    // Step 1
    await this.fillZip(request.zip);
    await this.submitStep();

    // Step 2
    await this.pickWhyInterested(...request.whyInterested);
    await this.submitStep();

    // Step 3
    await this.ownedPropertyRadio(request.propertyType).click();
    await this.submitStep();

    // NON-OWNED: stop here
    if (request.propertyType !== PROPERTY_TYPES.OWNED) {
      await expect(this.stepErrorText(3)).toBeVisible();
      await this.expectStepState(4, 'hidden');

      return;
    }

    // Step 4 visible
    await this.expectStepState(4, 'visible');
  }

  async goToPhoneStep(request: GoToPhoneRequest) {
    await this.goToNameAndEmailStep(request);

    if (request.propertyType !== PROPERTY_TYPES.OWNED) return;

    await this.fillNameEmail(request.name, request.email);
    await this.submitStep();

    // Step 5 visible
    await this.expectStepState(5, 'visible');
  }

  async assertEmailHtml5Blocks(invalidEmails: readonly string[], name: string, step: Step = 4) {
    for (const email of invalidEmails) {
      await this.resetStepNameEmail();
      await this.nameInput().fill(name);

      if (email) {
        await this.emailInput().fill(email);
      }

      await this.submitStep();
      await this.expectHtml5Invalid(this.emailInput());
      await this.expectStayOnStep(step);
    }
  }

  async assertPhoneRejectedCases(
    phones: typeof INVALID_PHONES,
    errors: { phoneRequired: string; wrongPhoneNumber: string },
    step: Step = 5,
  ) {
    for (const c of phones) {
      await this.resetStepPhone();

      if (c.value) {
        await this.phoneInput().fill(c.value);
      }

      await this.submitStep();

      await this.expectStayOnStep(step);
      await expect(this.stepErrorText(step)).toHaveText(errors[c.expectTextKey]);
    }
  }
}
