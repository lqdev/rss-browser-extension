// RSS Feed Detector - Feeds Page Script
// Loads and displays discovered feeds with multi-reader support

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
let secondaryActionLabel = '';
let secondaryActionUrl = '';
let pageData = {
  feeds: [],
  pageUrl: '',
  pageTitle: ''
};

(async () => {
  const container = document.getElementById('feeds');
  const readerSelect = document.getElementById('readerSelect');
  const customReaderInput = document.getElementById('customReaderUrl');
  const secondaryLabelInput = document.getElementById('secondaryActionLabel');
  const secondaryUrlInput = document.getElementById('secondaryActionUrl');

  try {
    const settings = await chrome.storage.local.get([
      'rssReader',
      'customReader',
      'secondaryActionLabel',
      'secondaryActionUrl'
    ]);
    if (settings.rssReader && (
      RSS_READERS[settings.rssReader] || settings.rssReader === 'custom'
    )) {
      selectedReader = settings.rssReader;
    }

    customReaderUrl = settings.customReader || '';
    secondaryActionLabel = settings.secondaryActionLabel || '';
    secondaryActionUrl = settings.secondaryActionUrl || '';
    readerSelect.value = selectedReader;
    customReaderInput.value = customReaderUrl;
    secondaryLabelInput.value = secondaryActionLabel;
    secondaryUrlInput.value = secondaryActionUrl;
    updateCustomReaderVisibility();

    readerSelect.addEventListener('change', async (event) => {
      selectedReader = event.target.value;
      await chrome.storage.local.set({ rssReader: selectedReader });
      updateCustomReaderVisibility();
      renderFeeds();
    });

    customReaderInput.addEventListener('input', async (event) => {
      customReaderUrl = event.target.value;
      await chrome.storage.local.set({ customReader: customReaderUrl });
      renderFeeds();
    });

    secondaryLabelInput.addEventListener('input', async (event) => {
      secondaryActionLabel = event.target.value;
      await chrome.storage.local.set({
        secondaryActionLabel
      });
      renderFeeds();
    });

    secondaryUrlInput.addEventListener('input', async (event) => {
      secondaryActionUrl = event.target.value;
      await chrome.storage.local.set({
        secondaryActionUrl
      });
      renderFeeds();
    });

    const storedPage = await chrome.storage.session.get([
      'feeds',
      'pageUrl',
      'pageTitle'
    ]);
    pageData = {
      feeds: Array.isArray(storedPage.feeds) ? storedPage.feeds : [],
      pageUrl: typeof storedPage.pageUrl === 'string' ? storedPage.pageUrl : '',
      pageTitle: typeof storedPage.pageTitle === 'string' ? storedPage.pageTitle : ''
    };

    renderFeeds();
  } catch (error) {
    console.error('Error loading feeds:', error);
    renderMessage('Error loading feeds. Please try again.');
  }
})();

function updateCustomReaderVisibility() {
  const customReaderInput = document.getElementById('customReaderUrl');
  customReaderInput.classList.toggle('show', selectedReader === 'custom');
}

function renderMessage(message) {
  const container = document.getElementById('feeds');
  const messageElement = document.createElement('div');
  messageElement.className = 'no-feeds';
  messageElement.textContent = message;
  container.replaceChildren(messageElement);
  container.classList.remove('loading');
}

function renderFeeds() {
  const container = document.getElementById('feeds');
  const validFeeds = pageData.feeds.filter(feed => (
    feed && FeedUrlUtils.normalizeHttpUrl(feed.href)
  ));

  if (validFeeds.length === 0) {
    renderMessage('No valid feeds found on the previous page.');
    return;
  }

  container.classList.remove('loading');
  container.replaceChildren(...validFeeds.map(createFeedElement));
  console.log(`Rendered ${validFeeds.length} feed(s)`);
}

