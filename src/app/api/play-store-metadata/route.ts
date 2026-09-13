import { NextRequest, NextResponse } from 'next/server';

function formatPackageToName(pkg: string): string {
  if (!pkg) return '';
  const parts = pkg.split('.');
  const lastPart = parts[parts.length - 1] || pkg;
  
  // Split camelCase, snake_case, and kebab-case into words
  const words = lastPart
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .trim()
    .split(/\s+/);

  return words
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('id') || searchParams.get('url') || searchParams.get('pkg');

  if (!rawQuery) {
    return NextResponse.json(
      { error: 'Missing package id or url parameter' },
      { status: 400 }
    );
  }

  // Extract package name
  let packageName = rawQuery.trim();
  if (packageName.includes('/apps/testing/')) {
    packageName = packageName.split('/apps/testing/')[1]?.split('?')[0]?.split('#')[0] || '';
  } else if (packageName.includes('id=')) {
    try {
      const u = new URL(packageName);
      packageName = u.searchParams.get('id') || '';
    } catch {
      const match = packageName.match(/id=([a-zA-Z0-9_.]+)/);
      if (match) packageName = match[1];
    }
  }

  const fallbackName = formatPackageToName(packageName);

  if (!packageName) {
    return NextResponse.json(
      { error: 'Could not parse Android package name' },
      { status: 400 }
    );
  }

  try {
    const playStoreUrl = `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageName)}&hl=en`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(playStoreUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const html = await res.text();

      // Extract og:title
      const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/i) ||
                         html.match(/itemprop="name"[^>]*>([^<]+)<\//i);
      let rawTitle = titleMatch ? titleMatch[1] : '';
      // Decode HTML entities & strip Play Store suffix
      rawTitle = rawTitle.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
      const cleanTitle = rawTitle.replace(/\s*-\s*Apps on Google Play$/i, '').trim();

      // Extract og:image (high res app icon)
      const imageMatch = html.match(/property="og:image"\s+content="([^"]+)"/i) ||
                         html.match(/itemprop="image"\s+src="([^"]+)"/i);
      const iconUrl = imageMatch ? imageMatch[1] : '';

      // Extract og:description
      const descMatch = html.match(/property="og:description"\s+content="([^"]+)"/i);
      let description = descMatch ? descMatch[1] : '';
      description = description.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

      return NextResponse.json({
        found: true,
        packageName,
        name: cleanTitle || fallbackName,
        icon: iconUrl || null,
        description: description || null,
        playStoreUrl,
      });
    }
  } catch (err) {
    // If fetching timed out or failed, fall through to fallback
  }

  // Not found on public Play Store (e.g. Closed Testing Track)
  return NextResponse.json({
    found: false,
    packageName,
    name: fallbackName,
    icon: null,
    description: null,
  });
}
