# RSS Feed Detector for Newsblur

A lightweight Chrome extension that automatically detects RSS and Atom feeds on web pages and allows quick subscription via [Newsblur](https://newsblur.com).

## Features

- Automatically detects RSS and Atom feeds on any webpage
- Visual indicator: icon changes color when feeds are found
- Badge shows the number of detected feeds
- One-click access to subscribe to feeds via Newsblur
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

4. **Subscribe** - Click any feed link to open Newsblur with that feed pre-filled for subscription

## How It Works

The extension uses three main components:

- **Content Script** (`content.js`) - Scans web pages for RSS/Atom feed links
- **Background Worker** (`background.js`) - Manages feed cache and icon states
- **Feeds Page** (`feeds.html` + `feeds.js`) - Displays detected feeds with Newsblur subscription links

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
- `storage` - To temporarily store detected feeds
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
- [ ] Support for additional feed readers (Feedly, Inoreader, etc.)
- [ ] Settings page for choosing preferred feed reader
- [ ] Feed preview before subscribing
- [ ] Keyboard shortcuts

## License

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
