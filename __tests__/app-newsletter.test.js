/**
 * @jest-environment jsdom
 */

beforeEach(() => {
  jest.resetModules();
  // mock global alert so tests don't pollute stdout
  global.alert = jest.fn();
});

test('newsletter form in app.js calls sendNewsletterSignup and shows success alert', async () => {
  // Provide a mock sendNewsletterSignup that simulates EmailJS success
  global.sendNewsletterSignup = jest.fn(() => Promise.resolve({ success: true }));

  // Create minimal DOM expected by app.js for newsletter
  document.body.innerHTML = `
    <form id="newsletter-form" class="form-inline">
      <input type="email" id="newsletter-email" placeholder="Your email ✨" aria-label="Email" required />
      <button class="btn primary" type="submit">Join</button>
    </form>
    <div id="announcements"></div>
  `;

  // Require app.js which registers DOMContentLoaded listener
  require('../app.js');

  // Trigger DOMContentLoaded so app.js attaches handlers and runs initialization
  document.dispatchEvent(new Event('DOMContentLoaded'));

  // Fill in email and submit the form
  const emailInput = document.getElementById('newsletter-email');
  emailInput.value = 'tester@example.com';
  const form = document.getElementById('newsletter-form');

  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

  // Wait for async handlers to complete
  await new Promise(resolve => setTimeout(resolve, 20));

  // Assertions
  expect(global.sendNewsletterSignup).toHaveBeenCalledTimes(1);
  expect(global.sendNewsletterSignup).toHaveBeenCalledWith('tester@example.com', expect.any(String));
  expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Thanks'));
  // Ensure the form was reset
  expect(emailInput.value).toBe('');
});
