// Admin Portal Functionality Test
// This script tests adding products, coupons, and updating content through the admin API

console.log('🧪 Testing Admin Portal Functionality...\n');

class AdminFunctionalityTester {
  constructor() {
    this.apiUrl = 'http://localhost:3001';
    this.authToken = null;
  }

  async authenticate() {
    console.log('🔐 Testing Authentication...');
    try {
      const response = await fetch(`${this.apiUrl}/api/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'AdminYaya',
          password: 'poem_123'
        })
      });

      const result = await response.json();
      if (result.success) {
        this.authToken = result.token;
        console.log('✅ Authentication successful');
        return true;
      } else {
        console.log('❌ Authentication failed:', result.message);
        return false;
      }
    } catch (error) {
      console.log('❌ Authentication error:', error.message);
      return false;
    }
  }

  async getCurrentData() {
    console.log('\n📊 Getting current site data...');
    try {
      const response = await fetch(`${this.apiUrl}/api/admin/data`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });

      const data = await response.json();
      console.log('✅ Current data retrieved:');
      console.log(`   📚 Products: ${data.products?.length || 0}`);
      console.log(`   🎫 Coupons: ${Object.keys(data.coupons || {}).length}`);
      return data;
    } catch (error) {
      console.log('❌ Failed to get data:', error.message);
      return null;
    }
  }

  async testProductManagement() {
    console.log('\n📚 Testing Product Management...');
    
    // Test adding a new product
    const newProduct = {
      id: 999,
      title: 'Test Poetry Collection',
      titleIcon: 'fas fa-heart',
      price: 15.99,
      isbn: '979-8-TEST-001',
      description: 'A test poetry collection to verify admin functionality works perfectly. This is a temporary product for testing purposes.',
      reviews: [{
        name: 'Admin Tester',
        rating: 5,
        text: 'Perfect for testing the admin system!',
        date: '2025-11-14'
      }],
      images: ['assets/test-cover.jpg']
    };

    try {
      const currentData = await this.getCurrentData();
      if (!currentData) return false;

      // Add the new product
      const updatedProducts = [...(currentData.products || []), newProduct];

      const response = await fetch(`${this.apiUrl}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ products: updatedProducts })
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Product added successfully');
        return true;
      } else {
        console.log('❌ Product addition failed:', result.error);
        return false;
      }
    } catch (error) {
      console.log('❌ Product management error:', error.message);
      return false;
    }
  }

  async testCouponManagement() {
    console.log('\n🎫 Testing Coupon Management...');
    
    // Test adding a new coupon
    const newCoupon = {
      code: 'ADMINTEST25',
      type: 'percentage',
      value: 25,
      description: '25% off for admin testing',
      active: true,
      created: new Date().toISOString()
    };

    try {
      const currentData = await this.getCurrentData();
      if (!currentData) return false;

      // Add the new coupon
      const updatedCoupons = {
        ...(currentData.coupons || {}),
        [newCoupon.code]: newCoupon
      };

      const response = await fetch(`${this.apiUrl}/api/admin/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ coupons: updatedCoupons })
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Coupon created successfully');
        console.log(`   Code: ${newCoupon.code}`);
        console.log(`   Discount: ${newCoupon.value}%`);
        return true;
      } else {
        console.log('❌ Coupon creation failed:', result.error);
        return false;
      }
    } catch (error) {
      console.log('❌ Coupon management error:', error.message);
      return false;
    }
  }

  async testContentUpdate() {
    console.log('\n✏️ Testing Content Management...');
    
    // Test updating site content
    const testContent = {
      tagline: 'Whimsical poet testing admin functionality! 🧪',
      heroDescription: 'Testing the admin portal with updated content to ensure everything works perfectly.',
      aboutBio: 'Yaya Starchild is testing the admin system. This bio has been updated via the admin portal to verify functionality.'
    };

    try {
      const response = await fetch(`${this.apiUrl}/api/admin/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ content: testContent })
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Content updated successfully');
        console.log(`   New tagline: "${testContent.tagline}"`);
        return true;
      } else {
        console.log('❌ Content update failed:', result.error);
        return false;
      }
    } catch (error) {
      console.log('❌ Content update error:', error.message);
      return false;
    }
  }

  async testDeployment() {
    console.log('\n🚀 Testing Site Deployment...');
    
    try {
      const response = await fetch(`${this.apiUrl}/api/admin/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ message: 'Admin portal functionality test' })
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Site deployed successfully');
        console.log('   Changes committed to Git and deployed');
        return true;
      } else {
        console.log('❌ Deployment failed:', result.error);
        return false;
      }
    } catch (error) {
      console.log('❌ Deployment error:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🎯 Running comprehensive admin functionality tests...\n');
    
    const tests = [
      { name: 'Authentication', test: () => this.authenticate() },
      { name: 'Data Retrieval', test: () => this.getCurrentData() },
      { name: 'Product Management', test: () => this.testProductManagement() },
      { name: 'Coupon Management', test: () => this.testCouponManagement() },
      { name: 'Content Management', test: () => this.testContentUpdate() },
      { name: 'Site Deployment', test: () => this.testDeployment() }
    ];

    let passed = 0;
    let failed = 0;

    for (const { name, test } of tests) {
      try {
        const result = await test();
        if (result !== false) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.log(`❌ ${name} test threw error:`, error.message);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 ADMIN FUNCTIONALITY TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
      console.log('\n🎉 All admin functionality tests PASSED!');
      console.log('🚀 Your admin portal is fully functional and ready for use.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    }
    
    console.log('\n💡 Visit http://localhost:3000/admin-login.html to use the admin portal');
    console.log('🔑 Login: AdminYaya / poem_123');
  }
}

// Run the functionality tests
const tester = new AdminFunctionalityTester();
tester.runAllTests();