/**
 * Automatic Error Monitoring & Bug Detection System
 * Captures errors, performance issues, and rendering problems
 */

(function() {
  'use strict';
  
  const ErrorMonitor = {
    errors: [],
    warnings: [],
    performanceIssues: [],
    maxLogs: 100,
    
    init() {
      console.log('🔍 Error Monitor initialized');
      this.setupGlobalErrorHandler();
      this.setupConsoleMonitoring();
      this.setupPerformanceMonitoring();
      this.setupUnhandledRejectionHandler();
      this.setupResourceErrorHandler();
      this.exposeDebugAPI();
    },
    
    // Global error handler
    setupGlobalErrorHandler() {
      window.addEventListener('error', (event) => {
        // Ignore chrome extension errors (not our code)
        if (event.filename && event.filename.includes('chrome-extension://')) {
          return;
        }
        
        const error = {
          type: 'error',
          message: event.message,
          filename: event.filename,
          line: event.lineno,
          col: event.colno,
          stack: event.error ? event.error.stack : null,
          timestamp: new Date().toISOString()
        };
        
        this.logError(error);
      });
    },
    
    // Promise rejection handler
    setupUnhandledRejectionHandler() {
      window.addEventListener('unhandledrejection', (event) => {
        const error = {
          type: 'unhandled-rejection',
          message: event.reason ? event.reason.message || event.reason : 'Unknown',
          stack: event.reason ? event.reason.stack : null,
          timestamp: new Date().toISOString()
        };
        
        this.logError(error);
      });
    },
    
    // Resource loading errors
    setupResourceErrorHandler() {
      window.addEventListener('error', (event) => {
        if (event.target && event.target.tagName) {
          // Ignore favicon and manifest errors in dev
          const src = event.target.src || event.target.href;
          if (src && (src.includes('favicon.ico') || src.includes('manifest.webmanifest'))) {
            return;
          }
          
          const error = {
            type: 'resource-error',
            tag: event.target.tagName,
            src: src,
            timestamp: new Date().toISOString()
          };
          
          this.logWarning(error);
        }
      }, true);
    },
    
    // Monitor console for violations
    setupConsoleMonitoring() {
      const originalWarn = console.warn;
      const self = this;
      
      console.warn = function(...args) {
        const message = args.join(' ');
        
        // Detect performance violations
        if (message.includes('Violation') || message.includes('handler took')) {
          const match = message.match(/(\d+)ms/);
          const duration = match ? parseInt(match[1], 10) : 0;
          
          self.performanceIssues.push({
            type: 'performance-violation',
            message: message,
            duration: duration,
            timestamp: new Date().toISOString()
          });
          
          // Keep array size limited
          if (self.performanceIssues.length > self.maxLogs) {
            self.performanceIssues.shift();
          }
        }
        
        originalWarn.apply(console, args);
      };
    },
    
    // Performance monitoring
    setupPerformanceMonitoring() {
      if ('PerformanceObserver' in window) {
        try {
          // Monitor long tasks
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) { // Tasks over 50ms
                this.performanceIssues.push({
                  type: 'long-task',
                  name: entry.name,
                  duration: entry.duration,
                  timestamp: new Date().toISOString()
                });
              }
            }
          });
          
          observer.observe({ entryTypes: ['longtask', 'measure'] });
        } catch(e) {
          console.log('PerformanceObserver not fully supported');
        }
      }
      
      // Page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            console.log('📊 Page Performance:', {
              'DNS Lookup': Math.round(perfData.domainLookupEnd - perfData.domainLookupStart) + 'ms',
              'TCP Connection': Math.round(perfData.connectEnd - perfData.connectStart) + 'ms',
              'DOM Content Loaded': Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart) + 'ms',
              'Page Load': Math.round(perfData.loadEventEnd - perfData.loadEventStart) + 'ms',
              'Total Time': Math.round(perfData.loadEventEnd - perfData.fetchStart) + 'ms'
            });
          }
        }, 0);
      });
    },
    
    // Log error
    logError(error) {
      this.errors.push(error);
      if (this.errors.length > this.maxLogs) {
        this.errors.shift();
      }
      
      console.error('🚨 Error captured:', error);
      
      // Optional: Send to analytics/logging service
      this.reportToService(error);
    },
    
    // Log warning
    logWarning(warning) {
      this.warnings.push(warning);
      if (this.warnings.length > this.maxLogs) {
        this.warnings.shift();
      }
    },
    
    // Report to external service (placeholder)
    reportToService(error) {
      // In production, send to error tracking service like Sentry, LogRocket, etc.
      // Example:
      // if (window.Sentry) {
      //   Sentry.captureException(error);
      // }
    },
    
    // Expose debug API
    exposeDebugAPI() {
      window.ErrorMonitor = {
        getErrors: () => this.errors,
        getWarnings: () => this.warnings,
        getPerformanceIssues: () => this.performanceIssues,
        clearAll: () => {
          this.errors = [];
          this.warnings = [];
          this.performanceIssues = [];
          console.log('🧹 Error logs cleared');
        },
        getSummary: () => {
          console.log('📋 Error Monitor Summary');
          console.log('Errors:', this.errors.length);
          console.log('Warnings:', this.warnings.length);
          console.log('Performance Issues:', this.performanceIssues.length);
          
          if (this.performanceIssues.length > 0) {
            const avgDuration = this.performanceIssues.reduce((sum, issue) => sum + (issue.duration || 0), 0) / this.performanceIssues.length;
            console.log('Avg Performance Issue Duration:', Math.round(avgDuration) + 'ms');
          }
          
          return {
            errors: this.errors.length,
            warnings: this.warnings.length,
            performanceIssues: this.performanceIssues.length
          };
        },
        enableVerbose: () => {
          this.verbose = true;
          console.log('🔊 Verbose logging enabled');
        }
      };
      
      console.log('💡 Debug API available: window.ErrorMonitor');
      console.log('  - ErrorMonitor.getErrors()');
      console.log('  - ErrorMonitor.getWarnings()');
      console.log('  - ErrorMonitor.getPerformanceIssues()');
      console.log('  - ErrorMonitor.getSummary()');
      console.log('  - ErrorMonitor.clearAll()');
    }
  };
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ErrorMonitor.init());
  } else {
    ErrorMonitor.init();
  }
})();
