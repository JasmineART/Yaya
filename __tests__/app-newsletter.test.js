/**
 * @jest-environment jsdom
 */

beforeEach(() => {
  jest.resetModules();
  // mock global alert so tests don't pollute stdout
  global.alert = jest.fn();
});

test('newsletter form monitoring with EmailOctopus integration calls sendNewsletterSignup', async () => {
  // Provide a mock sendNewsletterSignup that simulates EmailJS success
  global.sendNewsletterSignup = jest.fn(() => Promise.resolve({ success: true }));

  // Create EmailOctopus form DOM structure
  document.body.innerHTML = `
    <div id="emailoctopus-form-container">
      <form data-form="e717b62a-7d10-11f0-b467-0f9ecebb753c">
        <input type="email" value="tester@example.com" />
        <button type="submit">Subscribe</button>
      </form>
    </div>
    <div id="announcements"></div>
  `;

  // Require app.js which registers DOMContentLoaded listener
  require('../app.js');

  // Trigger DOMContentLoaded so app.js attaches handlers and runs initialization
  document.dispatchEvent(new Event('DOMContentLoaded'));

  // Wait for the monitoring interval to find and set up the form
  await new Promise(resolve => setTimeout(resolve, 1100));

  // Simulate EmailOctopus form submission
  const emailOctopusForm = document.querySelector('form[data-form="e717b62a-7d10-11f0-b467-0f9ecebb753c"]');
  emailOctopusForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

  // Wait for async handlers to complete (including the 500ms delay)
  await new Promise(resolve => setTimeout(resolve, 600));

  // Assertions
  expect(global.sendNewsletterSignup).toHaveBeenCalledTimes(1);
  expect(global.sendNewsletterSignup).toHaveBeenCalledWith('tester@example.com', expect.any(String));
});

test('EmailOctopus callback integration calls sendNewsletterSignup', async () => {
  // Provide a mock sendNewsletterSignup that simulates EmailJS success
  global.sendNewsletterSignup = jest.fn(() => Promise.resolve({ success: true }));

  // Create EmailOctopus form DOM structure
  document.body.innerHTML = `
    <div id="emailoctopus-form-container">
      <form data-form="e717b62a-7d10-11f0-b467-0f9ecebb753c">
        <input type="email" value="callback-test@example.com" />
        <button type="submit">Subscribe</button>
      </form>
    </div>
  `;

  // Require app.js which registers DOMContentLoaded listener
  require('../app.js');

  // Trigger DOMContentLoaded so app.js attaches handlers and runs initialization
  document.dispatchEvent(new Event('DOMContentLoaded'));

  // Wait for the monitoring interval to find and set up the form
  await new Promise(resolve => setTimeout(resolve, 1100));

  // Simulate EmailOctopus success callback
  if (window.EmailOctopusCallback && window.EmailOctopusCallback.onSuccess) {
    await window.EmailOctopusCallback.onSuccess('e717b62a-7d10-11f0-b467-0f9ecebb753c');
  }

  // Wait for async handlers to complete
  await new Promise(resolve => setTimeout(resolve, 100));

  // Assertions
  expect(global.sendNewsletterSignup).toHaveBeenCalledTimes(1);
  expect(global.sendNewsletterSignup).toHaveBeenCalledWith('callback-test@example.com', expect.any(String));
});
