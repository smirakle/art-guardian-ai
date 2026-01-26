
## Fix: Add Version Indicator + Ensure Post-Login Panel Centering

### Problem
Changes to the Adobe plugin aren't visibly loading, making it difficult to verify when updates are applied. The caching is aggressive, and there's no easy way to confirm the current code version is running.

### Solution

**1. Add Visible Version Indicator in Footer**

Update `adobe-plugin/index.html` footer to show the current version:

```html
<!-- Footer -->
<div class="footer">
  <span class="version-badge">v1.1.4</span>
  <a id="websiteLink" href="https://www.tsmowatch.com" target="_blank">www.tsmowatch.com</a>
  <span class="footer-divider">|</span>
  <span id="footerCopyright">© 2026 TSMO Technology Inc.</span>
</div>
```

**2. Add Version Badge Styling**

Add to `adobe-plugin/styles.css`:

```css
.version-badge {
  font-size: 9px;
  font-weight: 500;
  color: #ec4899;
  background: rgba(236, 72, 153, 0.15);
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 8px;
}
```

**3. Bump Version Numbers for Cache Refresh**

| File | Change |
|------|--------|
| `manifest.json` | `"version": "1.1.4"` |
| `index.html` | `styles.css?v=1.1.4` and `index.js?v=1.1.4` |

---

### Result

After implementation:
- A pink **v1.1.4** badge will appear in the footer
- You'll instantly know when the new code loads by checking the version number
- Future changes just need a version bump to verify updates are working

---

### After Deploying

1. **Quit Photoshop completely**
2. Clear UXP cache:
   ```bash
   rm -rf ~/Library/Caches/Adobe/UXP
   ```
3. Restart Photoshop
4. Reload plugin in UXP Developer Tools
5. Look for **v1.1.4** in the footer to confirm
