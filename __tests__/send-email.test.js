const { getEmailTemplate } = require('../cloud-functions/send-email/index.js');

test('getEmailTemplate returns newsletter HTML with subscriber email and subject', () => {
  const data = {
    email: 'sub@example.com',
    source: 'Homepage',
    text: '',
    items: [],
    total: 0,
    customerName: '',
    customerEmail: '',
    shippingAddress: ''
  };
  const tmpl = getEmailTemplate('newsletter', data);
  expect(tmpl).toBeDefined();
  expect(tmpl.subject).toMatch(/Newsletter|Subscriber/);
  expect(tmpl.html).toMatch(/sub@example.com/);
  expect(tmpl.html).toMatch(/Homepage/);
});

test('getEmailTemplate returns order template with items and total', () => {
  const data = { total: 42.5, customerName: 'Alice', customerEmail: 'alice@example.com', shippingAddress: '123 Star Rd', items: [{ name: 'Book', quantity: 1, price: 42.5 }], text: '', email: '' };
  const tmpl = getEmailTemplate('order', data);
  expect(tmpl).toBeDefined();
  expect(tmpl.subject).toMatch(/Order/);
  expect(tmpl.html).toMatch(/Alice/);
  expect(tmpl.html).toMatch(/Book/);
  expect(tmpl.html).toMatch(/\$42.5/);
});
