// RSS Feed Detector - Content Script
// Detects RSS/Atom feeds on web pages and sends them to the background script

(function() {
  'use strict';

  console.log('[RSS Detector] Content script loaded on:', window.location.href);

  // CSS selectors for finding feed links
  const feedSelectors = [
    'link[rel="alternate"][type="application/rss+xml"]',
    'link[rel="alternate"][type="application/atom+xml"]',
    'a[type="application/rss+xml"]',
    'a[type="application/atom+xml"]'
  ];

  // Find all feed links on the page
  const feedElements = document.querySelectorAll(feedSelectors.join(','));
  console.log('[RSS Detector] Found', feedElements.length, 'feed elements');

  const feedLinks = Array.from(feedElements)
    .map(el => ({
      href: el.href,
      title: el.title || el.textContent?.trim() || 'Feed',
      type: el.type || 'application/rss+xml'
    }))
    .filter(feed => feed.href); // Only include feeds with valid href

  console.log('[RSS Detector] Processed feed links:', feedLinks);

  // Send results to background script
  if (feedLinks.length > 0) {
    console.log('[RSS Detector] Sending feeds_found message with', feedLinks.length, 'feeds');
    chrome.runtime.sendMessage({
      type: 'feeds_found',
      feeds: feedLinks
    }).then(() => {
      console.log('[RSS Detector] Message sent successfully');
    }).catch(error => {
      console.error('[RSS Detector] Error sending message:', error);
    });
  } else {
    console.log('[RSS Detector] No feeds found, sending no_feeds message');
    chrome.runtime.sendMessage({
      type: 'no_feeds'
    }).catch(error => {
      console.error('[RSS Detector] Error sending no_feeds message:', error);
    });
  }
})();
