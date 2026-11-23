(function(root, factory) {
  const utils = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = utils;
  }

  root.FeedUrlUtils = utils;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function normalizeHttpUrl(value, baseUrl) {
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }

    try {
      const url = baseUrl ? new URL(value, baseUrl) : new URL(value);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return null;
      }

      if (url.username || url.password) {
        return null;
      }

      return url.href;
    } catch (error) {
      return null;
    }
  }

  function expandUrlTemplate(template, context = {}) {
    if (typeof template !== 'string' || !template.trim()) {
      return null;
    }

    const feedUrl = normalizeHttpUrl(context.feedUrl);
    if (context.feedUrl && !feedUrl) {
      return null;
    }

    const pageUrl = normalizeHttpUrl(context.pageUrl);
    if (context.pageUrl && !pageUrl) {
      return null;
    }

    const pageTitle = typeof context.pageTitle === 'string' ? context.pageTitle : '';
    const replacements = {
      '%s': feedUrl || '',
      '%u': pageUrl || '',
      '%t': pageTitle
    };
    try {
      const expanded = template.replace(/%[sut]/g, placeholder => (
        encodeURIComponent(replacements[placeholder])
      ));

      return normalizeHttpUrl(expanded);
    } catch (error) {
      return null;
    }
  }

  function getFeedActionAccessibleName(label, feedTitle, feedUrl) {
    const title = typeof feedTitle === 'string' && feedTitle.trim()
      ? feedTitle.trim()
      : 'Feed';
    const url = typeof feedUrl === 'string' ? feedUrl.trim() : '';
    return `${label} for ${title}${url ? ` (${url})` : ''}`;
  }

  return {
    expandUrlTemplate,
    getFeedActionAccessibleName,
    normalizeHttpUrl
  };
});
