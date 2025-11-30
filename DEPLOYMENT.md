# TypeRush Deployment Guide

This document covers deployment options and optimization settings for TypeRush PWA.

## Build Optimization

### Bundle Size Targets
- **Target**: < 60 kB gzipped (excluding audio)
- **Current optimizations**:
  - Removed console.log statements
  - Code splitting configuration in Vite
  - Terser minification with tree shaking
  - Dead code elimination

### Build Process
```bash
npm run build    # Production build
npm run preview  # Preview production build locally
npm run analyze  # Analyze bundle size
```

## Deployment Options

### 1. Vercel (Recommended)
1. Connect your repository to Vercel
2. Vercel will automatically detect `vercel.json` configuration
3. Build command: `npm run build`
4. Output directory: `dist`

**Features enabled**:
- Automatic HTTPS/SSL
- Global CDN
- Proper cache headers for PWA assets
- Service Worker support

### 2. Netlify
1. Connect repository to Netlify
2. Netlify will auto-detect `netlify.toml` configuration
3. Build command: `npm run build`
4. Publish directory: `dist`

**Features enabled**:
- Form handling
- Edge functions support
- A/B testing
- Split testing

### 3. GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Use GitHub Actions for automated deployment

### 4. Traditional Web Hosting
1. Run `npm run build`
2. Upload `dist/` directory contents to web server
3. Configure server to serve index.html for SPA routing

## PWA Requirements

### Service Worker
- ✅ Configured with proper cache strategies
- ✅ Version management for updates
- ✅ Offline-first approach

### Manifest
- ✅ Complete PWA manifest
- ✅ Icons and splash screens
- ✅ App shortcuts
- ✅ Proper metadata

### Caching Strategy
- **Static assets**: Cache-first (1 year)
- **Data files**: Network-first with fallback
- **HTML**: Network-first with SPA fallback

## Performance Monitoring

### Lighthouse Scores (Target)
- **PWA**: 100/100
- **Performance**: 95+/100
- **Accessibility**: 95+/100
- **Best Practices**: 95+/100
- **SEO**: 95+/100

### Tools
- Chrome DevTools Lighthouse
- PageSpeed Insights
- WebPageTest

## Post-Deployment Checklist

- [ ] App installs as PWA on mobile devices
- [ ] Offline functionality works after first visit
- [ ] All assets load correctly
- [ ] Service Worker activates properly
- [ ] Cache headers are applied correctly
- [ ] Lighthouse scores meet targets
- [ ] Cross-browser compatibility tested
- [ ] Performance under 60kB gzipped verified

## Environment Variables

For analytics or other external services:
```bash
# Add to deployment platform
VITE_ANALYTICS_ID=your-id
VITE_API_URL=https://api.example.com
```

## Troubleshooting

### Service Worker Issues
1. Clear browser cache
2. Check Service Worker registration in DevTools
3. Verify manifest.json is accessible

### Cache Issues
1. Clear application storage in DevTools
2. Check network requests for proper cache headers
3. Verify Service Worker cache size limits

### PWA Installation
1. Ensure HTTPS is enabled
2. Verify manifest.json is served with correct MIME type
3. Check all required fields in manifest