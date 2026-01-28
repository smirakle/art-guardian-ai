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
