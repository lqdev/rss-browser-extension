const assert = require('node:assert/strict');
const test = require('node:test');
const {
  expandUrlTemplate,
  getFeedActionAccessibleName,
  normalizeHttpUrl
} = require('../feed-url-utils.js');

test('normalizes relative feed URLs and rejects non-HTTP protocols', () => {
  assert.equal(
    normalizeHttpUrl('/feed.xml', 'https://example.com/posts/1'),
    'https://example.com/feed.xml'
  );
  assert.equal(normalizeHttpUrl('javascript:alert(1)'), null);
  assert.equal(normalizeHttpUrl('file:///tmp/feed.xml'), null);
  assert.equal(normalizeHttpUrl('not a url'), null);
});

test('expands every supported placeholder with safe encoding', () => {
  const feedUrl = 'https://example.com/feed.xml?source=a&format=rss';
  const pageUrl = 'https://example.com/articles/hello-world?from=test';
  const pageTitle = 'Hello world & friends';
  const result = expandUrlTemplate(
    'https://reader.example/follow?feed=%s&copy=%s&page=%u&title=%t&again=%t',
    { feedUrl, pageUrl, pageTitle }
  );

  assert.equal(
    result,
    'https://reader.example/follow?' +
      `feed=${encodeURIComponent(feedUrl)}` +
      `&copy=${encodeURIComponent(feedUrl)}` +
      `&page=${encodeURIComponent(pageUrl)}` +
      `&title=${encodeURIComponent(pageTitle)}` +
      `&again=${encodeURIComponent(pageTitle)}`
  );
  assert.equal(result.includes(pageTitle), false);
});

test('supports old session data without page context', () => {
  const result = expandUrlTemplate(
    'https://reader.example/follow?intent=follow&feed=%s&url=%u&title=%t',
    { feedUrl: 'https://example.com/feed.xml' }
  );

  assert.equal(
    result,
    'https://reader.example/follow?intent=follow' +
      '&feed=https%3A%2F%2Fexample.com%2Ffeed.xml&url=&title='
  );
});

test('builds the documented follow handoff URL', () => {
  const result = expandUrlTemplate(
    'https://lqdev.github.io/github-post-pwa/share.html' +
      '?intent=follow&feed=%s&url=%u&title=%t',
    {
      feedUrl: 'https://example.com/feed.xml',
      pageUrl: 'https://example.com/',
      pageTitle: 'Example & News'
    }
  );

  assert.equal(
    result,
    'https://lqdev.github.io/github-post-pwa/share.html' +
      '?intent=follow&feed=https%3A%2F%2Fexample.com%2Ffeed.xml' +
      '&url=https%3A%2F%2Fexample.com%2F&title=Example%20%26%20News'
  );
});

test('rejects invalid action URLs and unsafe feed or page URLs', () => {
  assert.equal(
    expandUrlTemplate('javascript:alert(1)?feed=%s', {
      feedUrl: 'https://example.com/feed.xml'
    }),
    null
  );
  assert.equal(
    expandUrlTemplate('https://reader.example/?feed=%s', {
      feedUrl: 'data:text/plain,feed'
    }),
    null
  );
  assert.equal(
    expandUrlTemplate('https://reader.example/?page=%u', {
      feedUrl: 'https://example.com/feed.xml',
      pageUrl: 'javascript:alert(1)'
    }),
    null
  );
});

test('rejects HTTP URLs with embedded credentials', () => {
  assert.equal(
    normalizeHttpUrl('https://user:secret@example.com/feed.xml'),
    null
  );
  assert.equal(
    expandUrlTemplate('https://user@example.com/?feed=%s', {
      feedUrl: 'https://example.com/feed.xml'
    }),
    null
  );
});

test('disables only template actions that cannot encode malformed titles', () => {
  const context = {
    feedUrl: 'https://example.com/feed.xml',
    pageUrl: 'https://example.com/',
    pageTitle: 'Invalid \uD800 title'
  };

  assert.equal(
    expandUrlTemplate('https://reader.example/?title=%t', context),
    null
  );
  assert.equal(
    expandUrlTemplate('https://reader.example/?feed=%s', context),
    'https://reader.example/?feed=https%3A%2F%2Fexample.com%2Ffeed.xml'
  );
});

test('includes feed identity in action accessible names', () => {
  assert.equal(
    getFeedActionAccessibleName(
      'Subscribe in NewsBlur',
      'Example News',
      'https://example.com/feed.xml'
    ),
    'Subscribe in NewsBlur for Example News ' +
      '(https://example.com/feed.xml)'
  );
  assert.equal(
    getFeedActionAccessibleName(
      'Subscribe in NewsBlur',
      '',
      'https://other.example/feed.xml'
    ),
    'Subscribe in NewsBlur for Feed ' +
      '(https://other.example/feed.xml)'
  );
});
