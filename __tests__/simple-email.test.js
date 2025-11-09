/**
 * @jest-environment jsdom
 */

beforeEach(() => {
  // Reset modules to ensure fresh execution of simple-email.js
  jest.resetModules();
  // Mock global EmailJS
  global.emailjs = {
    init: jest.fn(),
    send: jest.fn(() => Promise.resolve({ text: 'OK' }))
  };
});

test('sendNewsletterSignup calls emailjs.send with newsletter template', async () => {
  // Require the script which attaches global sendNewsletterSignup
  require('../simple-email.js');

  // sendNewsletterSignup should be attached to global (window/globalThis)
  expect(typeof global.sendNewsletterSignup).toBe('function');

  const result = await global.sendNewsletterSignup('tester@example.com', 'Homepage');

  // Our mock returns {text:'OK'} and simple-email wraps that as success
  expect(result && result.success).toBe(true);

  // emailjs.send should have been called once
  expect(global.emailjs.send).toHaveBeenCalledTimes(1);

  const call = global.emailjs.send.mock.calls[0];
  // emailjs.send(serviceId, templateId, templateParams, userId)
  expect(call.length).toBeGreaterThanOrEqual(4);
  // Assert some known IDs from simple-email.js
  expect(call[1]).toBe('newsubs_kw32jj9');
  expect(call[3]).toBe('_Y8GKbzV16a70S4PI');

  const params = call[2];
  expect(params).toBeDefined();
  expect(params.user_email).toBe('tester@example.com');
  expect(params.page).toBe('Homepage');
  expect(params.reply_to).toBe('tester@example.com');
});
