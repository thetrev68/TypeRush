# Icon Generation Guide

TypeRush uses both SVG and PNG icons for optimal PWA support across all platforms.

## Quick Method: Use the Icon Generator Tool

1. Open `generate-icons.html` in your browser (double-click or open with Chrome/Firefox)
2. Click each button to generate the icons:
   - Generate 192x192 Icon
   - Generate 512x512 Icon
   - Generate Maskable Icon (512x512)
3. Right-click each generated image and "Save As"
4. Save them to the `public/` directory with these names:
   - `icon-192.png`
   - `icon-512.png`
   - `icon-maskable.png`
5. Rebuild the project: `npm run build`

## Alternative: Command Line (Using ImageMagick)

If you have ImageMagick installed:

```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: apt-get install imagemagick

# Generate PNG icons from SVG
convert -background none -resize 192x192 public/icon.svg public/icon-192.png
convert -background none -resize 512x512 public/icon.svg public/icon-512.png
convert -background none -resize 512x512 public/icon.svg public/icon-maskable.png
```

## Alternative: Online Tools

Use these online SVG to PNG converters:

1. **CloudConvert**: https://cloudconvert.com/svg-to-png
2. **Convertio**: https://convertio.co/svg-png/
3. **SVG2PNG**: https://svgtopng.com/

Upload `public/icon.svg` and generate:
- 192x192 pixels → save as `icon-192.png`
- 512x512 pixels → save as `icon-512.png`
- 512x512 pixels → save as `icon-maskable.png` (for the maskable version)

## Why Both SVG and PNG?

- **SVG**: Scalable, small file size, works on modern browsers
- **PNG**: Better compatibility with older devices and some PWA implementations
- **Maskable PNG**: Android adaptive icons require PNG with safe zone padding

## Verification

After generating icons, verify they're correctly referenced:

1. Check `public/manifest.json` includes all icon entries
2. Run `npm run build`
3. Check `dist/` folder contains all icon files
4. Test PWA installation on mobile device

## Current Icon Status

✅ SVG icon exists: `public/icon.svg`
⚠️ PNG icons need to be generated (see methods above)

Once generated, your PWA will have full icon support across all platforms!
