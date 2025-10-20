// RSS Feed Detector - Feeds Page Script
// Loads and displays discovered feeds with multi-reader support

// Define available RSS readers and their subscription URL patterns
const RSS_READERS = {
  newsblur: {
    name: 'NewsBlur',
    url: 'https://newsblur.com/?url=%s'
  },
  feedly: {
    name: 'Feedly',
    url: 'https://www.feedly.com/i/subscription/feed/%s'
  },
  inoreader: {
    name: 'Inoreader',
    url: 'https://www.inoreader.com/feed/%s'
  },
  theoldreader: {
    name: 'The Old Reader',
    url: 'https://theoldreader.com/feeds/subscribe?url=%s'
  }
};

let selectedReader = 'newsblur';
let customReaderUrl = '';

// Initialize the page
(async () => {
  const container = document.getElementById('feeds');
  const readerSelect = document.getElementById('readerSelect');
  const customReaderInput = document.getElementById('customReaderUrl');

  try {
    // Load saved reader preference
    const { rssReader, customReader } = await chrome.storage.local.get(['rssReader', 'customReader']);
    if (rssReader) {
      selectedReader = rssReader;
      readerSelect.value = rssReader;
      if (rssReader === 'custom' && customReader) {
        customReaderUrl = customReader;
        customReaderInput.value = customReader;
        customReaderInput.classList.add('show');
      }
    }

    // Handle reader selection change
    readerSelect.addEventListener('change', async (e) => {
      selectedReader = e.target.value;
      await chrome.storage.local.set({ rssReader: selectedReader });

      if (selectedReader === 'custom') {
        customReaderInput.classList.add('show');
        customReaderInput.focus();
      } else {
        customReaderInput.classList.remove('show');
      }

      // Re-render feeds with new reader
      renderFeeds();
    });

    // Handle custom reader URL input
    customReaderInput.addEventListener('input', async (e) => {
      customReaderUrl = e.target.value;
      await chrome.storage.local.set({ customReader: customReaderUrl });
      renderFeeds();
    });

    // Retrieve feeds from session storage
    const { feeds } = await chrome.storage.session.get('feeds');

    // Handle no feeds case
    if (!feeds || feeds.length === 0) {
      container.innerHTML = '<div class="no-feeds">No feeds found on the previous page.</div>';
      return;
    }

    // Initial render
    renderFeeds(feeds);
    console.log(`Rendered ${feeds.length} feed(s)`);
  } catch (error) {
    console.error('Error loading feeds:', error);
    container.innerHTML = '<div class="no-feeds">Error loading feeds. Please try again.</div>';
  }
})();

// Render feeds with current reader selection
async function renderFeeds(feedsData = null) {
  const container = document.getElementById('feeds');

  // If no feeds data provided, retrieve from storage
  if (!feedsData) {
    const { feeds } = await chrome.storage.session.get('feeds');
    feedsData = feeds;
  }

  if (!feedsData || feedsData.length === 0) {
    return;
  }

  // Clear container
  container.innerHTML = '';
  container.classList.remove('loading');

  // Render each feed
  feedsData.forEach(feed => {
    const feedDiv = document.createElement('div');
    feedDiv.className = 'feed';

    // Create subscription link
    const link = document.createElement('a');
    link.className = 'feed-link';
    link.href = getSubscriptionUrl(feed.href);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    // Feed title
    const titleSpan = document.createElement('span');
    titleSpan.className = 'feed-title';
    titleSpan.textContent = feed.title;

    // Feed type badge
    const typeSpan = document.createElement('span');
    typeSpan.className = 'feed-type';
    const feedType = feed.type.includes('atom') ? 'Atom' : 'RSS';
    typeSpan.textContent = feedType;

    link.appendChild(titleSpan);
    link.appendChild(typeSpan);
    feedDiv.appendChild(link);

    // Feed URL display with copy button
    const urlContainer = document.createElement('div');
    urlContainer.className = 'feed-url-container';

    const urlSpan = document.createElement('span');
    urlSpan.className = 'feed-url';
    urlSpan.textContent = feed.href;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy URL';
    copyBtn.addEventListener('click', () => copyToClipboard(feed.href, copyBtn));

    urlContainer.appendChild(urlSpan);
    urlContainer.appendChild(copyBtn);
    feedDiv.appendChild(urlContainer);

    container.appendChild(feedDiv);
  });
}

// Get subscription URL based on selected reader
function getSubscriptionUrl(feedUrl) {
  if (selectedReader === 'custom') {
    if (!customReaderUrl || !customReaderUrl.includes('%s')) {
      return '#';
    }
    return customReaderUrl.replace('%s', encodeURIComponent(feedUrl));
  }

  const reader = RSS_READERS[selectedReader];
  if (!reader) {
    return '#';
  }

  return reader.url.replace('%s', encodeURIComponent(feedUrl));
}

// Copy feed URL to clipboard
async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);

    // Visual feedback
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('copied');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 2000);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    button.textContent = 'Failed';
    setTimeout(() => {
      button.textContent = 'Copy URL';
    }, 2000);
  }
}
