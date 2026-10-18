import { buildTargetUrl, getInitialFirstName } from './urlParams';

/**
 * Back-button redirect ("bounce trap"): if someone presses the browser Back
 * button, they get sent to BACK_REDIRECT_URL instead of leaving the page.
 * Ported from the old static live.html page into the main React flow.
 */
export const BACK_REDIRECT_URL = 'https://lp.divinetemple.online/back-offer';

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
 * Tracking parameters and the first name are recovered when Back is pressed.
 * The destination receives no email parameter.
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
    return buildTargetUrl(baseUrl, { firstName: getInitialFirstName() });
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
