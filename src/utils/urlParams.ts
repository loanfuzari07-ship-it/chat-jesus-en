/**
 * Handles preserving incoming UTMs, ad tracking, and query parameters,
 * as well as handling back-navigation redirects to the wait page.
 */

const STORAGE_PARAMS_KEY = 'jc_saved_params';

// Standard tracking and affiliate keys
const TRACKING_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
  'src',
  'sck',
  'xcod',
  'fbclid',
  'gclid',
  'ttclid',
  'msclkid',
  'cid',
  'click_id',
  'subid',
  'subid2',
  'subid3',
  'subid4',
  'subid5',
  'traffic_source',
  'pixel',
  '_fbp',
  '_fbc',
  'email'
];

/**
 * Persists all search parameters on initial load so they are never lost
 * throughout the funnel or across step navigation.
 */
function persistInitialParams(): void {
  if (typeof window === 'undefined') return;
  try {
    const search = new URLSearchParams(window.location.search);
    const stored: Record<string, string> = JSON.parse(
      sessionStorage.getItem(STORAGE_PARAMS_KEY) || localStorage.getItem(STORAGE_PARAMS_KEY) || '{}'
    );

    search.forEach((value, key) => {
      if (value) {
        stored[key] = value;
        try {
          sessionStorage.setItem(key, value);
          localStorage.setItem(key, value);
        } catch {}
      }
    });

    sessionStorage.setItem(STORAGE_PARAMS_KEY, JSON.stringify(stored));
    try {
      localStorage.setItem(STORAGE_PARAMS_KEY, JSON.stringify(stored));
    } catch {}
  } catch {}
}

// Auto-run on load
if (typeof window !== 'undefined') {
  persistInitialParams();
}

export function getQueryParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params: Record<string, string> = {};

  // 1. First retrieve persisted params from storage
  try {
    const stored = JSON.parse(
      sessionStorage.getItem(STORAGE_PARAMS_KEY) || localStorage.getItem(STORAGE_PARAMS_KEY) || '{}'
    );
    Object.entries(stored).forEach(([k, v]) => {
      if (v && typeof v === 'string') params[k] = v;
    });
  } catch {}

  // 2. Current search params take precedence if present
  try {
    const search = new URLSearchParams(window.location.search);
    search.forEach((value, key) => {
      if (value) params[key] = value;
    });
  } catch {}

  return params;
}

export function getInitialFirstName(): string {
  if (typeof window === 'undefined') return '';
  const params = getQueryParams();
  if (params.firstName) return params.firstName;
  if (params.name) return params.name;
  if (params.nome) return params.nome;
  try {
    const stored = sessionStorage.getItem('jc_firstName');
    if (stored) return stored;
  } catch (e) {
    // ignore
  }
  return '';
}

export function saveFirstName(name: string) {
  try {
    sessionStorage.setItem('jc_firstName', name);
  } catch (e) {
    // ignore
  }
}

export function getInitialEmail(): string {
  if (typeof window === 'undefined') return '';
  const params = getQueryParams();
  if (params.email) return params.email;
  try {
    const stored = sessionStorage.getItem('jc_userEmail') || localStorage.getItem('jc_userEmail');
    if (stored) return stored;
  } catch (e) {
    // ignore
  }
  return '';
}

export function saveUserEmail(email: string) {
  try {
    sessionStorage.setItem('jc_userEmail', email);
    localStorage.setItem('jc_userEmail', email);
  } catch (e) {
    // ignore
  }
}

/**
 * Builds the final checkout or target redirect URL, ensuring:
 * 1. All original query parameters (UTMs, subids, src, sck, xcod, etc.) are preserved.
 * 2. Any tracking parameters saved in storage or cookies are carried over.
 * 3. Extra custom parameters (customer.phone, customer.name, etc.) are appended without overwriting existing UTMs.
 */
export function buildTargetUrl(baseUrl: string, extraParams?: Record<string, string>): string {
  if (typeof window === 'undefined') return baseUrl;
  try {
    const url = new URL(baseUrl, window.location.origin);
    
    // 1. Recover saved params from initial landing session
    try {
      const stored = JSON.parse(
        sessionStorage.getItem(STORAGE_PARAMS_KEY) || localStorage.getItem(STORAGE_PARAMS_KEY) || '{}'
      );
      Object.entries(stored).forEach(([k, v]) => {
        if (v && typeof v === 'string') {
          url.searchParams.set(k, v);
        }
      });
    } catch {}

    // 2. Merge with any current window query params
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.forEach((val, key) => {
      if (val) url.searchParams.set(key, val);
    });

    // 3. Check tracking cookies and storage for any missing UTMs / IDs
    try {
      TRACKING_KEYS.forEach(key => {
        if (!url.searchParams.get(key)) {
          const fromStorage = sessionStorage.getItem(key) || localStorage.getItem(key);
          if (fromStorage) {
            url.searchParams.set(key, fromStorage);
          }
        }
      });

      // Also scans localStorage/sessionStorage for any utm_*/subid* key saved
      // throughout the funnel (e.g. by persistInitialParams above).
      try {
        [sessionStorage, localStorage].forEach(storage => {
          for (let i = 0; i < storage.length; i++) {
            const k = storage.key(i);
            if (k && (k.startsWith('utm_') || k.startsWith('subid') || k === 'src' || k === 'sck') && !url.searchParams.get(k)) {
              const val = storage.getItem(k);
              if (val) url.searchParams.set(k, val);
            }
          }
        });
      } catch {}

      if (typeof document !== 'undefined' && document.cookie) {
        document.cookie.split(';').forEach(c => {
          const parts = c.trim().split('=');
          const k = parts[0];
          const v = parts.slice(1).join('=');
          if (k && v && (TRACKING_KEYS.includes(k) || k.startsWith('utm_')) && !url.searchParams.get(k)) {
            url.searchParams.set(k, decodeURIComponent(v));
          }
        });
      }
    } catch {}

    // 4. Merge extra params (like customer.phone, customer.name, etc.)
    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v);
      });
    }

    // 5. Ensure email is always passed if available in session or storage
    if (!url.searchParams.get('email')) {
      const storedEmail = getInitialEmail();
      if (storedEmail) {
        url.searchParams.set('email', storedEmail);
      }
    }

    return url.toString();
  } catch (e) {
    return baseUrl;
  }
}


