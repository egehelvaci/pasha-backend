/** Always return an absolute frontend URL, including for scheme-less host config. */
export function getPaymentReturnUrl(): string {
  const configured = process.env.PRODUCTION_FRONTEND_URL?.trim() || 'http://localhost:3000';
  const absolute = configured.startsWith('//') ? `https:${configured}`
    : /^[a-z][a-z\d+.-]*:\/\//i.test(configured) ? configured : `https://${configured}`;
  const base = new URL(absolute);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) {
    throw new Error('PRODUCTION_FRONTEND_URL geçerli bir HTTP(S) adresi olmalıdır');
  }
  base.search = '';
  base.hash = '';
  base.pathname = `${base.pathname.replace(/\/+$/, '')}/dashboard/odemeler`;
  return base.href;
}
