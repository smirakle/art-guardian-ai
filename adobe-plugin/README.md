# TSMO AI Training Protection - Adobe Plugin

Protect your creative work from unauthorized AI training directly within Adobe Photoshop and Illustrator.

## Features

- **One-Click Protection**: Apply XMP metadata, EXIF data, and C2PA manifests with a single click
- **Auto-Protect on Export**: Automatically protect files when you save or export
- **Batch Processing**: Protect multiple layers or artboards at once
- **C2PA Compliance**: Enterprise-level cryptographic signing for content authenticity
- **Cloud Sync**: All protections sync to your TSMO dashboard for monitoring

## Installation

### Method 1: Adobe Exchange (Recommended)
1. Open Adobe Creative Cloud desktop app
2. Go to Stock & Marketplace → Plugins
3. Search for "TSMO Protection"
4. Click Install

### Method 2: Manual Installation
1. Download the `.ccx` package from [tsmo.io/adobe-plugin](https://tsmo.io/adobe-plugin)
2. Double-click the package to install via Creative Cloud

### Method 3: Developer Mode
1. Install [UXP Developer Tools](https://developer.adobe.com/photoshop/uxp/devtool/)
2. Clone this repository
3. Load the plugin folder in UXP Developer Tools
4. Click "Load" to test in Photoshop/Illustrator

## Supported Applications

| Application | Minimum Version | Status |
|-------------|-----------------|--------|
| Adobe Photoshop | 2024 (v24.0) | ✅ Supported |
| Adobe Illustrator | 2024 (v27.0) | ✅ Supported |
| Adobe InDesign | 2024 | 🔄 Coming Soon |

## Usage

1. Open the TSMO panel (Window → Extensions → TSMO Protection)
2. Sign in with your TSMO account
3. Set your protection level and copyright information
4. Click "Protect Current Document"

## Protection Levels

- **Basic**: XMP + EXIF metadata injection
- **Professional**: + Invisible watermark + LSB steganography
- **Enterprise**: + C2PA manifest with cryptographic signing

## API Integration

The plugin connects to the TSMO API at:
```
https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/adobe-plugin-api
```

## Building for Distribution

1. Install dependencies: `npm install`
2. Package using UXP Developer Tools: Create Package → Export as .ccx
3. Upload to Adobe Exchange for distribution

## Support

- Documentation: https://docs.tsmo.io/adobe-plugin
- Support: support@tsmo.io
- Issues: https://github.com/tsmo/adobe-plugin/issues

## License

MIT License - See LICENSE file for details.

© 2025 TSMO Inc. All rights reserved.
