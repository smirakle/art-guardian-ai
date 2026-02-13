/**
 * Builds a URL that navigates to the actual matched content on a platform,
 * using site-scoped search when the source_url is not a real link.
 */
export function buildMatchUrl(
  sourceUrl: string | null,
  sourceDomain: string | null,
  sourceTitle: string | null
): string {
  // If it's already a valid URL, use it directly
  if (sourceUrl && sourceUrl.startsWith('http') && sourceUrl.includes('.') && !sourceUrl.match(/^https?:\/\/[A-Z][a-z]+(\s|$)/)) {
    return sourceUrl;
  }

  const domainRaw = (sourceDomain || '').toLowerCase();
  const domainKey = domainRaw.split(/[\s·]+/)[0].trim();
  const title = sourceTitle || '';
  const encodedTitle = encodeURIComponent(title);

  // Extract subreddit from domain string like "Reddit · r/filmphotography"
  const subredditMatch = (sourceDomain || '').match(/r\/([^\s·,]+)/);
  const subreddit = subredditMatch ? subredditMatch[1] : null;

  // Platform-specific search URLs that deep-link to the matched content
  if (domainKey === 'reddit') {
    return subreddit
      ? `https://www.reddit.com/r/${subreddit}/search/?q=${encodedTitle}`
      : `https://www.reddit.com/search/?q=${encodedTitle}`;
  }
  if (domainKey === 'alamy') {
    return `https://www.alamy.com/search?qt=${encodedTitle}`;
  }
  if (domainKey === 'shutterstock') {
    return `https://www.shutterstock.com/search/${encodedTitle}`;
  }
  if (domainKey === 'gettyimages' || domainKey === 'getty') {
    return `https://www.gettyimages.com/search/2/image?phrase=${encodedTitle}`;
  }
  if (domainKey === 'adobe') {
    return `https://stock.adobe.com/search?k=${encodedTitle}`;
  }
  if (domainKey === 'flickr') {
    return `https://www.flickr.com/search/?text=${encodedTitle}`;
  }
  if (domainKey === 'deviantart') {
    return `https://www.deviantart.com/search?q=${encodedTitle}`;
  }
  if (domainKey === 'pinterest') {
    return `https://www.pinterest.com/search/pins/?q=${encodedTitle}`;
  }
  if (domainKey === 'unsplash') {
    return `https://unsplash.com/s/photos/${encodedTitle}`;
  }
  if (domainKey === 'pexels') {
    return `https://www.pexels.com/search/${encodedTitle}/`;
  }
  if (domainKey === 'artstation') {
    return `https://www.artstation.com/search?query=${encodedTitle}`;
  }
  if (domainKey === 'behance') {
    return `https://www.behance.net/search/projects?search=${encodedTitle}`;
  }

  // Fallback: DuckDuckGo site-scoped search with title
  const domain = domainKey || 'unknown';
  return title
    ? `https://duckduckgo.com/?q=site:${domain}.com+${encodedTitle}`
    : `https://duckduckgo.com/?q=site:${domain}.com`;
}
