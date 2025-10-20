// RSS Feed Detector - Background Service Worker
// Manages feed cache, icon states, and handles user interactions

// Cache feeds per tab
const feedCache = new Map();

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender) => {
  if (!sender.tab?.id) return;

  const tabId = sender.tab.id;

  if (message.type === 'feeds_found') {
    // Store feeds for this tab
    feedCache.set(tabId, message.feeds);

    // Update icon to active state
    chrome.action.setIcon({
      tabId,
      path: 'icons/icon-active.png'
    });

    // Show badge with feed count
    chrome.action.setBadgeText({
      tabId,
      text: message.feeds.length.toString()
    });

    // Set badge background color (orange for RSS)
    chrome.action.setBadgeBackgroundColor({
      tabId,
      color: '#FF6600'
    });
  }

  if (message.type === 'no_feeds') {
    // Clear feed cache for this tab
    feedCache.delete(tabId);

    // Reset icon to default state
    chrome.action.setIcon({
      tabId,
      path: 'icons/icon.png'
    });

    // Clear badge
    chrome.action.setBadgeText({
      tabId,
      text: ''
    });
  }
});

// Handle icon click
chrome.action.onClicked.addListener(async (tab) => {
  const feeds = feedCache.get(tab.id);

  // Only open feeds page if feeds were found
  if (!feeds?.length) return;

  // Store feeds in session storage for the feeds page to access
  await chrome.storage.session.set({ feeds });

  // Open feeds page in new tab
  chrome.tabs.create({
    url: chrome.runtime.getURL('feeds.html')
  });
});

// Clean up cache when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  feedCache.delete(tabId);
});
