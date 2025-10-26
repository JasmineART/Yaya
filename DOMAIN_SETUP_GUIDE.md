# 🌐 Custom Domain Deployment Guide
## Deploying Yaya Starchild to pastelpoetics.com

### ✅ **GitHub Setup (Completed)**
- [x] CNAME file created with `pastelpoetics.com`
- [x] Build script updated to include CNAME
- [x] README.md updated with new domain
- [x] Ready for GitHub Pages custom domain

### 🔧 **DNS Configuration Required**

#### **Step 1: Configure DNS Records**
You need to add these DNS records with your domain registrar (wherever you bought pastelpoetics.com):

**A Records (IPv4):**
```
Type: A
Name: @ (or root/blank)
Value: 185.199.108.153

Type: A  
Name: @ (or root/blank)
Value: 185.199.109.153

Type: A
Name: @ (or root/blank) 
Value: 185.199.110.153

Type: A
Name: @ (or root/blank)
Value: 185.199.111.153
```

**AAAA Records (IPv6):**
```
Type: AAAA
Name: @ (or root/blank)
Value: 2606:50c0:8000::153

Type: AAAA
Name: @ (or root/blank)
Value: 2606:50c0:8001::153

Type: AAAA
Name: @ (or root/blank)
Value: 2606:50c0:8002::153

Type: AAAA
Name: @ (or root/blank)
Value: 2606:50c0:8003::153
```

**CNAME Record (www subdomain):**
```
Type: CNAME
Name: www
Value: jasmineart.github.io
```

#### **Step 2: GitHub Pages Configuration**
1. Go to your GitHub repository: https://github.com/JasmineART/Yaya
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**, ensure it's set to "Deploy from a branch"
5. Select **main** branch and **/ (root)** folder
6. Under **Custom domain**, enter: `pastelpoetics.com`
7. Check **Enforce HTTPS** (wait for DNS to propagate first)

#### **Step 3: SSL Certificate**
- GitHub will automatically provision an SSL certificate
- This may take 10-60 minutes after DNS propagation
- Once ready, enable "Enforce HTTPS" in GitHub Pages settings

### ⏱️ **Timeline & Expectations**

#### **Immediate (0-5 minutes):**
- CNAME file deployed ✅
- GitHub recognizes custom domain intent

#### **DNS Propagation (10 minutes - 24 hours):**
- DNS records need time to propagate globally
- Use tools like https://dnschecker.org to monitor
- pastelpoetics.com should resolve to GitHub's IPs

#### **SSL Certificate (30-60 minutes after DNS):**
- GitHub automatically provisions SSL
- HTTPS will become available
- Can enable "Enforce HTTPS" in settings

### 🧪 **Testing Your Deployment**

#### **DNS Tests:**
```bash
# Check if DNS is working
nslookup pastelpoetics.com
dig pastelpoetics.com

# Should return GitHub's IP addresses:
# 185.199.108.153, 185.199.109.153, etc.
```

#### **Browser Tests:**
1. **HTTP Test**: http://pastelpoetics.com (should redirect to HTTPS eventually)
2. **HTTPS Test**: https://pastelpoetics.com (once SSL is ready)
3. **WWW Test**: https://www.pastelpoetics.com (should work via CNAME)

### 🎯 **Success Criteria**

✅ **Domain resolves**: pastelpoetics.com points to GitHub's servers  
✅ **Site loads**: Your Yaya Starchild site appears at the domain  
✅ **SSL works**: HTTPS certificate is active and working  
✅ **WWW redirects**: www.pastelpoetics.com works correctly  
✅ **All features work**: Cart, checkout, emails, payments function  

### 🛠️ **Common Domain Registrars**

#### **Namecheap:**
- Go to Domain List → Manage → Advanced DNS
- Add the A and AAAA records listed above
- TTL can be set to 300 (5 minutes) for faster updates

#### **GoDaddy:**
- Go to My Products → DNS → Manage Zones
- Add the A and AAAA records
- Set TTL to 600 (10 minutes)

#### **Cloudflare:**
- Go to DNS → Records
- Add the A and AAAA records
- Set Proxy status to "DNS only" (gray cloud)

### 🔍 **Troubleshooting**

#### **If site doesn't load:**
- Check DNS propagation: https://dnschecker.org
- Verify A records point to correct GitHub IPs
- Wait up to 24 hours for full propagation

#### **If SSL doesn't work:**
- Ensure DNS is fully propagated first
- Check GitHub Pages settings for SSL status
- May need to toggle "Enforce HTTPS" off/on

#### **If www doesn't work:**
- Verify CNAME record: www → jasmineart.github.io
- Check that base domain is working first

### 📞 **Support Resources**

- **GitHub Pages Docs**: https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
- **DNS Checker**: https://dnschecker.org
- **SSL Checker**: https://www.ssllabs.com/ssltest/

### 🌟 **What You'll Have After Setup**

🎨 **Beautiful Poetry Website**: Your Yaya Starchild site at a memorable domain  
🛒 **Full E-commerce**: Working cart, Stripe payments, email notifications  
♿ **100% Accessible**: WCAG 2.1 AA compliant with perfect mobile optimization  
🔒 **Secure HTTPS**: SSL certificate protecting all user interactions  
📱 **Mobile Perfect**: Responsive design optimized for all devices  
🚀 **Fast Performance**: Optimized loading and Core Web Vitals  

**Your professional poetry business will be live at pastelpoetics.com!** ✨