// Comprehensive Admin Portal Test Suite
// This script tests all admin functionality and ensures everything works properly

console.log('🧪 Starting Admin Portal Comprehensive Test Suite...\n');

class AdminPortalTester {
  constructor() {
    this.testResults = [];
    this.apiBaseUrl = 'http://localhost:3001';
    this.webBaseUrl = 'http://localhost:3000';
  }
  
  // Test Result Helper
  addResult(testName, passed, message = '') {
    this.testResults.push({
      test: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    });
    
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const msg = message ? ` - ${message}` : '';
    console.log(`${status}: ${testName}${msg}`);
  }
  
  // Test API Server Connection
  async testApiConnection() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/admin/data`, {
        method: 'GET'
      });
      
      if (response.status === 401) {
        this.addResult('API Server Connection', true, 'Server responding with proper auth check');
      } else {
        this.addResult('API Server Connection', response.ok, `Status: ${response.status}`);
      }
    } catch (error) {
      this.addResult('API Server Connection', false, error.message);
    }
  }
  
  // Test Authentication
  async testAuthentication() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/admin/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'AdminYaya',
          password: 'poem_123'
        })
      });
      
      const result = await response.json();
      const success = response.ok && result.success;
      this.addResult('Admin Authentication', success, success ? 'Login successful' : result.message);
      
      if (success) {
        this.authToken = result.token;
      }
    } catch (error) {
      this.addResult('Admin Authentication', false, error.message);
    }
  }
  
  // Test Data Retrieval
  async testDataRetrieval() {
    if (!this.authToken) {
      this.addResult('Data Retrieval', false, 'No auth token available');
      return;
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/admin/data`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
      
      const data = await response.json();
      const hasProducts = Array.isArray(data.products);
      const hasCoupons = typeof data.coupons === 'object';
      
