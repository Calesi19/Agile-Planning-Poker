# PWA Icons

The app requires the following icon files for full PWA support:

- `pwa-192x192.png` - 192x192 app icon
- `pwa-512x512.png` - 512x512 app icon
- `apple-touch-icon.png` - 180x180 iOS icon
- `favicon.ico` - Standard favicon

## Generating Icons

You can generate these from the `favicon.svg` file using any of these tools:

1. **PWA Asset Generator** (recommended):
   ```bash
   npx @vite-pwa/assets-generator --preset minimal public/favicon.svg
   ```

2. **Online Tools**:
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)

3. **ImageMagick**:
   ```bash
   convert favicon.svg -resize 192x192 pwa-192x192.png
   convert favicon.svg -resize 512x512 pwa-512x512.png
   convert favicon.svg -resize 180x180 apple-touch-icon.png
   ```

`favicon.ico` is built from `favicon.svg` at 16, 32 and 48px. The PNG icons above still use the older logo.
For production deployment, generate proper PNG icons using one of the methods above.
