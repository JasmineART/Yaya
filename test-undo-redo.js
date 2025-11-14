// Test file for Admin Portal Undo/Redo functionality
// This tests the undo and redo functionality of the admin dashboard

class UndoRedoTester {
  constructor() {
    this.testResults = [];
    this.originalData = null;
  }
  
  async runAllTests() {
    console.log('🧪 Starting Undo/Redo Functionality Tests...\n');
    
    // Initialize admin instance for testing
    if (typeof AdminDashboard === 'undefined') {
      console.error('❌ AdminDashboard class not found');
      return false;
    }
    
    // Simulate authentication for testing
    sessionStorage.setItem('adminAuthenticated', 'true');
    sessionStorage.setItem('adminLoginTime', Date.now().toString());
    
    const admin = new AdminDashboard();
    this.admin = admin;
    
    // Store original data
    this.originalData = JSON.parse(JSON.stringify(admin.currentData));
    
    try {
      await this.testUndoRedoInitialization();
      await this.testProductUndoRedo();
      await this.testCouponUndoRedo();
      await this.testContentUndoRedo();
      await this.testMultipleUndoRedo();
      await this.testUndoRedoLimits();
      await this.testUndoRedoButtons();
      
      this.printResults();
      return this.testResults.every(test => test.passed);
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      return false;
    }
  }
  
  async testUndoRedoInitialization() {
    console.log('📋 Testing undo/redo initialization...');
    
    try {
      // Test initial state
      this.assert(Array.isArray(this.admin.undoStack), 'Undo stack should be an array');
      this.assert(Array.isArray(this.admin.redoStack), 'Redo stack should be an array');
      this.assert(this.admin.undoStack.length === 0, 'Undo stack should be empty initially');
      this.assert(this.admin.redoStack.length === 0, 'Redo stack should be empty initially');
      this.assert(this.admin.maxHistorySize === 50, 'Max history size should be 50');
      
      console.log('✅ Undo/redo initialization test passed\n');
    } catch (error) {
      console.log('❌ Undo/redo initialization test failed:', error.message, '\n');
    }
  }
  
  async testProductUndoRedo() {
    console.log('🛍️ Testing product undo/redo functionality...');
    
    try {
      const initialProductCount = this.admin.currentData.products.length;
      
      // Test adding a product
      const testProduct = {
        title: 'Test Product for Undo',
        price: 25.99,
        description: 'A test product for undo/redo functionality',
        images: ['test-image.jpg']
      };
      
      // Mock form data
      this.mockFormData('product-title', testProduct.title);
      this.mockFormData('product-price', testProduct.price);
      this.mockFormData('product-description', testProduct.description);
      this.mockFormData('product-image', testProduct.images[0]);
      this.mockFormData('product-icon', 'fas fa-test');
      
      // Add product
      this.admin.addProduct();
      
      // Verify product was added
      this.assert(this.admin.currentData.products.length === initialProductCount + 1, 'Product should be added');
      this.assert(this.admin.undoStack.length === 1, 'Undo stack should have one entry');
      
      // Test undo
      this.admin.undo();
      this.assert(this.admin.currentData.products.length === initialProductCount, 'Product should be removed after undo');
      this.assert(this.admin.redoStack.length === 1, 'Redo stack should have one entry');
      
      // Test redo
      this.admin.redo();
      this.assert(this.admin.currentData.products.length === initialProductCount + 1, 'Product should be restored after redo');
      
      console.log('✅ Product undo/redo test passed\n');
    } catch (error) {
      console.log('❌ Product undo/redo test failed:', error.message, '\n');
    }
  }
  
