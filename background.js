// RSS Feed Detector - Background Service Worker
// Manages feed cache, icon states, and handles user interactions

console.log('[RSS Detector] Background service worker started');

// Cache feeds per tab
const feedCache = new Map();

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender) => {
  console.log('[RSS Detector] Message received:', message, 'from sender:', sender);

  if (!sender.tab?.id) {
    console.log('[RSS Detector] No tab ID in sender, ignoring message');
    return;
  }

  const tabId = sender.tab.id;
  console.log('[RSS Detector] Processing message for tab:', tabId);

  if (message.type === 'feeds_found') {
    console.log('[RSS Detector] Feeds found! Count:', message.feeds.length);

    // Store feeds for this tab
    feedCache.set(tabId, message.feeds);
    console.log('[RSS Detector] Stored feeds in cache for tab:', tabId);

    // Update icon to active state
    chrome.action.setIcon({
      tabId,
      path: 'icons/icon-active.png'
    }).then(() => {
      console.log('[RSS Detector] Icon updated to active state');
    }).catch(err => {
      console.error('[RSS Detector] Error updating icon:', err);
    });

    // Show badge with feed count
    chrome.action.setBadgeText({
      tabId,
      text: message.feeds.length.toString()
    }).then(() => {
      console.log('[RSS Detector] Badge text set to:', message.feeds.length);
    }).catch(err => {
      console.error('[RSS Detector] Error setting badge text:', err);
    });

    // Set badge background color (orange for RSS)
    chrome.action.setBadgeBackgroundColor({
      tabId,
      color: '#FF6600'
    }).then(() => {
      console.log('[RSS Detector] Badge color set to orange');
    }).catch(err => {
      console.error('[RSS Detector] Error setting badge color:', err);
    });
  }

  if (message.type === 'no_feeds') {
    console.log('[RSS Detector] No feeds found for tab:', tabId);

    // Clear feed cache for this tab
    feedCache.delete(tabId);

    // Reset icon to default state
    chrome.action.setIcon({
      tabId,
      path: 'icons/icon.png'
    }).catch(err => {
      console.error('[RSS Detector] Error resetting icon:', err);
    });

    // Clear badge
    chrome.action.setBadgeText({
      tabId,
      text: ''
    }).catch(err => {
      console.error('[RSS Detector] Error clearing badge:', err);
    });
  }
});

// Handle icon click
chrome.action.onClicked.addListener(async (tab) => {
  console.log('[RSS Detector] Icon clicked for tab:', tab.id);
  const feeds = feedCache.get(tab.id);
  console.log('[RSS Detector] Cached feeds for this tab:', feeds);

  // Only open feeds page if feeds were found
  if (!feeds?.length) {
    console.log('[RSS Detector] No feeds in cache, not opening feeds page');
    return;
  }

  // Store feeds in session storage for the feeds page to access
  await chrome.storage.session.set({ feeds });
  console.log('[RSS Detector] Stored feeds in session storage');

  // Open feeds page in new tab
  chrome.tabs.create({
    url: chrome.runtime.getURL('feeds.html')
  });
  console.log('[RSS Detector] Opening feeds page');
});

// Clean up cache when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log('[RSS Detector] Tab closed:', tabId);
  feedCache.delete(tabId);
});
