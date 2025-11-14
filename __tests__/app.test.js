/**
 * @jest-environment jsdom
 */

beforeEach(() => {
  jest.resetModules();
});

test('newsletter form initialization sets up EmailOctopus form callback', async () => {
  // Prepare DOM: EmailOctopus form structure
  document.body.innerHTML = `
    <div id="emailoctopus-form-container">
      <form data-form="e717b62a-7d10-11f0-b467-0f9ecebb753c">
        <input type="email" value="tester@example.com" />
        <button type="submit">Subscribe</button>
      </form>
    </div>
  `;

  // Require app.js which registers DOMContentLoaded listener and exposes init function
  require('../app.js');

  // Call the exposed initializer directly for deterministic testing
  if (typeof window.initNewsletterForm === 'function') {
    window.initNewsletterForm();
  }

  // Wait for the monitoring interval to find and set up the EmailOctopus form
  await new Promise(resolve => setTimeout(resolve, 1100));

  // Verify EmailOctopus callback was set up
  expect(typeof window.EmailOctopusCallback).toBe('object');
  expect(typeof window.EmailOctopusCallback.onSuccess).toBe('function');
});
