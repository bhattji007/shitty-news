// Ask source CDNs for a ~640px rendition instead of the 1200px+ original.
// Only the URL changes; the image is the same picture. Unknown hosts pass through untouched.
export function downsizeImage(url: string | null, width = 640): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === 'th-i.thgim.com') {
      // /alternates/LANDSCAPE_1200/x.jpg → /alternates/LANDSCAPE_615/x.jpg (verified 2026-09-27)
      return u.toString().replace(/\/alternates\/[A-Z]+_\d+\//, '/alternates/LANDSCAPE_615/');
    }
    if (u.hostname === 'images.indianexpress.com') {
      u.searchParams.set('w', String(width));
      return u.toString();
    }
    if (u.hostname.endsWith('ndtvimg.com')) {
      // Keep their un-encoded "im=" syntax intact; URLSearchParams would percent-encode it.
      return url.replace(/width=\d+,height=\d+/, `width=${width},height=${Math.round((width * 9) / 16)}`);
    }
    return url;
  } catch {
    return url;
  }
}
