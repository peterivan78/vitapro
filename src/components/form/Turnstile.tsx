import Script from 'next/script'

// Cloudflare Turnstile – zobrazí sa len ak je nastavený NEXT_PUBLIC_TURNSTILE_SITE_KEY.
// Widget sám pridá do formulára skryté pole „cf-turnstile-response“.
export function Turnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (!siteKey) return null
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div className="cf-turnstile" data-sitekey={siteKey} data-language="sk" data-theme="light" />
    </>
  )
}
