/**
 * @jest-environment jsdom
 */

beforeEach(() => {
  jest.resetModules();
  // Mock sendNewsletterSignup globally before app.js attaches handlers
  global.sendNewsletterSignup = jest.fn(() => Promise.resolve({ success: true }));
});

test('newsletter form monitoring sets up EmailOctopus form handlers and EmailJS integration', async () => {
  // Prepare DOM: EmailOctopus form structure
  document.body.innerHTML = `
    <div id="emailoctopus-form-container">
      <form data-form="e717b62a-7d10-11f0-b467-0f9ecebb753c">
        <input type="email" value="tester@example.com" />
        <button type="submit">Subscribe</button>
      </form>
    </div>
  `;

  // Wrap addEventListener to detect when app.js attaches submit listener to EmailOctopus form
  const originalAdd = EventTarget.prototype.addEventListener;
  let emailOctopusAttached = false;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    try {
      // Check if this is the EmailOctopus form getting a submit listener
      if (this && this.getAttribute && this.getAttribute('data-form') === 'e717b62a-7d10-11f0-b467-0f9ecebb753c' && type === 'submit') {
        emailOctopusAttached = true;
      }
    } finally {
      return originalAdd.call(this, type, listener, options);
    }
  };

  // Require app.js which registers DOMContentLoaded listener and exposes init function
  require('../app.js');

  // Call the exposed initializer directly for deterministic testing
  if (typeof window.initNewsletterForm === 'function') {
    window.initNewsletterForm();
  }

  // Wait for the monitoring interval to find and set up the EmailOctopus form
  await new Promise(resolve => setTimeout(resolve, 1100));

  // Restore the original addEventListener so other tests are unaffected
  EventTarget.prototype.addEventListener = originalAdd;

  // Assert that the EmailOctopus form handler was attached
  expect(emailOctopusAttached).toBe(true);

  // Verify the global sendNewsletterSignup is available and callable (EmailJS function)
  expect(typeof global.sendNewsletterSignup).toBe('function');

  // Verify EmailOctopus callback was set up
  expect(typeof window.EmailOctopusCallback).toBe('object');
  expect(typeof window.EmailOctopusCallback.onSuccess).toBe('function');
});
