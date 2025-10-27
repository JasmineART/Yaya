# Render.com Network Configuration

## Outbound IP Addresses

These are Render.com's outbound IP addresses that may need to be allowlisted in external services.

### IP Addresses:
```
44.229.227.142
54.188.71.94
52.13.128.108
74.220.48.0/24 (74.220.48.0 - 74.220.48.255)
74.220.56.0/24 (74.220.56.0 - 74.220.56.255)
```

### When to Use:
- **Stripe Dashboard**: If you need to restrict API access by IP
- **Firewall Rules**: When configuring firewall rules for external APIs
- **Payment Gateway Settings**: Some payment processors allow IP restrictions
- **Supabase**: If using Row Level Security with IP restrictions
- **Email Services**: SMTP servers that require IP allowlisting

### Implementation:

#### 1. Stripe IP Allowlisting (Optional - for extra security)
If you want to restrict Stripe API access to only your Render server:
1. Go to Stripe Dashboard → Developers → API Keys
2. Under "Restricted keys", you can create IP-restricted keys
3. Add the above IPs to the allowlist

#### 2. Server Configuration
The server is already configured to accept requests from these origins:
- https://pastelpoetics.com
- https://www.pastelpoetics.com
- http://localhost:8080 (for local testing)

#### 3. CORS Headers
The server includes proper CORS configuration to accept requests from your GitHub Pages site while blocking unauthorized domains.

### Security Notes:

**Current Setup:**
- ✅ CORS enabled for pastelpoetics.com
- ✅ Rate limiting enabled (60 requests per minute)
- ✅ Render outbound IPs documented
- ✅ HTTPS enforced for production

**Additional Security (Optional):**
- IP-restricted Stripe keys for production
- Webhook signature verification (already implemented)
- Request validation and sanitization (already implemented)

### Render Service Information:

**Service ID:** srv-d3vpra7diees73ai05g0  
**Service URL:** https://yaya-srv-d3vpra7diees73ai05g0.onrender.com  
**Region:** US West (Oregon)  
**Outbound IPs:** Listed above  

### Testing Connectivity:

```bash
# Test from Render server to Stripe
curl -I https://api.stripe.com/v1

# Test from your browser to Render
curl https://yaya-srv-d3vpra7diees73ai05g0.onrender.com/

# Test CORS from allowed origin
curl -H "Origin: https://pastelpoetics.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://yaya-srv-d3vpra7diees73ai05g0.onrender.com/create-stripe-session
```

### Troubleshooting:

**If payments fail:**
1. Check Render service is running
2. Verify STRIPE_SECRET environment variable is set
3. Check CORS errors in browser console
4. Verify Stripe API key is not IP-restricted (unless you added Render IPs)

**If external API calls fail:**
1. Check if the external service requires IP allowlisting
2. Add Render outbound IPs to the external service's allowlist
3. Verify network connectivity from Render dashboard

---

**Last Updated:** October 27, 2025  
**Render Free Tier Note:** Free tier services may sleep after inactivity. First request after sleep takes 30-60 seconds.