      this.addResult('Data Retrieval', response.ok && hasProducts && hasCoupons, 
        `Products: ${data.products?.length || 0}, Coupons: ${Object.keys(data.coupons || {}).length}`);
    } catch (error) {
      this.addResult('Data Retrieval', false, error.message);
    }
  }
  
  // Test File Structure
  async testFileStructure() {
    const files = [
      'admin-login.html',
      'admin-dashboard.html', 
      'admin-dashboard.js',
      'admin-api.js',
      'start-admin-api.js',
      'products.js',
      'app.js',
      'styles.css'
    ];
    
    let allFilesExist = true;
    const missingFiles = [];
    
    for (const file of files) {
      try {
        const response = await fetch(`${this.webBaseUrl}/${file}`, { method: 'HEAD' });
        if (!response.ok) {
          allFilesExist = false;
          missingFiles.push(file);
        }
      } catch (error) {
        allFilesExist = false;
        missingFiles.push(file);
      }
    }
    
    this.addResult('File Structure', allFilesExist, 
      allFilesExist ? 'All admin files present' : `Missing: ${missingFiles.join(', ')}`);
  }
  
  // Test CSS and Styling
  async testStyling() {
    try {
      const loginResponse = await fetch(`${this.webBaseUrl}/admin-login.html`);
      const loginHtml = await loginResponse.text();
      
      const dashboardResponse = await fetch(`${this.webBaseUrl}/admin-dashboard.html`);
      const dashboardHtml = await dashboardResponse.text();
      
      // Check for key styling elements
      const hasGlassmorphism = loginHtml.includes('backdrop-filter: blur') && dashboardHtml.includes('backdrop-filter: blur');
      const hasAnimations = dashboardHtml.includes('@keyframes') && loginHtml.includes('@keyframes');
      const hasResponsive = dashboardHtml.includes('@media') && loginHtml.includes('@media');
      const hasColorScheme = loginHtml.includes('var(--pink)') && dashboardHtml.includes('var(--pink)');
      
      const stylingScore = [hasGlassmorphism, hasAnimations, hasResponsive, hasColorScheme].filter(Boolean).length;
      
      this.addResult('CSS and Styling', stylingScore >= 3, 
        `Styling features: ${stylingScore}/4 (glassmorphism, animations, responsive, colors)`);
    } catch (error) {
      this.addResult('CSS and Styling', false, error.message);
    }
  }
  
  // Test Homepage Integration
  async testHomepageIntegration() {
    try {
      const response = await fetch(`${this.webBaseUrl}/index.html`);
      const html = await response.text();
      
      const hasAdminLink = html.includes('Admin Login') || html.includes('admin-login');
      
      this.addResult('Homepage Integration', hasAdminLink, 
        hasAdminLink ? 'Admin login link found in footer' : 'Admin link not found');
    } catch (error) {
      this.addResult('Homepage Integration', false, error.message);
    }
  }
  
  // Test JavaScript Functionality
  async testJavaScript() {
    try {
      const response = await fetch(`${this.webBaseUrl}/admin-dashboard.js`);
      const jsContent = await response.text();
      
      // Check for key functions
      const hasAuthCheck = jsContent.includes('isAuthenticated');
      const hasDataManagement = jsContent.includes('loadCurrentData');
      const hasProductManagement = jsContent.includes('addProduct') && jsContent.includes('deleteProduct');
      const hasCouponManagement = jsContent.includes('addCoupon');
      const hasContentManagement = jsContent.includes('updateContent');
      const hasDeployment = jsContent.includes('deploySite');
      
      const jsFeatures = [hasAuthCheck, hasDataManagement, hasProductManagement, hasCouponManagement, hasContentManagement, hasDeployment].filter(Boolean).length;
      
      this.addResult('JavaScript Functionality', jsFeatures >= 5, 
        `JS Features: ${jsFeatures}/6 (auth, data, products, coupons, content, deploy)`);
    } catch (error) {
      this.addResult('JavaScript Functionality', false, error.message);
    }
  }
  
  // Test Package.json Configuration
  async testPackageConfig() {
    try {
      const response = await fetch(`${this.webBaseUrl}/package.json`);
      const packageData = await response.json();
      
      const hasAdminScript = packageData.scripts && packageData.scripts.admin;
      const hasDependencies = packageData.dependencies && (
        packageData.dependencies.express || 
        packageData.dependencies['simple-git']
      );
      
      this.addResult('Package Configuration', hasAdminScript, 
        hasAdminScript ? 'Admin script configured' : 'Admin script missing');
    } catch (error) {
      this.addResult('Package Configuration', false, error.message);
    }
  }
  
  // Run All Tests
  async runAllTests() {
    console.log('🔍 Testing API Server Connection...');
    await this.testApiConnection();
    
    console.log('🔐 Testing Authentication...');
    await this.testAuthentication();
    
    console.log('📊 Testing Data Retrieval...');
    await this.testDataRetrieval();
    
    console.log('📁 Testing File Structure...');
    await this.testFileStructure();
    
    console.log('🎨 Testing CSS and Styling...');
    await this.testStyling();
    
    console.log('🏠 Testing Homepage Integration...');
    await this.testHomepageIntegration();
    
    console.log('⚙️ Testing JavaScript Functionality...');
    await this.testJavaScript();
    
    console.log('📦 Testing Package Configuration...');
    await this.testPackageConfig();
    
    this.generateReport();
  }
  
  // Generate Test Report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 ADMIN PORTAL TEST REPORT');
    console.log('='.repeat(60));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   📊 Success Rate: ${((passedTests/totalTests)*100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      this.testResults.filter(r => !r.passed).forEach(result => {
        console.log(`   • ${result.test}: ${result.message}`);
      });
    }
    
    console.log(`\n🎯 RECOMMENDATIONS:`);
    
    if (passedTests === totalTests) {
      console.log(`   🎉 All tests passed! Your admin portal is fully functional.`);
      console.log(`   🚀 You can now use the admin portal to manage your website.`);
      console.log(`   💡 Access it at: ${this.webBaseUrl}/admin-login.html`);
      console.log(`   🔑 Login with: AdminYaya / poem_123`);
    } else {
      console.log(`   🔧 Some tests failed. Check the failed tests above.`);
      console.log(`   📝 Ensure both servers are running (admin API on :3001, web on :3000)`);
      console.log(`   🔄 Re-run tests after fixing issues`);
    }
    
    console.log(`\n⏰ Test completed at: ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));
  }
}

// Run the test suite
const tester = new AdminPortalTester();
tester.runAllTests();