  async testCouponUndoRedo() {
    console.log('🎫 Testing coupon undo/redo functionality...');
    
    try {
      const initialCouponCount = Object.keys(this.admin.currentData.coupons).length;
      
      // Test adding a coupon
      this.mockFormData('coupon-code', 'TESTUNDO');
      this.mockFormData('coupon-type', 'percentage');
      this.mockFormData('coupon-value', '15');
      this.mockFormData('coupon-description', 'Test coupon for undo/redo');
      
      // Add coupon
      this.admin.addCoupon();
      
      // Verify coupon was added
      const newCouponCount = Object.keys(this.admin.currentData.coupons).length;
      this.assert(newCouponCount === initialCouponCount + 1, 'Coupon should be added');
      this.assert(this.admin.currentData.coupons['TESTUNDO'] !== undefined, 'Test coupon should exist');
      
      // Test undo
      this.admin.undo();
      const undoCouponCount = Object.keys(this.admin.currentData.coupons).length;
      this.assert(undoCouponCount === initialCouponCount, 'Coupon should be removed after undo');
      this.assert(this.admin.currentData.coupons['TESTUNDO'] === undefined, 'Test coupon should not exist after undo');
      
      // Test redo
      this.admin.redo();
      const redoCouponCount = Object.keys(this.admin.currentData.coupons).length;
      this.assert(redoCouponCount === initialCouponCount + 1, 'Coupon should be restored after redo');
      this.assert(this.admin.currentData.coupons['TESTUNDO'] !== undefined, 'Test coupon should exist after redo');
      
      console.log('✅ Coupon undo/redo test passed\n');
    } catch (error) {
      console.log('❌ Coupon undo/redo test failed:', error.message, '\n');
    }
  }
  
  async testContentUndoRedo() {
    console.log('📝 Testing content undo/redo functionality...');
    
    try {
      const originalContent = JSON.parse(JSON.stringify(this.admin.currentData.content));
      
      // Test updating content
      const testContent = {
        heroTitle: 'Test Hero Title for Undo',
        heroSubtitle: 'Test subtitle for undo/redo functionality',
        aboutText: 'Test about text'
      };
      
      this.admin.updateContent(testContent);
      
      // Verify content was updated
      this.assert(this.admin.currentData.content.heroTitle === testContent.heroTitle, 'Content should be updated');
      
      // Test undo
      this.admin.undo();
      this.assert(
        JSON.stringify(this.admin.currentData.content) === JSON.stringify(originalContent), 
        'Content should be restored after undo'
      );
      
      // Test redo
      this.admin.redo();
      this.assert(this.admin.currentData.content.heroTitle === testContent.heroTitle, 'Content should be updated after redo');
      
      console.log('✅ Content undo/redo test passed\n');
    } catch (error) {
      console.log('❌ Content undo/redo test failed:', error.message, '\n');
    }
  }
  
  async testMultipleUndoRedo() {
    console.log('🔄 Testing multiple undo/redo operations...');
    
    try {
      // Clear stacks for clean test
      this.admin.undoStack = [];
      this.admin.redoStack = [];
      
      // Perform multiple operations
      const operations = [
        () => this.admin.saveState('Operation 1'),
        () => this.admin.saveState('Operation 2'),
        () => this.admin.saveState('Operation 3')
      ];
      
      operations.forEach(op => op());
      
      this.assert(this.admin.undoStack.length === 3, 'Should have 3 operations in undo stack');
      
      // Undo twice
      this.admin.undo();
      this.admin.undo();
      
      this.assert(this.admin.undoStack.length === 1, 'Should have 1 operation left in undo stack');
      this.assert(this.admin.redoStack.length === 2, 'Should have 2 operations in redo stack');
      
      // Redo once
      this.admin.redo();
      
      this.assert(this.admin.undoStack.length === 2, 'Should have 2 operations in undo stack');
      this.assert(this.admin.redoStack.length === 1, 'Should have 1 operation in redo stack');
      
      console.log('✅ Multiple undo/redo test passed\n');
    } catch (error) {
      console.log('❌ Multiple undo/redo test failed:', error.message, '\n');
    }
  }
  
