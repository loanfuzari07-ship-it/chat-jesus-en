/**
 * Preloads the VTurb video player assets used by the "live" stage.
 *
 * These used to be static <link rel="preload"> tags in index.html, loaded on
 * every single visit — including the very first chat screen, which is the
 * page with the biggest ad-click drop-off (click → page view). The video
 * itself only appears several chat steps later, so preloading it that early
 * competed for bandwidth with the chat UI on slow connections, for no
 * benefit (most visitors never even reach the live step).
 *
 * Call this instead right when the person is about to transition into the
 * live stage (e.g. on the "OPEN THE DOOR OF BLESSING" click, a second or two
 * before the stage actually mounts) — late enough to not tax the first
 * paint, early enough that the player still gets a real head start.
 */
let preloaded = false;

export function preloadVTurbAssets(): void {
  if (typeof document === 'undefined' || preloaded) return;
  preloaded = true;

  const assets: Array<{ href: string; as: string }> = [
    { href: 'https://scripts.converteai.net/15c55340-cc1a-4abb-9c8a-da5918cd9642/players/6abe9e98fb23b657fbd5be68/v4/player.js', as: 'script' },
    { href: 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js', as: 'script' },
    { href: 'https://cdn.converteai.net/15c55340-cc1a-4abb-9c8a-da5918cd9642/6abe9e56c889864e4c70922c/main.m3u8', as: 'fetch' }
  ];

  for (const { href, as } of assets) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
}
