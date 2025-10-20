# AGENTS.md

This file provides context and instructions to help AI coding agents work effectively on this project.

## Project Overview

This is a Chrome browser extension (Manifest V3) that detects RSS/Atom feeds on web pages and enables quick subscription via Newsblur. The extension has no popup UI—instead, clicking the icon opens a new tab displaying detected feeds.

## Dev Environment Tips

- **Load the extension in Chrome**: Navigate to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select this directory
- **Reload after changes**: After modifying any files, go to `chrome://extensions/` and click the refresh icon on the extension card
- **View console logs**:
  - For `background.js`: Right-click the extension and select "Inspect service worker"
  - For `content.js`: Open DevTools on any webpage (F12) and check the Console
  - For `feeds.js`: Open DevTools on the feeds tab
- **Icon generation**: Icons are generated from SVG files using the Node.js script `convert-svg-to-png.js`. Run with `node convert-svg-to-png.js` (requires `sharp` package installed)
- **Key files**:
  - `manifest.json` - Extension configuration (Manifest V3)
  - `background.js` - Service worker managing feed cache and icon states
  - `content.js` - Content script that scans pages for RSS/Atom feeds
  - `feeds.html` + `feeds.js` - UI that displays detected feeds
  - `icons/` - Extension icons (SVG sources and PNG outputs)

## Architecture and Conventions

### Feed Detection Logic

The extension detects feeds using these selectors:
```javascript
'link[rel="alternate"][type="application/rss+xml"]'
'link[rel="alternate"][type="application/atom+xml"]'
'a[type="application/rss+xml"]'
'a[type="application/atom+xml"]'
```

### Communication Flow

1. `content.js` scans the page and sends messages to `background.js`
2. `background.js` caches feeds per tab and updates icon/badge
3. When clicked, `background.js` stores feeds in session storage and opens `feeds.html`
4. `feeds.js` retrieves feeds from session storage and renders links to Newsblur

### Code Style

- Use vanilla JavaScript (no frameworks)
- Prefer `const` over `let`; avoid `var`
- Use async/await for Chrome API calls
- Keep code simple and readable
- Add debug logging for important operations (see existing `console.log` statements)

## Testing Instructions

### Manual Testing

1. **Test feed detection**: Visit sites known to have RSS feeds:
   - https://techcrunch.com
   - https://www.theverge.com
   - https://arstechnica.com
   - https://news.ycombinator.com
   - Any WordPress blog

2. **Expected behavior**:
   - Icon should turn orange when feeds are detected
   - Badge should show the count of detected feeds
   - Clicking the icon should open a new tab with feed links
   - Each feed link should open Newsblur with the feed URL pre-filled

3. **Test no-feed scenario**: Visit a site without RSS feeds (e.g., https://google.com)
   - Icon should remain gray
   - No badge should appear
   - Clicking the icon should do nothing

4. **Test tab switching**:
   - Open multiple tabs with different feed counts
   - Verify badge and icon update correctly for each tab

### Regression Testing

After making changes:
- Test on at least 2-3 sites with feeds
- Test on a site without feeds
- Verify icon states, badge counts, and feed links work correctly
- Check browser console for errors in all contexts (service worker, content script, feeds page)

### Icon Testing

After regenerating icons:
- Verify `icons/icon-48.png` and `icons/icon-128.png` exist
- Verify `icons/icon-active-48.png` and `icons/icon-active-128.png` exist
- Check that icons display correctly in the toolbar and extensions page

## PR Instructions

### Before Creating a PR

- [ ] Test the extension manually on multiple websites with and without feeds
- [ ] Check all console outputs for errors (service worker, content script, feeds page)
- [ ] Verify no breaking changes to existing functionality
- [ ] Update README.md if adding new features or changing behavior
- [ ] Ensure all files use consistent formatting (2-space indentation)

### Commit Message Format

- Use clear, descriptive commit messages in imperative mood
- Examples: "Add debug logging for feed detection", "Fix icon badge display issue"
- Include context about why the change was made if not obvious

### Code Review Checklist

- Does the code follow the existing style and conventions?
- Are there appropriate debug logs for troubleshooting?
- Does it work with Manifest V3 requirements?
- Is the change backwards compatible with existing cached data?
- Are there any security concerns (XSS, injection, etc.)?

## Common Tasks

### Adding a New Feed Reader

To add support for another feed reader besides Newsblur:
1. Update `feeds.js` to generate links for the new reader
2. Consider adding a settings page to let users choose their preferred reader
3. Update README.md with the new functionality

### Modifying Icon Behavior

To change when/how the icon updates:
1. Edit the logic in `background.js` message handlers
2. Icon paths are in `chrome.action.setIcon()` calls
3. Badge text is set via `chrome.action.setBadgeText()`

### Updating Feed Detection

To detect different types of feeds or elements:
1. Modify the selectors in `content.js`
2. Update the data extraction logic in the `map()` function
3. Test thoroughly on various websites
