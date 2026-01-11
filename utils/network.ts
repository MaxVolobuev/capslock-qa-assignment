import { expect, Page } from '@playwright/test';
import type { Request } from '@playwright/test';

// waitForZipSubmit waits for a network request that submits the zip code for the given step number
// It returns a Promise that resolves to the intercepted Request object
export async function waitForZipSubmit(
  page: Page,
  zip: string,
  stepNumber = 1,
  timeout = 30_000,
): Promise<Request> {
  return page.waitForRequest(
    (req) => {
      if (req.method() !== 'POST') return false;
      if (!req.url().includes('/test-task/handle-form')) return false;

      const post = req.postData() ?? '';
      return post.includes(`stepNumber=${stepNumber}`) && post.includes(`zipCode=${zip}`);
    },
    { timeout },
  );
}

// assertZipSubmitted asserts that the given request contains the expected zip code in its POST data
// requestPromise: a Promise that resolves to the Request object to check
export async function assertZipSubmitted(requestPromise: Promise<Request>, zip: string) {
  const req = await requestPromise;
  const body = req.postData() ?? '';

  expect(body).toContain(`zipCode=${zip}`);
}
