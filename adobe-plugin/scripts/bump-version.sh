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
