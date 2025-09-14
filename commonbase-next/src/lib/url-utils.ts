// URL validation and title fetching utilities

export function isValidUrl(text: string): boolean {
  try {
    const url = new URL(text.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s\n]+/gi;
  const matches = text.match(urlRegex);
  return matches ? matches.filter(url => isValidUrl(url)) : [];
}

export async function fetchUrlTitle(url: string): Promise<string | null> {
  try {
    const response = await fetch('/api/fetch-url-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.title || null;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch URL title:', error);
    return null;
  }
}