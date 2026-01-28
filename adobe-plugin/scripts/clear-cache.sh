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
