// Direct EmailJS Test Script
// Run this in browser console at: http://localhost:8080

console.log('🔧 Starting EmailJS Troubleshooting...');

// Step 1: Check if EmailJS is loaded
if (typeof emailjs === 'undefined') {
    console.error('❌ EmailJS library not loaded');
    // Load it manually
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    document.head.appendChild(script);
    script.onload = () => {
        console.log('✅ EmailJS library loaded');
        runEmailTest();
    };
} else {
    console.log('✅ EmailJS library already loaded');
    runEmailTest();
}

function runEmailTest() {
    // Your configuration
    const config = {
        serviceId: 'service_eodjffq',
        templateId: 'template_b6rgdel',
        userId: 'FWvhfYEosGwcS5rxq'
    };
    
    console.log('📧 EmailJS Configuration:', config);
    
    // Initialize
    try {
        emailjs.init(config.userId);
        console.log('✅ EmailJS initialized with User ID:', config.userId);
    } catch (error) {
        console.error('❌ EmailJS initialization failed:', error);
        return;
    }
    
    // Test email
    const params = {
        to_email: 'faeriepoetics@gmail.com',
        from_name: 'Debug Test',
        subject: 'Test Email',
        message: 'This is a test message from EmailJS debug.',
        reply_to: 'faeriepoetics@gmail.com'
    };
    
    console.log('📤 Sending email with params:', params);
    
    emailjs.send(config.serviceId, config.templateId, params)
        .then((response) => {
            console.log('✅ SUCCESS!', response);
            alert('✅ Email sent successfully! Check faeriepoetics@gmail.com');
        })
        .catch((error) => {
            console.error('❌ FAILED!', error);
            alert('❌ Email failed: ' + error.message);
            
            // Additional debugging
            if (error.status) {
                console.log('HTTP Status:', error.status);
            }
            if (error.text) {
                console.log('Error Text:', error.text);
            }
        });
}

// If running directly, start the test
if (typeof window !== 'undefined') {
    runEmailTest();
}