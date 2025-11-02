# 🚀 Quick Deployment Reference

## Before Pushing Code

```bash
# 1. Validate your changes
npm run validate

# 2. Test build
npm run build

# 3. If all passes, proceed to push
```

## Deployment Commands

```bash
# Standard workflow (recommended)
git checkout -b feature/my-feature
# make changes...
git add .
git commit -m "Description"
git push origin feature/my-feature
# Create PR on GitHub, wait for validation ✅
# Merge PR → Auto-deploys to production

# Quick push to main (use sparingly)
git add .
git commit -m "Quick fix"
git push origin main
# Auto-deploys immediately
```

## NPM Scripts

```bash
npm run validate    # Run all validation checks
npm run build       # Build production site
npm run predeploy   # Validate + Build
npm test           # Same as validate
npm start          # Local dev server
```

## Validation Status

✅ **PASS** - Safe to deploy
⚠️  **WARNING** - Deploy works, but consider fixes
❌ **FAIL** - Must fix before deploying

## Common Validations

- HTML syntax ✅
- JavaScript syntax ✅  
- Product data ✅
- File sizes ⚠️
- Critical files ✅
- Sensitive data 🔒

## GitHub Actions Workflows

### Deploy Pipeline (main branch)
1. Validate → 2. Build → 3. Deploy → 4. Test

### PR Validation (all PRs)
Runs 10+ checks before allowing merge

## Check Deployment Status

🌐 **Actions Tab:** https://github.com/JasmineART/Yaya/actions
🌐 **Live Site:** https://pastelpoetics.com

## Deployment Timeline

- Push to main: Immediate
- Validation: ~1 minute
- Build: ~1 minute
- Deploy: ~30 seconds
- Propagation: ~2 minutes
- **Total: ~5 minutes**

## Emergency Rollback

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or revert to specific commit
git revert <commit-hash>
git push origin main
```

## Excluded from Deployment

Automatically removed:
- test-*.html
- diagnostic-*.html
- *-debug.js
- error.txt
- Old backup files

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Validation fails | Run `npm run validate` locally |
| Build fails | Check syntax errors |
| Deploy fails | Check GitHub Actions logs |
| Site not updating | Wait 5 min, clear cache |

## Security Alerts

🚨 **Never commit:**
- Stripe secret keys (sk_live_...)
- Passwords
- API secrets
- Private keys

The validation will catch and reject these!

---

**Keep this handy for quick reference!**
