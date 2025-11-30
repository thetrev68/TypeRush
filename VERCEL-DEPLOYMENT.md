# TypeRush - Vercel Deployment Guide

Complete guide to deploying TypeRush to Vercel for production.

## Prerequisites

✅ Vercel CLI installed (version 44.7.3 detected)
✅ Git repository pushed to GitHub
✅ Code changes committed and pushed

## Deployment Options

### Option 1: Vercel CLI (Fastest)

1. **Login to Vercel**:
   ```bash
   vercel login
   ```
   Follow the prompts to authenticate (email verification)

2. **Deploy to Production**:
   ```bash
   cd "c:\Repos\TypeRush"
   vercel --prod
   ```

3. **Follow the prompts**:
   - Set up and deploy? **Yes**
   - Which scope? Select your account
   - Link to existing project? **No** (first time) or **Yes** (if already created)
   - What's your project's name? **typerush** (or your preferred name)
   - In which directory is your code located? **./** (press Enter)
   - Want to override settings? **No**

4. **Wait for deployment** (usually 30-60 seconds)

5. **Your app will be live!** Vercel will display the URL like:
   ```
   https://typerush.vercel.app
   ```

### Option 2: Vercel Dashboard (Easiest for First-Time)

1. **Go to Vercel Dashboard**:
   - Visit https://vercel.com
   - Click "Sign Up" or "Login"
   - Choose "Continue with GitHub"

2. **Import Your Repository**:
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `thetrev68/TypeRush`
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Deploy**:
   - Click "Deploy"
   - Wait 30-60 seconds
   - Your app will be live!

5. **Future Deployments**:
   - Every push to `main` branch auto-deploys
   - Pull requests get preview deployments

### Option 3: GitHub Integration (Recommended for Ongoing Work)

1. **Connect via Vercel Dashboard**:
   - Login to https://vercel.com
   - Import your GitHub repository (as in Option 2)
   - Vercel auto-detects all settings from `vercel.json`

2. **Automatic Deployments**:
   - Every `git push` to main → Production deployment
   - Every Pull Request → Preview deployment
   - Instant rollback capability

3. **Custom Domain** (Optional):
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration steps

## Vercel Configuration

Your project includes `vercel.json` with optimized settings:

✅ **Cache Headers**: 1-year cache for static assets
✅ **Security Headers**: X-Frame-Options, XSS Protection, nosniff
✅ **Service Worker**: Proper Content-Type and SW-Allowed headers
✅ **PWA Support**: Manifest.json with correct MIME type

## Post-Deployment Verification

After deployment, verify:

### 1. PWA Installation
- Open on mobile device
- Check for "Add to Home Screen" prompt
- Install and verify offline functionality

### 2. Lighthouse Audit
```bash
# Install Lighthouse CLI (optional)
npm install -g lighthouse

# Run audit
lighthouse https://your-app.vercel.app --view
```

Target scores:
- PWA: 100/100
- Performance: 95+/100
- Accessibility: 95+/100
- Best Practices: 95+/100
- SEO: 95+/100

### 3. Test Features
- [ ] All four themes work (Default, Space, Ocean, Racing)
- [ ] Offline mode works after first load
- [ ] Service Worker caches correctly
- [ ] Lessons unlock properly
- [ ] Combos and scoring work
- [ ] Daily challenge mode works
- [ ] Mobile keyboard input works

### 4. Performance Check
```bash
# Check bundle size on production
curl -s https://your-app.vercel.app/index.html -H "Accept-Encoding: gzip" --compressed | wc -c
```

Should be ~8 kB gzipped

## Environment Variables (If Needed)

If you add analytics or external services later:

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add variables:
   ```
   VITE_ANALYTICS_ID=your-analytics-id
   VITE_API_URL=https://api.example.com
   ```
3. Redeploy for changes to take effect

## Troubleshooting

### "Build failed" Error
- Check build logs in Vercel dashboard
- Verify `npm run build` works locally
- Ensure `package.json` has correct scripts

### Service Worker Not Working
- Check HTTPS is enabled (required for SW)
- Verify `/service-worker.js` is accessible
- Clear browser cache and reinstall PWA

### Icons Not Showing
- Verify PNG icons are in `public/` folder
- Check manifest.json references correct paths
- Clear cache and hard reload

### Performance Issues
- Run Lighthouse audit
- Check Network tab for large assets
- Verify gzip compression is working

## Vercel CLI Commands Reference

```bash
# Login to Vercel
vercel login

# Deploy to preview (staging)
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm <deployment-url>

# Link to existing project
vercel link

# View project info
vercel inspect
```

## Next Steps After Deployment

1. **Share Your App**:
   - Copy the Vercel URL
   - Share on social media
   - Add to your portfolio

2. **Monitor Performance**:
   - Use Vercel Analytics (optional, paid feature)
   - Monitor error rates in Vercel dashboard
   - Check Web Vitals

3. **Custom Domain** (Optional):
   - Purchase domain from Vercel or external registrar
   - Add to project in Vercel dashboard
   - Configure DNS records

4. **Continuous Improvement**:
   - Monitor user feedback
   - Add features from CHANGELOG.md roadmap
   - Run regular Lighthouse audits

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **TypeRush Issues**: https://github.com/thetrev68/TypeRush/issues

---

**Current Status**: Ready to deploy! 🚀

**Estimated Deploy Time**: 30-60 seconds

**Bundle Size**: 8.56 kB gzipped (optimized)
