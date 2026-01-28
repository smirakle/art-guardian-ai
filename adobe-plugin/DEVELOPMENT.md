# TSMO Plugin Development Guide

## Quick Reload (Recommended)

Run the dev reload script:
```bash
cd adobe-plugin
chmod +x scripts/*.sh  # First time only
./scripts/dev-reload.sh
```

## Manual Process

### Step 1: Bump Version
```bash
./scripts/bump-version.sh patch  # 1.1.4 → 1.1.5
./scripts/bump-version.sh minor  # 1.1.5 → 1.2.0
./scripts/bump-version.sh major  # 1.2.0 → 2.0.0
```

### Step 2: Clear Cache
```bash
./scripts/clear-cache.sh
```

### Step 3: Reload in Photoshop
1. Quit Photoshop completely (Cmd+Q)
2. Start Photoshop
3. Open UXP Developer Tools
4. Click "Load" or "Reload"
5. **Verify**: Check footer for correct version number

## Troubleshooting

### Changes not appearing?
- Check the version badge in the footer matches your expected version
- Try the "nuclear" cache clear:
  ```bash
  rm -rf ~/Library/Application\ Support/Adobe/UXP/
  rm -rf ~/Library/Caches/Adobe/UXP
  ```
- Restart your Mac (last resort)

### Version files to update
| File | Location |
|------|----------|
| manifest.json | `"version": "X.Y.Z"` |
| index.html | `styles.css?v=X.Y.Z`, `index.js?v=X.Y.Z`, `<span>vX.Y.Z</span>` |
| styles.css | `/* Styles vX.Y.Z */` header comment |
