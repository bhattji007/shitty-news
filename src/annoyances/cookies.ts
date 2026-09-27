export function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]!) : null;
}
export function setCookie(name: string, value: string, days?: number) {
  let s = `${name}=${encodeURIComponent(value)};path=/;SameSite=Lax`;
  if (days != null) s += `;max-age=${Math.round(days * 86400)}`;
  document.cookie = s;
}
export function delCookie(name: string) {
  document.cookie = `${name}=;path=/;max-age=0`;
}