function createFeedElement(feed) {
  const feedDiv = document.createElement('div');
  feedDiv.className = 'feed';

  const feedHeader = document.createElement('div');
  feedHeader.className = 'feed-header';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'feed-title';
  titleSpan.textContent = typeof feed.title === 'string' ? feed.title : 'Feed';

  const typeSpan = document.createElement('span');
  typeSpan.className = 'feed-type';
  typeSpan.textContent = getFeedType(feed.type);

  feedHeader.append(titleSpan, typeSpan);
  feedDiv.appendChild(feedHeader);

  const actions = document.createElement('div');
  actions.className = 'feed-actions';
  const subscriptionUrl = getSubscriptionUrl(feed.href);
  actions.appendChild(createActionElement(
    `Subscribe in ${getReaderName()}`,
    subscriptionUrl,
    false,
    FeedUrlUtils.getFeedActionAccessibleName(
      `Subscribe in ${getReaderName()}`,
      feed.title,
      feed.href
    )
  ));

  const secondaryUrl = getSecondaryActionUrl(feed.href);
  if (secondaryActionLabel.trim() && secondaryActionUrl.trim()) {
    const secondaryLabel = secondaryActionLabel.trim();
    actions.appendChild(createActionElement(
      secondaryLabel,
      secondaryUrl,
      true,
      FeedUrlUtils.getFeedActionAccessibleName(
        secondaryLabel,
        feed.title,
        feed.href
      )
    ));
  }
  feedDiv.appendChild(actions);

  const urlContainer = document.createElement('div');
  urlContainer.className = 'feed-url-container';

  const urlSpan = document.createElement('span');
  urlSpan.className = 'feed-url';
  urlSpan.textContent = feed.href;

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'copy-btn';
  copyButton.textContent = 'Copy URL';
  copyButton.addEventListener('click', () => copyToClipboard(feed.href, copyButton));

  urlContainer.append(urlSpan, copyButton);
  feedDiv.appendChild(urlContainer);
  return feedDiv;
}

function createActionElement(label, url, secondary = false, accessibleName = label) {
  if (!url) {
    const disabledButton = document.createElement('button');
    disabledButton.type = 'button';
    disabledButton.className = `action-btn${secondary ? ' secondary' : ''}`;
    disabledButton.textContent = label;
    disabledButton.setAttribute('aria-label', accessibleName);
    disabledButton.disabled = true;
    disabledButton.title = 'Enter a valid HTTP/HTTPS URL template.';
    return disabledButton;
  }

  const link = document.createElement('a');
  link.className = `action-btn${secondary ? ' secondary' : ''}`;
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = label;
  link.setAttribute('aria-label', accessibleName);
  return link;
}

function getFeedType(type) {
  if (typeof type !== 'string') {
    return 'RSS';
  }

  if (type.includes('atom')) {
    return 'Atom';
  }

  if (type.includes('feed+json')) {
    return 'JSON';
  }

  return 'RSS';
}

function getReaderName() {
  if (selectedReader === 'custom') {
    return 'Custom Reader';
  }

  return RSS_READERS[selectedReader]?.name || 'Reader';
}

function getReaderTemplate() {
  if (selectedReader === 'custom') {
    return customReaderUrl.includes('%s') ? customReaderUrl : '';
  }

  return RSS_READERS[selectedReader]?.url || '';
}

function getSubscriptionUrl(feedUrl) {
  return FeedUrlUtils.expandUrlTemplate(getReaderTemplate(), {
    feedUrl,
    pageUrl: pageData.pageUrl,
    pageTitle: pageData.pageTitle
  });
}

function getSecondaryActionUrl(feedUrl) {
  if (!secondaryActionLabel.trim() || !secondaryActionUrl.trim()) {
    return null;
  }

  return FeedUrlUtils.expandUrlTemplate(secondaryActionUrl, {
    feedUrl,
    pageUrl: pageData.pageUrl,
    pageTitle: pageData.pageTitle
  });
}

async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Copied!';
    button.classList.add('copied');

    setTimeout(() => {
      button.textContent = 'Copy URL';
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
