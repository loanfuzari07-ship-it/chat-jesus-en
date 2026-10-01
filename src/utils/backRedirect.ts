import { getInitialEmail, getInitialFirstName } from './urlParams';

/**
 * Back-button redirect ("bounce trap"): if someone presses the browser Back
 * button, they get sent to BACK_REDIRECT_URL instead of leaving the page.
 * Ported from the old static live.html page into the main React flow.
 */
export const BACK_REDIRECT_URL = 'https://lp.divinetemple.online/back-offer.html';

declare global {
  interface Window {
    __goingToCheckout?: boolean;
  }
}

let installed = false;

/**
 * Installs the back-redirect trap once per page load. Call this on mount of
 * the top-level app component.
 *
 * Checkout navigation must set `window.__goingToCheckout = true` right before
 * sending the user to the payment page — otherwise pressing Back while mid
 * checkout would bounce them here instead of back to the form they were
 * filling in.
 *
 * The destination's query string (email, firstName, UTMs) is built FRESH at
 * the moment Back is pressed, not once at install time — the person usually
 * types their email well after this installs, so capturing it early would
 * send it through empty. The destination page (e.g. back-offer.html) expects
 * `email` and `firstName` as plain query params and pre-fills its own form
 * from them.
 */
export function installBackRedirect(url: string = BACK_REDIRECT_URL): void {
  if (typeof window === 'undefined' || installed) return;
  if (!url || url.includes('REPLACE-WITH-YOUR-REDIRECT-URL')) {
    // Placeholder still in place — do not trap Back with a dead/placeholder URL.
    // eslint-disable-next-line no-console
    console.warn('[backRedirect] BACK_REDIRECT_URL is still a placeholder — back-redirect not installed.');
    return;
  }
  installed = true;

  const baseUrl = url.trim();

  function buildTarget(): string {
    const params = new URLSearchParams(window.location.search);

    // The real (non-disguised) email and first name, picked up from wherever
    // the funnel last saved them (current URL, or sessionStorage/localStorage
    // via getInitialEmail/getInitialFirstName) — not the disguised version
    // used only for the checkout page's pre-filled field.
    const email = getInitialEmail();
    if (email && !params.get('email')) params.set('email', email);

    const firstName = getInitialFirstName();
    if (firstName && !params.get('firstName')) params.set('firstName', firstName);

    const query = params.toString();
    return baseUrl + (query ? (baseUrl.includes('?') ? '&' : '?') + query : '');
  }

  history.pushState({}, '', location.href);
  history.pushState({}, '', location.href);
  history.pushState({}, '', location.href);

  window.addEventListener('popstate', () => {
    // Intentional exit to checkout: don't hijack Back. Without this, anyone
    // who presses Back while filling out the checkout would land on the
    // redirect page instead of going back to the checkout they were on.
    if (window.__goingToCheckout) return;
    const target = buildTarget();
    setTimeout(() => {
      location.href = target;
    }, 1);
  });
}
