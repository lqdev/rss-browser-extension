# RSS Feed Detector

A lightweight Chrome extension that automatically detects RSS and Atom feeds on web pages and allows quick subscription via multiple RSS readers.

## Features

- Automatically detects RSS and Atom feeds on any webpage
- Visual indicator: icon changes color when feeds are found
- Badge shows the number of detected feeds
- **Multiple RSS reader support**: NewsBlur, Feedly, Inoreader, The Old Reader
- **Custom reader support**: Add your own RSS reader with a custom URL pattern
- **Feed URL display**: See the actual feed URL for each detected feed
- **Copy to clipboard**: One-click copy of feed URLs for easy sharing
- Remembers your preferred RSS reader choice
- Clean, minimal interface with no popup clutter
- Works with Chrome Manifest V3

## Installation

### From Source (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/lqdev/rss-browser-extension.git
   cd rss-browser-extension
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" using the toggle in the top right corner

4. Click "Load unpacked" and select the `rss-browser-extension` directory

5. The RSS Feed Detector icon should now appear in your browser toolbar

## Usage

1. **Browse the web** - Visit any website that has RSS or Atom feeds

2. **Watch for the indicator** - When feeds are detected:
   - The extension icon turns orange
   - A badge appears showing the number of feeds found

3. **View feeds** - Click the extension icon to open a new tab listing all discovered feeds

4. **Choose your reader** - Select your preferred RSS reader from the dropdown:
   - NewsBlur (default)
   - Feedly
   - Inoreader
   - The Old Reader
   - Custom Reader (enter your own URL pattern using `%s` as placeholder)

5. **Subscribe** - Click any feed link to open your chosen RSS reader with that feed pre-filled

6. **Copy feed URL** - Click the "Copy URL" button to copy the feed URL to your clipboard for manual subscription or sharing

## How It Works

The extension uses three main components:

- **Content Script** (`content.js`) - Scans web pages for RSS/Atom feed links
- **Background Worker** (`background.js`) - Manages feed cache and icon states
- **Feeds Page** (`feeds.html` + `feeds.js`) - Displays detected feeds with multi-reader support and copy functionality

### Feed Detection

The extension looks for feeds in two ways:

1. `<link rel="alternate" type="application/rss+xml">` or `type="application/atom+xml"`
2. `<a type="application/rss+xml">` or `type="application/atom+xml"`

## Testing

Try visiting these sites known to have RSS feeds:

- [TechCrunch](https://techcrunch.com)
- [The Verge](https://www.theverge.com)
- [Ars Technica](https://arstechnica.com)
- [Hacker News](https://news.ycombinator.com)
- Any WordPress blog (most have RSS feeds)

## Project Structure

```
rss-browser-extension/
├── manifest.json          # Chrome extension manifest (MV3)
├── background.js          # Service worker for feed management
├── content.js             # Feed detection script
├── feeds.html             # Feed list UI
├── feeds.js               # Feed list renderer
├── icons/
│   ├── icon.svg          # Default icon (gray)
│   ├── icon-active.svg   # Active icon (orange)
│   ├── icon.png          # Default icon PNG
│   └── icon-active.png   # Active icon PNG
├── docs/
│   └── prd.md            # Product Requirements Document
└── README.md
```

## Permissions

This extension requires the following permissions:

- `scripting` - To inject the content script that detects feeds
- `tabs` - To get information about the current tab
- `storage` - To store detected feeds and save your reader preference
- `clipboardWrite` - To enable copying feed URLs to clipboard
- `<all_urls>` - To detect feeds on any website

## Development

### Building Icons

The icons are generated from SVG files:

```bash
cd icons
rsvg-convert -w 128 -h 128 icon.svg -o icon.png
rsvg-convert -w 128 -h 128 icon-active.svg -o icon-active.png
```

### Testing Changes

After making changes:

1. Go to `chrome://extensions/`
2. Click the refresh icon on the RSS Feed Detector card
3. Test on a website with RSS feeds

## Future Enhancements

- [ ] Firefox support
- [ ] Feed preview before subscribing
- [ ] Keyboard shortcuts
- [ ] OPML export of discovered feeds
- [ ] Feed validation and health checks

## License

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
