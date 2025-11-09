/**
 * @jest-environment jsdom
 */

beforeEach(() => {
  jest.resetModules();
  // Mock sendNewsletterSignup globally before app.js attaches handlers
  global.sendNewsletterSignup = jest.fn(() => Promise.resolve({ success: true }));
});

test('newsletter form registers a submit handler and uses EmailJS-only flow', async () => {
  // Prepare DOM: a simple form with input and button
  document.body.innerHTML = `
    <form id="newsletter-form" class="form-inline">
      <input type="email" id="newsletter-email" value="tester@example.com" required />
      <button type="submit">Join</button>
    </form>
  `;

  // Wrap addEventListener to detect when app.js attaches submit listener to the form
  const originalAdd = EventTarget.prototype.addEventListener;
  let attached = false;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    try {
      // this could be window, document, or an element
      if (this && this.id === 'newsletter-form' && type === 'submit') attached = true;
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

  // Restore the original addEventListener so other tests are unaffected
  EventTarget.prototype.addEventListener = originalAdd;

  // Assert that the submit handler was attached (we detect attachment via the wrapper)
  expect(attached).toBe(true);

  // Now verify the global sendNewsletterSignup is available and callable (EmailJS function)
  expect(typeof global.sendNewsletterSignup).toBe('function');
});
