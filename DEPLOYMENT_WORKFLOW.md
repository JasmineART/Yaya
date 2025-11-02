# Deployment Workflow Guide

## 🚀 Automated Deployment System

Your Yaya Starchild website now has a robust automated deployment system that prevents build failures and ensures code quality.

## 📋 How It Works

### 1. **Pull Request Validation** (`.github/workflows/pr-validation.yml`)
When you create a pull request:
- ✅ HTML syntax validation
- ✅ JavaScript syntax validation  
- ✅ Product data structure validation
- ✅ File size checks
- ✅ Build process testing
- ✅ Critical files verification
- ✅ Sensitive data detection

**The PR cannot be merged if validation fails.**

### 2. **Deployment Pipeline** (`.github/workflows/deploy.yml`)
When code is pushed to `main` branch:
1. **Validate** - Runs all quality checks
2. **Build** - Creates production-ready site
3. **Clean** - Removes test files
4. **Deploy** - Publishes to GitHub Pages
5. **Test** - Verifies deployment succeeded

### 3. **Local Validation** (`validate-deploy.js`)
Before pushing code, run locally:
```bash
npm run validate
```

This checks for:
- HTML/JS syntax errors
- Missing critical files
- Sensitive data exposure
- File size issues
- Product data integrity

## 🛠️ Usage Guide

### Before Making Changes
1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### While Developing
2. Make your changes
3. Test locally:
   ```bash
   npm run validate
   npm run build
   ```

### Creating Pull Request
4. Push your branch:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

5. Create PR on GitHub
6. Wait for automated validation ✅
7. Review validation results
8. Fix any errors if needed

### Merging to Production
9. Once PR validation passes, merge to `main`
10. Deployment happens automatically
11. Monitor deployment in Actions tab
12. Verify site is live after ~2 minutes

## 📊 Available NPM Scripts

```bash
npm run validate    # Run pre-deployment validation
npm run build       # Build production site
npm run predeploy   # Validate + Build (runs before deploy)
npm test           # Same as validate
npm start          # Start local development server
```

## 🚨 Troubleshooting

### Validation Fails
- Check the GitHub Actions logs for specific errors
- Run `npm run validate` locally to see errors
- Fix errors and push again

### Build Fails
- Ensure all critical files exist
- Check for JavaScript syntax errors
- Verify products.js data structure

### Deployment Fails
- Check GitHub Pages settings
- Verify GitHub Actions has proper permissions
- Review deployment logs in Actions tab

### Site Not Updating
- Wait 2-3 minutes for propagation
- Clear browser cache (Ctrl+Shift+R)
- Check if deployment completed successfully

## 🔒 Security Features

The workflow automatically checks for:
- ❌ Stripe secret keys (sk_live_...)
- ❌ Hardcoded passwords
- ❌ API secrets
- ❌ Private keys

**Code with sensitive data will be rejected automatically.**

## 📁 Files Excluded from Production

Automatically removed during deployment:
- `test-*.html` - Test pages
- `diagnostic-*.html` - Debug pages
- `*-debug.js` - Debug scripts
- `test-system.js` - Testing utilities
- `error.txt` - Error logs
- Old/backup files

## ✅ Quality Gates

### File Size Limits (Warnings)
- `app.js`: 50KB
- `styles.css`: 60KB
- `products.js`: 30KB

Exceeding these triggers warnings (not failures).

### Required Files
All must exist for deployment to succeed:
- index.html, shop.html, cart.html, checkout.html
- product.html, about.html, success.html
- app.js, products.js, styles.css
- firebase-config.js, simple-email.js

## 🎯 Best Practices

1. **Always create PRs** - Don't push directly to `main`
2. **Run validation locally** - Catch errors before pushing
3. **Keep files small** - Monitor file size warnings
4. **Remove debug code** - Clean up console.log statements
5. **Test build locally** - Run `npm run build` before pushing

## 🔄 Manual Deployment

If you need to deploy manually:
```bash
npm run predeploy  # Validate and build
git push origin main  # Triggers auto-deployment
```

## 📞 Getting Help

If deployment fails:
1. Check GitHub Actions tab for error logs
2. Review this guide
3. Run `npm run validate` locally
4. Check the workflow files in `.github/workflows/`

## 🎉 Success Indicators

Deployment succeeded when you see:
- ✅ All validation checks pass
- ✅ Build completes without errors
- ✅ Deploy job shows "success"
- ✅ Smoke tests pass
- ✅ Site accessible at production URL

Expected deployment time: **2-3 minutes**

---

**Last Updated:** November 2, 2025
**Deployment Target:** GitHub Pages (pastelpoetics.com)
