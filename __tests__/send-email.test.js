const { getEmailTemplate } = require('../cloud-functions/send-email/index.js');



test('getEmailTemplate returns order template with items and total', () => {
  const data = { total: 42.5, customerName: 'Alice', customerEmail: 'alice@example.com', shippingAddress: '123 Star Rd', items: [{ name: 'Book', quantity: 1, price: 42.5 }], text: '', email: '' };
  const tmpl = getEmailTemplate('order', data);
  expect(tmpl).toBeDefined();
  expect(tmpl.subject).toMatch(/Order/);
  expect(tmpl.html).toMatch(/Alice/);
  expect(tmpl.html).toMatch(/Book/);
  expect(tmpl.html).toMatch(/\$42.5/);
});
