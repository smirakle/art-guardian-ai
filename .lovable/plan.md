

## Automate Cache-Busting for Adobe Plugin Development

### Problem
Testing changes to the Adobe UXP plugin is tedious because:
1. Three files need version updates: `manifest.json`, `index.html` (CSS + JS links), and `styles.css` (comment header)
2. macOS aggressively caches UXP assets even after plugin reloads
3. No quick way to verify if the latest code is running

### Solution
Create a shell script and development checklist that automates the entire process.

---

### Files to Create

**1. `adobe-plugin/scripts/bump-version.sh`** - Bash script to auto-update all version references

```bash
#!/bin/bash
# TSMO Adobe Plugin - Version Bump Script
# Usage: ./scripts/bump-version.sh [major|minor|patch]

PLUGIN_DIR="$(dirname "$0")/.."
cd "$PLUGIN_DIR"

# Read current version from manifest.json
CURRENT_VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
echo "Current version: $CURRENT_VERSION"

# Parse version components
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Bump based on argument (default: patch)
case "${1:-patch}" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo "New version: $NEW_VERSION"

# Update manifest.json
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" manifest.json

# Update index.html (CSS and JS cache-busting params)
sed -i '' "s/styles.css?v=[0-9.]*\"/styles.css?v=$NEW_VERSION\"/" index.html
sed -i '' "s/index.js?v=[0-9.]*\"/index.js?v=$NEW_VERSION\"/" index.html
sed -i '' "s/v[0-9.]*<\/span>/v$NEW_VERSION<\/span>/" index.html

# Update styles.css header comment
sed -i '' "s/Styles v[0-9.]*/Styles v$NEW_VERSION/" styles.css

echo "✅ Updated all files to v$NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. Quit Photoshop completely"
echo "  2. Run: ./scripts/clear-cache.sh"
echo "  3. Restart Photoshop"
echo "  4. Reload plugin in UXP Developer Tools"
echo "  5. Look for v$NEW_VERSION in footer"
```

**2. `adobe-plugin/scripts/clear-cache.sh`** - Script to clear all UXP caches

```bash
#!/bin/bash
# TSMO Adobe Plugin - Cache Clear Script

echo "🧹 Clearing Adobe UXP caches..."

# Clear UXP caches
rm -rf ~/Library/Caches/Adobe/UXP 2>/dev/null && echo "  ✓ Cleared UXP cache"
rm -rf ~/Library/Application\ Support/Adobe/UXP/PluginData 2>/dev/null && echo "  ✓ Cleared plugin data"

# Clear Chromium cache (UXP uses Chromium under the hood)
rm -rf ~/Library/Caches/Adobe/Creative\ Cloud\ Desktop\ App 2>/dev/null && echo "  ✓ Cleared CC Desktop cache"

echo ""
echo "✅ Cache cleared!"
echo ""
echo "Next steps:"
echo "  1. Start Photoshop"
echo "  2. Open UXP Developer Tools"
echo "  3. Load plugin folder: $(cd "$(dirname "$0")/.." && pwd)"
echo "  4. Click 'Load' or 'Reload'"
```

**3. `adobe-plugin/scripts/dev-reload.sh`** - One-command development reload

```bash
#!/bin/bash
# TSMO Adobe Plugin - Full Dev Reload
# Bumps version, clears cache, and provides instructions

SCRIPT_DIR="$(dirname "$0")"

echo "🚀 TSMO Plugin Development Reload"
echo "================================="
echo ""

# Step 1: Bump version
"$SCRIPT_DIR/bump-version.sh" patch

# Step 2: Clear cache
"$SCRIPT_DIR/clear-cache.sh"

echo ""
echo "📋 Manual steps required:"
echo "  1. Quit Photoshop if running"
echo "  2. Start Photoshop"
echo "  3. In UXP Dev Tools, click 'Reload'"
echo "  4. Verify version badge in plugin footer"
```

**4. `adobe-plugin/DEVELOPMENT.md`** - Quick reference checklist

```markdown
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
```

---

### File Structure After Implementation

```text
adobe-plugin/
├── scripts/
│   ├── bump-version.sh    # Auto-update version in all files
│   ├── clear-cache.sh     # Clear all UXP caches
│   └── dev-reload.sh      # Combined: bump + clear + instructions
├── DEVELOPMENT.md         # Quick reference documentation
├── manifest.json
├── index.html
├── index.js
├── styles.css
└── ...
```

---

### Usage

**One-command workflow:**
```bash
./scripts/dev-reload.sh
```

**Granular control:**
```bash
./scripts/bump-version.sh minor   # Just bump version
./scripts/clear-cache.sh          # Just clear cache
```

---

### Technical Notes

- Scripts use `sed -i ''` for macOS compatibility (BSD sed)
- Version regex patterns handle semantic versioning (X.Y.Z format)
- Cache paths target macOS; Linux paths would differ
- Scripts are idempotent and safe to run multiple times

