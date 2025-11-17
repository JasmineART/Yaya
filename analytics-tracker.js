// Analytics Tracker - Comprehensive visitor and interaction tracking
class AnalyticsTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.visitorId = this.getOrCreateVisitorId();
    this.startTime = Date.now();
    this.pageViews = 0;
    this.interactions = [];
    this.location = null;
    
    this.init();
  }
  
  init() {
    // Track page view on load
    this.trackPageView();
    
    // Get visitor location
    this.getVisitorLocation();
    
    // Track user interactions
    this.setupInteractionTracking();
    
    // Track session duration on page unload
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.trackSessionPause();
      } else {
        this.trackSessionResume();
      }
    });
    
    console.log('📊 Analytics Tracker initialized', {
      sessionId: this.sessionId,
      visitorId: this.visitorId
    });
  }
  
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  getOrCreateVisitorId() {
    let visitorId = localStorage.getItem('yaya_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('yaya_visitor_id', visitorId);
    }
    return visitorId;
  }
  
  async getVisitorLocation() {
    try {
      // Use IP-based geolocation service
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const locationData = await response.json();
        this.location = {
          country: locationData.country_name,
          countryCode: locationData.country_code,
          region: locationData.region,
          city: locationData.city,
          timezone: locationData.timezone,
          latitude: locationData.latitude,
          longitude: locationData.longitude
        };
        
        // Update stored location data
        this.updateLocationInFirebase();
      }
    } catch (error) {
      console.warn('Could not determine visitor location:', error);
      // Fallback to timezone-based detection
      this.location = {
        country: 'Unknown',
        countryCode: 'XX',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    }
  }
  
  trackPageView() {
    this.pageViews++;
    
    const pageData = {
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || 'direct',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      deviceType: this.getDeviceType(),
      location: this.location
    };
    
    this.storeAnalyticsData('page_views', pageData);
    
    console.log('📄 Page view tracked:', pageData.path);
  }
  
  getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet';
    } else if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(userAgent)) {
      return 'mobile';
    } else {
      return 'desktop';
    }
  }
  
  setupInteractionTracking() {
    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target;
      
      // Track specific interactions
      if (target.matches('button, .btn, a[href], .product-card, .cart-btn')) {
        this.trackInteraction('click', {
          element: target.tagName.toLowerCase(),
          text: target.textContent?.trim().substring(0, 50) || '',
          href: target.href || '',
          className: target.className || '',
          id: target.id || '',
          x: event.clientX,
          y: event.clientY
        });
      }
    });
    
    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target;
      if (form.tagName === 'FORM') {
        this.trackInteraction('form_submit', {
          formId: form.id || '',
          formAction: form.action || '',
          formMethod: form.method || 'get'
        });
      }
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        // Track milestone scroll depths
        if ([25, 50, 75, 90].includes(scrollPercent)) {
          this.trackInteraction('scroll_depth', {
            percentage: scrollPercent
          });
        }
      }
    });
  }
  
  trackInteraction(type, data) {
    const interaction = {
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      type: type,
      data: data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      path: window.location.pathname
    };
    
    this.interactions.push(interaction);
    this.storeAnalyticsData('interactions', interaction);
    
    console.log('🎯 Interaction tracked:', type, data);
  }
  
  trackSessionEnd() {
    const sessionData = {
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      duration: Date.now() - this.startTime,
      pageViews: this.pageViews,
      interactions: this.interactions.length,
      endTime: new Date().toISOString(),
      lastUrl: window.location.href,
      location: this.location
    };
    
    this.storeAnalyticsData('sessions', sessionData);
    console.log('⏱️ Session ended:', sessionData);
  }
  
  trackSessionPause() {
    this.trackInteraction('session_pause', {
      duration: Date.now() - this.startTime
    });
  }
  
  trackSessionResume() {
    this.trackInteraction('session_resume', {
      duration: Date.now() - this.startTime
    });
  }
  
  async storeAnalyticsData(collection, data) {
    try {
      // Store in Firebase if available
      if (window.firebaseDB && typeof window.firebaseDB.collection === 'function') {
        await window.firebaseDB.collection('analytics').add({
          collection: collection,
          data: data,
          timestamp: new Date()
        });
      } else {
        // Fallback: store in localStorage for later sync
        const stored = JSON.parse(localStorage.getItem('yaya_analytics_queue') || '[]');
        stored.push({
          collection: collection,
          data: data,
          timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 entries to prevent storage overflow
        if (stored.length > 100) {
          stored.splice(0, stored.length - 100);
        }
        
        localStorage.setItem('yaya_analytics_queue', JSON.stringify(stored));
      }
    } catch (error) {
      console.warn('Failed to store analytics data:', error);
    }
  }
  
  async updateLocationInFirebase() {
    if (!this.location) return;
    
    try {
      if (window.firebaseDB) {
        await window.firebaseDB.collection('visitor_locations').doc(this.visitorId).set({
          visitorId: this.visitorId,
          location: this.location,
          lastSeen: new Date(),
          sessionCount: await this.getSessionCount()
        }, { merge: true });
      }
    } catch (error) {
      console.warn('Failed to update location in Firebase:', error);
    }
  }
  
  async getSessionCount() {
    try {
      const sessions = JSON.parse(localStorage.getItem('yaya_session_count') || '0');
      const newCount = sessions + 1;
      localStorage.setItem('yaya_session_count', newCount.toString());
      return newCount;
    } catch (error) {
      return 1;
    }
  }
  
  // Public method to track custom events
  trackCustomEvent(eventName, eventData = {}) {
    this.trackInteraction('custom_event', {
      eventName: eventName,
      ...eventData
    });
  }
  
  // Public method to track e-commerce events
  trackEcommerce(action, data = {}) {
    this.trackInteraction('ecommerce', {
      action: action,
      ...data
    });
  }
}

// Initialize analytics tracker when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.analyticsTracker = new AnalyticsTracker();
  });
} else {
  window.analyticsTracker = new AnalyticsTracker();
}

// Export for use in other scripts
window.AnalyticsTracker = AnalyticsTracker;