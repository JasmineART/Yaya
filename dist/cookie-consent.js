/**
 * Cookie Consent Manager
 * GDPR/CCPA compliant cookie consent system
 * Allows users to opt in/out of optional cookies
 */

(function() {
  'use strict';

  const COOKIE_CONSENT_KEY = 'cookie_consent_v1';
  const CONSENT_EXPIRY_DAYS = 365;

  // Cookie categories
  const COOKIE_CATEGORIES = {
    essential: {
      name: 'Essential',
      description: 'Required for the website to function (cart, checkout, security)',
      required: true,
      cookies: ['cart', 'session', 'csrf_token', COOKIE_CONSENT_KEY]
    },
    analytics: {
      name: 'Analytics',
      description: 'Help us understand how visitors use our website',
      required: false,
      cookies: ['_ga', '_gid', '_gat', 'analytics_consent']
    },
    marketing: {
      name: 'Marketing',
      description: 'Used to deliver personalized ads and measure campaign effectiveness',
      required: false,
      cookies: ['_fbp', '_gcl_au', 'marketing_consent']
    }
  };

  class CookieConsent {
    constructor() {
      this.consent = this.loadConsent();
      this.modal = null;
      this.banner = null;
      
      // If no consent saved, show banner
      if (!this.consent) {
        this.showBanner();
      } else {
        // Apply saved consent preferences
        this.applyConsent();
      }
    }

    loadConsent() {
      try {
        const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        console.warn('Failed to load cookie consent:', e);
        return null;
      }
    }

    saveConsent(preferences) {
      const consent = {
        timestamp: Date.now(),
        preferences: preferences
      };
      
      try {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
        this.consent = consent;
        this.applyConsent();
      } catch (e) {
        console.error('Failed to save cookie consent:', e);
      }
    }

    applyConsent() {
      if (!this.consent || !this.consent.preferences) return;

      const prefs = this.consent.preferences;

      // Analytics
      if (prefs.analytics) {
        this.enableAnalytics();
      } else {
        this.disableAnalytics();
      }

      // Marketing
      if (prefs.marketing) {
        this.enableMarketing();
      } else {
        this.disableMarketing();
      }
    }

    enableAnalytics() {
      // Google Analytics example
      if (typeof gtag === 'undefined') {
        // Load Google Analytics script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID', { anonymize_ip: true });
      }
      console.log('[Cookie Consent] Analytics enabled');
    }

    disableAnalytics() {
      // Disable Google Analytics
      if (typeof gtag !== 'undefined') {
        window['ga-disable-GA_MEASUREMENT_ID'] = true;
      }
      
      // Remove analytics cookies
      this.deleteCookies(COOKIE_CATEGORIES.analytics.cookies);
      console.log('[Cookie Consent] Analytics disabled');
    }

    enableMarketing() {
      // Facebook Pixel example
      if (typeof fbq === 'undefined') {
        // Load Facebook Pixel script
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        fbq('init', 'YOUR_PIXEL_ID');
        fbq('track', 'PageView');
      }
      console.log('[Cookie Consent] Marketing enabled');
    }

    disableMarketing() {
      // Remove marketing cookies
      this.deleteCookies(COOKIE_CATEGORIES.marketing.cookies);
      console.log('[Cookie Consent] Marketing disabled');
    }

    deleteCookies(cookieNames) {
      cookieNames.forEach(name => {
        // Delete from current domain
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        // Delete from parent domain
        const domain = window.location.hostname;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
      });
    }

    showBanner() {
      if (this.banner) return; // Already showing

      const banner = document.createElement('div');
      banner.id = 'cookie-consent-banner';
      banner.innerHTML = `
        <div style="position: fixed; bottom: 0; left: 0; right: 0; background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 181, 216, 0.95)); backdrop-filter: blur(20px); padding: 1.5rem; box-shadow: 0 -4px 20px rgba(0,0,0,0.15); z-index: 10000; border-top: 2px solid rgba(255,255,255,0.5);">
          <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 2rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 300px;">
              <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #333;">
                <i class="fas fa-cookie-bite" style="color: #FF9800;"></i> We Use Cookies
              </h3>
              <p style="margin: 0; font-size: 0.95rem; color: #555; line-height: 1.6;">
                We use essential cookies to make our site work. We'd also like to use optional cookies to improve your experience and help us understand how you use our site. 
                <a href="policies.html#cookies" style="color: #FF1493; text-decoration: underline;">Learn more</a>
              </p>
            </div>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <button id="cookie-accept-all" style="background: #4CAF50; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3); transition: all 0.2s;">
                Accept All
              </button>
              <button id="cookie-customize" style="background: rgba(255,255,255,0.9); color: #333; border: 2px solid #ccc; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                Customize
              </button>
              <button id="cookie-reject-optional" style="background: transparent; color: #666; border: 2px solid #999; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                Essential Only
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(banner);
      this.banner = banner;

      // Event listeners
      document.getElementById('cookie-accept-all').addEventListener('click', () => {
        this.acceptAll();
      });

      document.getElementById('cookie-customize').addEventListener('click', () => {
        this.showModal();
      });

      document.getElementById('cookie-reject-optional').addEventListener('click', () => {
        this.acceptEssentialOnly();
      });

      // Add hover effects
      const buttons = banner.querySelectorAll('button');
      buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });
        btn.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = '';
        });
      });
    }

    hideBanner() {
      if (this.banner) {
        this.banner.remove();
        this.banner = null;
      }
    }

    showModal() {
      if (this.modal) return; // Already showing

      const currentPrefs = this.consent ? this.consent.preferences : {
        essential: true,
        analytics: false,
        marketing: false
      };

      const modal = document.createElement('div');
      modal.id = 'cookie-consent-modal';
      modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 10001; display: flex; align-items: center; justify-content: center; padding: 1rem;">
          <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 181, 216, 0.95)); max-width: 600px; width: 100%; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.5); max-height: 90vh; overflow-y: auto;">
            <div style="padding: 2rem;">
              <h2 style="margin: 0 0 1rem 0; font-size: 1.5rem; color: #333;">
                <i class="fas fa-cookie-bite" style="color: #FF9800;"></i> Cookie Preferences
              </h2>
              <p style="color: #555; line-height: 1.6; margin-bottom: 1.5rem;">
                We use cookies to improve your experience. Choose which types of cookies you'd like to allow.
              </p>

              <div style="space-y: 1rem;">
                ${Object.entries(COOKIE_CATEGORIES).map(([key, cat]) => `
                  <div style="background: rgba(255,255,255,0.7); padding: 1.25rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                      <h4 style="margin: 0; font-size: 1.1rem; color: #333;">
                        ${cat.name}
                        ${cat.required ? '<span style="color: #4CAF50; font-size: 0.8rem; font-weight: normal;">(Required)</span>' : ''}
                      </h4>
                      <label style="position: relative; display: inline-block; width: 50px; height: 26px;">
                        <input type="checkbox" id="cookie-${key}" ${cat.required ? 'checked disabled' : (currentPrefs[key] ? 'checked' : '')} 
                          style="opacity: 0; width: 0; height: 0;">
                        <span style="position: absolute; cursor: ${cat.required ? 'not-allowed' : 'pointer'}; top: 0; left: 0; right: 0; bottom: 0; background: ${cat.required || currentPrefs[key] ? '#4CAF50' : '#ccc'}; border-radius: 26px; transition: 0.3s;"></span>
                        <span style="position: absolute; content: ''; height: 20px; width: 20px; left: ${cat.required || currentPrefs[key] ? '27px' : '3px'}; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s;"></span>
                      </label>
                    </div>
                    <p style="margin: 0; font-size: 0.9rem; color: #666; line-height: 1.5;">${cat.description}</p>
                    <details style="margin-top: 0.5rem;">
                      <summary style="cursor: pointer; font-size: 0.85rem; color: #888; user-select: none;">View cookies (${cat.cookies.length})</summary>
                      <ul style="margin: 0.5rem 0 0 1.5rem; font-size: 0.85rem; color: #666;">
                        ${cat.cookies.map(c => `<li><code>${c}</code></li>`).join('')}
                      </ul>
                    </details>
                  </div>
                `).join('')}
              </div>

              <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end;">
                <button id="cookie-modal-cancel" style="background: transparent; color: #666; border: 2px solid #999; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                  Cancel
                </button>
                <button id="cookie-modal-save" style="background: #4CAF50; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);">
                  Save Preferences
                </button>
              </div>

              <p style="margin-top: 1rem; font-size: 0.85rem; color: #888; text-align: center;">
                <a href="policies.html#cookies" style="color: #FF1493; text-decoration: underline;">Learn more about our cookie policy</a>
              </p>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      this.modal = modal;

      // Add toggle functionality
      Object.keys(COOKIE_CATEGORIES).forEach(key => {
        const checkbox = document.getElementById(`cookie-${key}`);
        const toggle = checkbox.nextElementSibling;
        const slider = toggle.nextElementSibling;
        
        if (!COOKIE_CATEGORIES[key].required) {
          checkbox.addEventListener('change', function() {
            toggle.style.background = this.checked ? '#4CAF50' : '#ccc';
            slider.style.left = this.checked ? '27px' : '3px';
          });
        }
      });

      // Event listeners
      document.getElementById('cookie-modal-cancel').addEventListener('click', () => {
        this.hideModal();
      });

      document.getElementById('cookie-modal-save').addEventListener('click', () => {
        const preferences = {
          essential: true, // Always true
          analytics: document.getElementById('cookie-analytics').checked,
          marketing: document.getElementById('cookie-marketing').checked
        };
        this.saveConsent(preferences);
        this.hideModal();
        this.hideBanner();
      });

      // Close on outside click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideModal();
        }
      });
    }

    hideModal() {
      if (this.modal) {
        this.modal.remove();
        this.modal = null;
      }
    }

    acceptAll() {
      this.saveConsent({
        essential: true,
        analytics: true,
        marketing: true
      });
      this.hideBanner();
    }

    acceptEssentialOnly() {
      this.saveConsent({
        essential: true,
        analytics: false,
        marketing: false
      });
      this.hideBanner();
    }

    // Public method to programmatically show modal
    static showModal() {
      if (window.cookieConsentInstance) {
        window.cookieConsentInstance.showModal();
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.cookieConsentInstance = new CookieConsent();
      window.CookieConsent = CookieConsent;
    });
  } else {
    window.cookieConsentInstance = new CookieConsent();
    window.CookieConsent = CookieConsent;
  }
})();
