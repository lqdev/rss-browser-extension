# 📄 Product Requirements Document (PRD)

## 🧩 Project Title

RSS Feed Detector Extension for Newsblur

---

## 📌 Objective

Develop a lightweight browser extension that:
- Detects RSS/Atom feeds embedded in web pages.
- Shows a badge and changes the icon when feeds are found.
- Allows users to subscribe to feeds directly via Newsblur (https://newsblur.com).
- Requires no popup UI — uses a dedicated tab for displaying feed links.

---

## 🧑‍💻 Target Users

- Web users who use Newsblur to follow RSS/Atom feeds.
- Power users, journalists, bloggers, and researchers who want quick access to site feeds.

---

## 🖥️ Platforms

- Browsers: Google Chrome (initial), Firefox (optional/future)
- OS: Cross-platform (extension runs in browser)

---

## 🔍 Features

### ✅ Feed Discovery

- Detect `<link rel="alternate" type="application/rss+xml|application/atom+xml">`
- Detect `<a type="application/rss+xml|application/atom+xml">`
- Extract:
  - `href`
  - `title` (or fallback to textContent or generic label)
  - `type` (RSS/Atom)

### ✅ Visual Indicators

- Change icon when feeds are found.
- Show a badge on the extension icon with the number of detected feeds.

### ✅ Feed UI

- When the icon is clicked:
  - Open a new tab (`feeds.html`) that lists all discovered feeds.
  - Each feed item is a link to `https://newsblur.com/?url=FEED_URL`.

### ✅ Subscription Integration

- Clicking a feed link opens Newsblur with the selected feed prefilled.
- URL format:

  https://newsblur.com/?url=<ENCODED_FEED_URL>

---

## 🚫 Out of Scope (for MVP)

- Support for additional feed readers (Feedly, Inoreader, etc.)
- Persistent storage or history
- Firefox support (can be added in future)
- Custom user-defined feed filters

---

## 🧱 Architecture Overview

rss-feed-detector/
├── manifest.json          # Chrome extension manifest (MV3)
├── background.js          # Handles icon logic, feed cache, tab events
├── content.js             # Extracts feed info from web pages
├── feeds.html             # UI shown in new tab when icon is clicked
├── feeds.js               # Loads feed data and renders UI
└── icons/
    ├── icon.png           # Default icon
    └── icon-active.png    # Icon when feeds are found

---

## ⚙️ Technical Implementation

### content.js

```js
const feedSelectors = [
  'link[rel="alternate"][type="application/rss+xml"]',
  'link[rel="alternate"][type="application/atom+xml"]',
  'a[type="application/rss+xml"]',
  'a[type="application/atom+xml"]'
];

const feedLinks = Array.from(document.querySelectorAll(feedSelectors.join(',')))
  .map(el => ({
    href: el.href,
    title: el.title || el.textContent || 'Feed',
    type: el.type || 'application/rss+xml'
  }));

if (feedLinks.length > 0) {
  chrome.runtime.sendMessage({ type: 'feeds_found', feeds: feedLinks });
} else {
  chrome.runtime.sendMessage({ type: 'no_feeds' });
}
```

---

### background.js

```js
const feedCache = new Map();

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!sender.tab?.id) return;
  const tabId = sender.tab.id;

  if (message.type === 'feeds_found') {
    feedCache.set(tabId, message.feeds);
    chrome.action.setIcon({ tabId, path: 'icons/icon-active.png' });
    chrome.action.setBadgeText({ tabId, text: message.feeds.length.toString() });
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#FF6600' });
  }

  if (message.type === 'no_feeds') {
    feedCache.delete(tabId);
    chrome.action.setIcon({ tabId, path: 'icons/icon.png' });
    chrome.action.setBadgeText({ tabId, text: '' });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  const feeds = feedCache.get(tab.id);
  if (!feeds?.length) return;

  await chrome.storage.session.set({ feeds });

  chrome.tabs.create({
    url: chrome.runtime.getURL('feeds.html')
  });
});
```

---

### feeds.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Feeds Found</title>
  <style>
    body {
      font-family: sans-serif;
      padding: 20px;
      background: #f9f9f9;
    }
    h2 {
      margin-top: 0;
    }
    .feed {
      margin-bottom: 10px;
    }
    .feed a {
      text-decoration: none;
      color: #0073e6;
    }
  </style>
</head>
<body>
  <h2>Feeds Found</h2>
  <div id="feeds">Loading...</div>
  <script src="feeds.js"></script>
</body>
</html>
```

---

### feeds.js

```js
(async () => {
  const { feeds } = await chrome.storage.session.get('feeds');
  const container = document.getElementById('feeds');

  if (!feeds?.length) {
    container.innerText = 'No feeds found.';
    return;
  }

  container.innerHTML = '';
  feeds.forEach(feed => {
    const div = document.createElement('div');
    div.className = 'feed';

    const a = document.createElement('a');
    a.href = `https://newsblur.com/?url=${encodeURIComponent(feed.href)}`;
    a.target = '_blank';
    a.textContent = `${feed.title} (${feed.type})`;

    div.appendChild(a);
    container.appendChild(div);
  });
})();
```

---

## 🔐 Permissions Required

```json
"permissions": ["scripting", "tabs", "storage"],
"host_permissions": ["<all_urls>"]
```

---

## 🧪 Testing Plan

| Action                         | Expected Outcome                                       |
|--------------------------------|--------------------------------------------------------|
| Visit site with RSS/Atom feed  | Badge appears on icon with count                      |
| Click icon                     | New tab opens showing feeds                           |
| Click feed link                | Opens Newsblur with feed URL prefilled                |
| Visit site without feeds       | No badge shown, icon remains default                  |
| Reload tab                     | Badge and icon update accordingly                     |

---

## 🧭 Future Improvements

- [ ] Firefox compatibility (requires MV3 compatibility testing)
- [ ] Support for multiple readers (Newsblur, Feedly, Inoreader)
- [ ] Settings page to let users choose preferred reader
- [ ] Notification when new feeds are detected