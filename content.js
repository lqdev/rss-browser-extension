// RSS Feed Detector - Content Script
// Detects RSS/Atom feeds on web pages and sends them to the background script

(function() {
  'use strict';

  // CSS selectors for finding feed links
  const feedSelectors = [
    'link[rel="alternate"][type="application/rss+xml"]',
    'link[rel="alternate"][type="application/atom+xml"]',
    'a[type="application/rss+xml"]',
    'a[type="application/atom+xml"]'
  ];

  // Find all feed links on the page
  const feedElements = document.querySelectorAll(feedSelectors.join(','));

  const feedLinks = Array.from(feedElements)
    .map(el => ({
      href: el.href,
      title: el.title || el.textContent?.trim() || 'Feed',
      type: el.type || 'application/rss+xml'
    }))
    .filter(feed => feed.href); // Only include feeds with valid href

  // Send results to background script
  if (feedLinks.length > 0) {
    chrome.runtime.sendMessage({
      type: 'feeds_found',
      feeds: feedLinks
    });
  } else {
    chrome.runtime.sendMessage({
      type: 'no_feeds'
    });
  }
})();