  async testUndoRedoLimits() {
    console.log('📊 Testing undo/redo limits...');
    
    try {
      // Clear stacks
      this.admin.undoStack = [];
      this.admin.redoStack = [];
      
      // Test empty stack operations
      this.admin.undo(); // Should not crash
      this.admin.redo(); // Should not crash
      
      this.assert(this.admin.undoStack.length === 0, 'Undo stack should remain empty');
      this.assert(this.admin.redoStack.length === 0, 'Redo stack should remain empty');
      
      // Test max history size
      for (let i = 0; i < this.admin.maxHistorySize + 10; i++) {
        this.admin.saveState(`Operation ${i}`);
      }
      
      this.assert(
        this.admin.undoStack.length === this.admin.maxHistorySize, 
        `Undo stack should be limited to ${this.admin.maxHistorySize} items`
      );
      
      console.log('✅ Undo/redo limits test passed\n');
    } catch (error) {
      console.log('❌ Undo/redo limits test failed:', error.message, '\n');
    }
  }
  
  async testUndoRedoButtons() {
    console.log('🔘 Testing undo/redo button states...');
    
    try {
      // Create mock buttons
      const undoBtn = document.createElement('button');
      undoBtn.id = 'undoBtn';
      const redoBtn = document.createElement('button');
      redoBtn.id = 'redoBtn';
      
      document.body.appendChild(undoBtn);
      document.body.appendChild(redoBtn);
      
      // Clear stacks
      this.admin.undoStack = [];
      this.admin.redoStack = [];
      
      // Test initial button states
      this.admin.updateUndoRedoButtons();
      this.assert(undoBtn.disabled === true, 'Undo button should be disabled when stack is empty');
      this.assert(redoBtn.disabled === true, 'Redo button should be disabled when stack is empty');
      
      // Add operation and test
      this.admin.saveState('Test operation');
      this.admin.updateUndoRedoButtons();
      this.assert(undoBtn.disabled === false, 'Undo button should be enabled when stack has items');
      this.assert(redoBtn.disabled === true, 'Redo button should remain disabled');
      
      // Test after undo
      this.admin.undo();
      this.admin.updateUndoRedoButtons();
      this.assert(undoBtn.disabled === true, 'Undo button should be disabled after undoing last item');
      this.assert(redoBtn.disabled === false, 'Redo button should be enabled after undo');
      
      // Clean up
      document.body.removeChild(undoBtn);
      document.body.removeChild(redoBtn);
      
      console.log('✅ Undo/redo button states test passed\n');
    } catch (error) {
      console.log('❌ Undo/redo button states test failed:', error.message, '\n');
    }
  }
  
  mockFormData(elementId, value) {
    let element = document.getElementById(elementId);
    if (!element) {
      element = document.createElement('input');
      element.id = elementId;
      element.type = 'text';
      document.body.appendChild(element);
    }
    element.value = value;
  }
  
  assert(condition, message) {
    const passed = Boolean(condition);
    this.testResults.push({
      message,
      passed,
      timestamp: new Date().toISOString()
    });
    
    if (!passed) {
      throw new Error(message);
    }
  }
  
  printResults() {
    console.log('\n📊 UNDO/REDO TEST RESULTS');
    console.log('=' .repeat(50));
    
    const passed = this.testResults.filter(test => test.passed).length;
    const total = this.testResults.length;
    
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (total - passed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(test => !test.passed)
        .forEach(test => console.log(`   - ${test.message}`));
    }
    
    console.log('\n🎯 Undo/Redo functionality is ' + (passed === total ? 'FULLY FUNCTIONAL' : 'NEEDS ATTENTION'));
  }
}

// Auto-run tests if in browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('load', async () => {
    console.log('🚀 Auto-running Undo/Redo tests...\n');
    const tester = new UndoRedoTester();
    const success = await tester.runAllTests();
    
    if (success) {
      console.log('\n🎉 All undo/redo tests passed! The functionality is working correctly.');
    } else {
      console.log('\n⚠️ Some undo/redo tests failed. Please check the implementation.');
    }
  });
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UndoRedoTester;
}