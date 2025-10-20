// RSS Feed Detector - Feeds Page Script
// Loads and displays discovered feeds with Newsblur subscription links

(async () => {
  const container = document.getElementById('feeds');

  try {
    // Retrieve feeds from session storage
    const { feeds } = await chrome.storage.session.get('feeds');

    // Handle no feeds case
    if (!feeds || feeds.length === 0) {
      container.innerHTML = '<div class="no-feeds">No feeds found on the previous page.</div>';
      return;
    }

    // Clear loading message
    container.innerHTML = '';
    container.classList.remove('loading');

    // Render each feed as a subscription link
    feeds.forEach(feed => {
      const feedDiv = document.createElement('div');
      feedDiv.className = 'feed';

      const link = document.createElement('a');
      link.href = `https://newsblur.com/?url=${encodeURIComponent(feed.href)}`;
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
      container.appendChild(feedDiv);
    });

    // Log success
    console.log(`Rendered ${feeds.length} feed(s)`);
  } catch (error) {
    console.error('Error loading feeds:', error);
    container.innerHTML = '<div class="no-feeds">Error loading feeds. Please try again.</div>';
  }
})();
