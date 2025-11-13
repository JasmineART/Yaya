// Simulate what the client sends to the server
const testData = {
  items: [{id: 1, title: 'Suncatcher Spirit', price: 18.99, qty: 2, name: 'Suncatcher Spirit', quantity: 2}],
  customer: {name: 'Test User', email: 'test@example.com'},
  discountAmount: 0,
  discountCode: '',
  shipping: 9.99,
  tax: 3.23,  // 8.5% of (18.99 * 2) = 37.98
  taxRate: 0.085,
  subtotal: 37.98,
  total: 51.20  // 37.98 + 9.99 + 3.23
};

console.log('📦 Test Data Being Sent to Stripe:');
console.log(JSON.stringify(testData, null, 2));

// Simulate server processing
const line_items = testData.items.map(item => ({
  price_data: {
    currency: 'usd',
    product_data: {
      name: item.name || item.title || 'Product'
    },
    unit_amount: Math.round((item.price || 0) * 100)
  },
  quantity: item.quantity || item.qty || 1
}));

console.log('\n📋 Line Items (Products):');
line_items.forEach(li => {
  console.log(`  - ${li.price_data.product_data.name}: $${li.price_data.unit_amount/100} x ${li.quantity} = $${(li.price_data.unit_amount * li.quantity)/100}`);
});

// Add shipping
if (testData.shipping && testData.shipping > 0) {
  line_items.push({
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'Standard Shipping'
      },
      unit_amount: Math.round(testData.shipping * 100)
    },
    quantity: 1
  });
  console.log(`  - Standard Shipping: $${testData.shipping}`);
}

// Add tax
if (testData.tax && testData.tax > 0) {
  line_items.push({
    price_data: {
      currency: 'usd',
      product_data: {
        name: `Sales Tax (${testData.taxRate * 100}%)`
      },
      unit_amount: Math.round(testData.tax * 100)
    },
    quantity: 1
  });
  console.log(`  - Sales Tax: $${testData.tax}`);
}

const stripeTotal = line_items.reduce((sum, item) => {
  return sum + (item.price_data.unit_amount * item.quantity);
}, 0) / 100;

console.log('\n💰 Stripe Checkout Total: $' + stripeTotal.toFixed(2));
console.log('💰 Expected Total: $' + testData.total.toFixed(2));
console.log(stripeTotal === testData.total ? '✅ Totals match!' : '⚠️  Totals DO NOT match!');
