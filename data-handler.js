/**
 * Client Data Handler
 * Secure handling of user data with privacy protection
 * GDPR/CCPA compliant data management
 */

class DataHandler {
  constructor() {
    this.storageKey = 'user_data_v1';
    this.consentKey = 'data_consent_v1';
  }

  /**
   * Check if user has consented to data storage
   */
  hasConsent() {
    try {
      const consent = localStorage.getItem(this.consentKey);
      return consent === 'true';
    } catch (e) {
      console.warn('Failed to check data consent:', e);
      return false;
    }
  }

  /**
   * Set user consent for data storage
   */
  setConsent(granted) {
    try {
      localStorage.setItem(this.consentKey, granted.toString());
      if (!granted) {
        // If consent withdrawn, clear all stored data
        this.clearAllData();
      }
    } catch (e) {
      console.error('Failed to set data consent:', e);
    }
  }

  /**
   * Sanitize user input to prevent XSS attacks
   */
  sanitize(input) {
    if (typeof input !== 'string') return input;
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Validate email address format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (basic validation)
   */
  validatePhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Store user data securely (with consent check)
   */
  storeUserData(data, requireConsent = true) {
    if (requireConsent && !this.hasConsent()) {
      console.warn('Cannot store user data without consent');
      return false;
    }

    try {
      // Sanitize all string values
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = typeof value === 'string' ? this.sanitize(value) : value;
      }

      // Add timestamp
      sanitized._timestamp = Date.now();

      // Store in localStorage
      const existing = this.getUserData() || {};
      const merged = { ...existing, ...sanitized };
      
      localStorage.setItem(this.storageKey, JSON.stringify(merged));
      return true;
    } catch (e) {
      console.error('Failed to store user data:', e);
      return false;
    }
  }

  /**
   * Retrieve user data
   */
  getUserData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Failed to retrieve user data:', e);
      return null;
    }
  }

  /**
   * Update specific user data fields
   */
  updateUserData(updates) {
    const current = this.getUserData() || {};
    return this.storeUserData({ ...current, ...updates });
  }

  /**
   * Clear all user data
   */
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('[DataHandler] All user data cleared');
      return true;
    } catch (e) {
      console.error('Failed to clear user data:', e);
      return false;
    }
  }

  /**
   * Export user data (for GDPR data portability)
   */
  exportUserData() {
    const data = this.getUserData();
    if (!data) {
      return null;
    }

    // Create downloadable JSON file
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    return data;
  }

  /**
   * Anonymize user data (remove personally identifiable information)
   */
  anonymizeData() {
    const data = this.getUserData();
    if (!data) return null;

    const anonymized = {
      _timestamp: data._timestamp,
      _anonymized: true,
      // Keep non-PII data like preferences
      preferences: data.preferences,
      // Remove PII
      email: null,
      name: null,
      phone: null,
      address: null
    };

    this.storeUserData(anonymized, false);
    return anonymized;
  }

  /**
   * Securely hash sensitive data (for comparison without storing plaintext)
   */
  async hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Store order history (anonymized if no consent)
   */
  storeOrder(orderData) {
    try {
      const orders = this.getOrders() || [];
      
      // Anonymize if no consent
      if (!this.hasConsent()) {
        orderData = {
          id: orderData.id,
          items: orderData.items,
          total: orderData.total,
          date: orderData.date,
          _anonymized: true
        };
      }

      orders.push({
        ...orderData,
        _timestamp: Date.now()
      });

      // Keep only last 50 orders
      const trimmed = orders.slice(-50);
      
      localStorage.setItem('order_history_v1', JSON.stringify(trimmed));
      return true;
    } catch (e) {
      console.error('Failed to store order:', e);
      return false;
    }
  }

  /**
   * Retrieve order history
   */
  getOrders() {
    try {
      const data = localStorage.getItem('order_history_v1');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Failed to retrieve orders:', e);
      return null;
    }
  }

  /**
   * Clear order history
   */
  clearOrders() {
    try {
      localStorage.removeItem('order_history_v1');
      return true;
    } catch (e) {
      console.error('Failed to clear orders:', e);
      return false;
    }
  }

  /**
   * Get data retention period (in days)
   */
  getRetentionPeriod() {
    return 365; // 1 year default
  }

  /**
   * Clean up old data based on retention period
   */
  cleanupOldData() {
    const retentionMs = this.getRetentionPeriod() * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - retentionMs;

    // Clean user data
    const userData = this.getUserData();
    if (userData && userData._timestamp < cutoffTime) {
      this.clearAllData();
      console.log('[DataHandler] Old user data cleaned up');
    }

    // Clean order history
    const orders = this.getOrders();
    if (orders) {
      const filtered = orders.filter(order => order._timestamp >= cutoffTime);
      if (filtered.length < orders.length) {
        localStorage.setItem('order_history_v1', JSON.stringify(filtered));
        console.log(`[DataHandler] Removed ${orders.length - filtered.length} old orders`);
      }
    }
  }

  /**
   * Prepare data for secure transmission to server
   */
  prepareForTransmission(data) {
    // Remove any client-side only fields
    const cleaned = { ...data };
    delete cleaned._timestamp;
    delete cleaned._anonymized;

    // Sanitize all strings
    for (const [key, value] of Object.entries(cleaned)) {
      if (typeof value === 'string') {
        cleaned[key] = this.sanitize(value);
      }
    }

    return cleaned;
  }

  /**
   * Validate required fields
   */
  validateRequiredFields(data, requiredFields) {
    const missing = [];
    
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missing.push(field);
      }
    }

    return {
      valid: missing.length === 0,
      missing: missing
    };
  }

  /**
   * Initialize data handler and run cleanup
   */
  init() {
    // Run cleanup on init
    this.cleanupOldData();

    // Set up periodic cleanup (daily)
    setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000);

    console.log('[DataHandler] Initialized with GDPR compliance');
  }
}

// Export for use in other scripts
window.DataHandler = DataHandler;

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.dataHandler = new DataHandler();
    window.dataHandler.init();
  });
} else {
  window.dataHandler = new DataHandler();
  window.dataHandler.init();
}
