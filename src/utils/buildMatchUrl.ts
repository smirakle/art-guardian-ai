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

  // Extract a fallback title from sourceDomain if sourceTitle is empty
  // e.g. "YouTube · Gretchen Wilson" → "Gretchen Wilson"
  let title = sourceTitle || '';
  if (!title && sourceDomain) {
    const parts = sourceDomain.split(/\s*·\s*/);
    if (parts.length > 1) {
      title = parts.slice(1).join(' ').trim();
    }
  }

  // Clean platform suffixes from title for better search results
  title = title.replace(/\s*-\s*(YouTube|Wikipedia|Instagram|TikTok|Facebook|Twitter|Reddit|Pinterest)$/i, '').trim();

  const encodedTitle = encodeURIComponent(title);

  // Extract subreddit from domain string like "Reddit · r/filmphotography"
  const subredditMatch = (sourceDomain || '').match(/r\/([^\s·,]+)/);
  const subreddit = subredditMatch ? subredditMatch[1] : null;

  // Platform-specific search URLs that deep-link to the matched content
  if (domainKey === 'youtube') {
    return `https://www.youtube.com/results?search_query=${encodedTitle}`;
  }
  if (domainKey === 'instagram') {
    const handleMatch = (sourceDomain || '').match(/@?([a-zA-Z0-9._]+)/);
    const handle = handleMatch ? handleMatch[1] : null;
    return handle && handle !== 'instagram'
      ? `https://www.instagram.com/${handle}/`
      : `https://www.instagram.com/explore/tags/${encodedTitle}`;
  }
  if (domainKey === 'tiktok') {
    return `https://www.tiktok.com/search?q=${encodedTitle}`;
  }
  if (domainKey === 'twitter' || domainKey === 'x') {
    return `https://x.com/search?q=${encodedTitle}`;
  }
  if (domainKey === 'reddit') {
    return subreddit
      ? `https://www.reddit.com/r/${subreddit}/search/?q=${encodedTitle}`
      : `https://www.reddit.com/search/?q=${encodedTitle}`;
  }
  if (domainKey === 'wikipedia') {
    return `https://en.wikipedia.org/wiki/Special:Search?search=${encodedTitle}`;
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

  // Fallback: use site-scoped search only if domain looks like a real domain (contains a dot)
  const fullDomain = (sourceDomain || '').trim();
  const searchQuery = title || fullDomain;
  const encodedQuery = encodeURIComponent(searchQuery);

  if (domainKey.includes('.')) {
    // Real domain like "foretheparty.com"
    return `https://duckduckgo.com/?q=site:${domainKey}+${encodedQuery}`;
  }

  // Descriptive name like "Fore the Party" — just do a general search
  return `https://duckduckgo.com/?q=${encodedQuery}`;
}
