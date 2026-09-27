const IST = 'Asia/Kolkata';

export function timeAgo(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min${m === 1 ? '' : 's'} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h === 1 ? '' : 's'} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

export function istDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', timeZone: IST });
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: IST });
  return `${date}, ${time} IST`;
}

export function istToday(): string {
  const d = new Date();
  return `${d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric', timeZone: IST })} | Updated ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: IST })} IST`;
}

export function catLabel(cat: string): string {
  return cat === 'top' ? 'Top News' : cat.charAt(0).toUpperCase() + cat.slice(1);
}
