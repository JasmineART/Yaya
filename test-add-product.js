// Simple Admin Product Test
// Test adding a new product via the admin API

async function testAddProduct() {
  console.log('🧪 Testing Product Addition via Admin API...\n');
  
  try {
    // Step 1: Authenticate
    console.log('🔐 Authenticating...');
    const authResponse = await fetch('http://localhost:3001/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'AdminYaya', password: 'poem_123' })
    });
    
    const authResult = await authResponse.json();
    if (!authResult.success) {
      console.log('❌ Authentication failed');
      return;
    }
    console.log('✅ Authenticated successfully');
    
    // Step 2: Get current products
    console.log('\n📊 Getting current products...');
    const dataResponse = await fetch('http://localhost:3001/api/admin/data', {
      headers: { 'Authorization': `Bearer ${authResult.token}` }
    });
    
    const currentData = await dataResponse.json();
    console.log(`✅ Current products: ${currentData.products.length}`);
    
    // Step 3: Add a new test product
    console.log('\n📚 Adding test product...');
    const newProduct = {
      id: Date.now(), // Use timestamp as unique ID
      title: 'Admin Test Poetry Book',
      titleIcon: 'fas fa-magic',
      price: 12.99,
      isbn: '979-8-TEST-' + Date.now().toString().slice(-3),
      description: 'A test poetry book created through the admin portal to verify functionality. Contains whimsical verses about testing and debugging.',
      reviews: [{
        name: 'Admin Tester',
        rating: 5,
        text: 'Perfect test book! The admin system works flawlessly.',
        date: new Date().toISOString().split('T')[0]
      }],
      images: ['assets/suncatcher-cover.jpg'] // Use existing image
    };
    
    const updatedProducts = [...currentData.products, newProduct];
    
    const updateResponse = await fetch('http://localhost:3001/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authResult.token}`
      },
      body: JSON.stringify({ products: updatedProducts })
    });
    
    const updateResult = await updateResponse.json();
    if (updateResult.success) {
      console.log('✅ Product added successfully!');
      console.log(`   📖 Title: "${newProduct.title}"`);
      console.log(`   💰 Price: $${newProduct.price}`);
      console.log(`   📚 ISBN: ${newProduct.isbn}`);
      console.log('   🚀 Changes deployed automatically');
    } else {
      console.log('❌ Product addition failed:', updateResult.error);
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAddProduct();