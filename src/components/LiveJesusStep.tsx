import React, { useState, useEffect, useRef } from 'react';
import {
  LIVE_COMMENTS,
  LIVE_OFFERINGS,
  LiveCommenter
} from '../data/liveChatData';
import {
  getInitialFirstName,
  getInitialEmail,
  saveUserEmail,
  buildTargetUrl
} from '../utils/urlParams';

interface LiveJesusStepProps {
  userName?: string;
  onBackToChat?: () => void;
}

interface CommentItem {
  id: string;
  name: string;
  avatar: string;
  text: string;
  timestamp: number;
}

const OFFERS_DELAY_SEC = 510; // 8 min 30 s

// Checkout links by donation amount (DigitalGoat).
const OFFER_CHECKOUT_URLS: Record<number, string> = {
  9: 'https://pay.digitalgoat.com.br/checkout/cmupt5qgu013m01on5igkgplm?offer=KJEHFI1',
  25: 'https://pay.digitalgoat.com.br/checkout/cmupt5qgu013m01on5igkgplm?offer=Y8XY8LP',
  50: 'https://pay.digitalgoat.com.br/checkout/cmupt5qgu013m01on5igkgplm?offer=8BMYY5S',
  70: 'https://pay.digitalgoat.com.br/checkout/cmupt5qgu013m01on5igkgplm?offer=A137PVC',
  200: 'https://pay.digitalgoat.com.br/checkout/cmupt5qgu013m01on5igkgplm?offer=NCZ8MQK'
};

// Intentional disguise: swaps one character of the typed email so the field
// that arrives pre-filled at checkout looks valid but is wrong on purpose
// (e.g. test@gmail.com -> taste@gmail.com). The person must notice and
// correct it before paying — kept on purpose as a human-verification/
// anti-bot measure. Do not remove.
const DISGUISE_MAP: [RegExp, string][] = [
  [/l/, 'I'], [/i/, 'l'], [/a/, 'e'], [/e/, 'a'], [/p/, 'q'],
  [/q/, 'p'], [/b/, 'p'], [/u/, 'v'], [/v/, 'u'], [/o/, '0']
];

function disguiseEmail(email: string): string {
  const at = email.lastIndexOf('@');
  if (at < 2) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  for (let i = 1; i < local.length - 1; i++) {
    const ch = local[i];
    for (const [pattern, replacement] of DISGUISE_MAP) {
      if (pattern.test(ch)) {
        return local.slice(0, i) + replacement + local.slice(i + 1) + domain;
      }
    }
  }
  if (local.length >= 4) {
    const o = Math.floor(local.length / 2) - 1;
    return local.slice(0, o) + local[o + 1] + local[o] + local.slice(o + 2) + domain;
  }
  return email;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// window.trck comes from SpiderTrack's t.js (loaded in index.html's <head>).
declare global {
  interface Window {
    trck?: {
      track: (name: string, params?: Record<string, unknown>) => void;
      decorate: (url: string) => string;
      identify: (data: Record<string, unknown>) => void;
      getId?: () => string | null;
    };
    __goingToCheckout?: boolean;
  }
}

export const LiveJesusStep: React.FC<LiveJesusStepProps> = ({
  userName: propUserName
}) => {
  const [firstName] = useState<string>(() => (propUserName || getInitialFirstName() || '').trim());
  const [likes, setLikes] = useState<number>(4823);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(312);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [userCommentText, setUserCommentText] = useState<string>('');
  const [showCommentInput, setShowCommentInput] = useState<boolean>(false);
  const [viewers, setViewers] = useState<number>(1286);

  // Offers revelation state (ONLY via timer or vturb event or ?ver=1 / ?debug=1 in URL)
  const [isRevealed, setIsRevealed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('ver') === '1' || p.get('debug') === '1';
    }
    return false;
  });

  // Step 1: email state
  const [email, setEmail] = useState<string>(() => getInitialEmail());
  const [emailError, setEmailError] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Modal for all offerings
  const [showAllOfferings, setShowAllOfferings] = useState<boolean>(false);

  // Time display (e.g. "Today at 5:49 PM")
  const [postTime, setPostTime] = useState<string>('');

  const poolRef = useRef<LiveCommenter[]>([...LIVE_COMMENTS]);
  const poolIdxRef = useRef<number>(0);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Post time
  useEffect(() => {
    const d = new Date();
    setPostTime(`Today at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`);
  }, []);

  // Fluctuate viewers count realistically like Facebook Live
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + delta;
        return next < 1200 ? 1286 : next;
      });
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Email input handler
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    saveUserEmail(value);
    if (emailError) setEmailError('');
  };

  // Seed initial comments
  useEffect(() => {
    const list = [...LIVE_COMMENTS];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    poolRef.current = list;

    const now = Date.now();
    const initial: CommentItem[] = [
      {
        id: 'c-0',
        name: list[0].name,
        avatar: list[0].avatar,
        text: list[0].text,
        timestamp: now - 52000
      },
      {
        id: 'c-1',
        name: list[1].name,
        avatar: list[1].avatar,
        text: list[1].text,
        timestamp: now - 35000
      },
      {
        id: 'c-2',
        name: list[2].name,
        avatar: list[2].avatar,
        text: list[2].text,
        timestamp: now - 18000
      }
    ];
    poolIdxRef.current = 3;
    setComments(initial);
  }, []);

  // Comment stream before pitch
  useEffect(() => {
    if (isRevealed) return; // Completely stop when revealed

    const interval = setInterval(() => {
      if (poolIdxRef.current >= poolRef.current.length) {
        poolIdxRef.current = 0;
      }
      const person = poolRef.current[poolIdxRef.current++];
      if (!person) return;

      const newC: CommentItem = {
        id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: person.name,
        avatar: person.avatar,
        text: person.text,
        timestamp: Date.now()
      };

      setComments((prev) => {
        const next = [...prev, newC];
        if (next.length > 9) return next.slice(next.length - 9);
        return next;
      });

      setCommentCount((prev) => prev + 1);
    }, 6000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [isRevealed]);

  // Auto-scroll comments to bottom
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [comments]);

  // Timer & VTurb message sync for reveal (7 minutes 37 seconds = 457s)
  useEffect(() => {
    if (isRevealed) return;

    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, OFFERS_DELAY_SEC * 1000);

    const handleMsg = (e: MessageEvent) => {
      try {
        let parsed = e.data;
        if (typeof parsed === 'string' && parsed.includes('smartplayer')) {
          parsed = JSON.parse(parsed);
        }
        if (parsed && typeof parsed === 'object') {
          if (parsed.event === 'timeupdate' && typeof parsed.currentTime === 'number' && parsed.currentTime >= OFFERS_DELAY_SEC) {
            setIsRevealed(true);
          }
          if (parsed.event === 'ended') {
            setIsRevealed(true);
          }
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('message', handleMsg);

    // Also check direct video element / smartplayer instance if available
    const pollInterval = setInterval(() => {
      try {
        const vturb = document.getElementById('vid-6abe9e98fb23b657fbd5be68');
        if (vturb) {
          const video = vturb.querySelector('video') || (vturb.shadowRoot && vturb.shadowRoot.querySelector('video'));
          if (video && typeof video.currentTime === 'number' && video.currentTime >= OFFERS_DELAY_SEC) {
            setIsRevealed(true);
          }
        }
      } catch {
        // ignore
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(pollInterval);
      window.removeEventListener('message', handleMsg);
    };
  }, [isRevealed]);

  // Inject VTurb player script when component mounts
  useEffect(() => {
    // Remove any previous instances to allow fresh execution
    const prevPlayerScript = document.getElementById('vturb-script-v4');
    if (prevPlayerScript) prevPlayerScript.remove();
    const prevSmart = document.getElementById('vturb-smartplayer-js');
    if (prevSmart) prevSmart.remove();

    const s = document.createElement('script');
    s.id = 'vturb-script-v4';
    s.src = 'https://scripts.converteai.net/15c55340-cc1a-4abb-9c8a-da5918cd9642/players/6abe9e98fb23b657fbd5be68/v4/player.js';
    s.async = true;
    document.head.appendChild(s);

    return () => {
      const sc = document.getElementById('vturb-script-v4');
      if (sc) sc.remove();
    };
  }, []);

  // Prevent VTurb Netflix loader from getting stuck at 99%
  useEffect(() => {
    const checkLoader = setInterval(() => {
      const loadingWrap = document.querySelector('.vt-loading-wrapper') as HTMLElement | null;
      if (loadingWrap) {
        loadingWrap.style.pointerEvents = 'none';
        const pct = loadingWrap.querySelector('.vt-loading-percentage');
        if (pct && (pct.textContent === '99%' || pct.textContent === '100%')) {
          loadingWrap.style.transition = 'opacity 0.3s ease';
          loadingWrap.style.opacity = '0';
          setTimeout(() => {
            if (loadingWrap && loadingWrap.parentNode) {
              loadingWrap.remove();
            }
          }, 300);
        }
      }
    }, 100);

    const maxTimeout = setTimeout(() => {
      const loadingWrap = document.querySelector('.vt-loading-wrapper') as HTMLElement | null;
      if (loadingWrap) {
        loadingWrap.remove();
      }
    }, 2500);

    return () => {
      clearInterval(checkLoader);
      clearTimeout(maxTimeout);
    };
  }, []);

  const handlePlayerAreaClick = () => {
    const vturb = document.getElementById('vid-6abe9e98fb23b657fbd5be68');
    if (vturb) {
      const v = vturb.querySelector('video') || (vturb.shadowRoot && vturb.shadowRoot.querySelector('video'));
      if (v && v.paused) {
        v.play().catch(() => {});
      }
      if ((vturb as any).play) {
        try {
          (vturb as any).play();
        } catch {
          // ignore
        }
      }
    }
  };

  // Format relative time (ex: "Just now", "18s", "2m")
  const formatTimeAgo = (ts: number): string => {
    const sec = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    if (sec < 10) return 'Just now';
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h`;
  };

  // Like button
  const toggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikes((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikes((prev) => prev + 1);
    }
  };

  // Share button
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Jesus Official - Live Stream', url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Post user comment
  const handlePostUserComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = userCommentText.trim();
    if (!trimmed) return;

    const userComment: CommentItem = {
      id: `user-${Date.now()}`,
      name: firstName || 'You',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces&q=80',
      text: trimmed,
      timestamp: Date.now()
    };

    setComments((prev) => [...prev, userComment]);
    setCommentCount((prev) => prev + 1);
    setUserCommentText('');
    setShowCommentInput(false);
  };

  // Handle Offer Checkout Click: validates the email, fires SpiderTrack's
  // InitiateCheckout and sends to the (Wiapy/DigitalGoat) checkout link,
  // already decorated. A/B test: the email is NOT passed to the checkout
  // link anymore — the lead has to type it again at DigitalGoat's checkout.
  // SpiderTrack's own identify() call still uses the real, correct email
  // typed here so purchase matching stays accurate regardless.
  const handleSelectOffer = (value: number) => {
    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setEmailError('Please enter your email to receive the details of your donation.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      emailInputRef.current?.focus();
      return;
    }

    setEmailError('');
    saveUserEmail(trimmedEmail);

    // Checkout link according to the chosen amount
    const checkoutBase = OFFER_CHECKOUT_URLS[value] || OFFER_CHECKOUT_URLS[50];

    let targetUrl = buildTargetUrl(checkoutBase, {
      name: firstName || '',
      first_name: firstName || '',
      'customer.name': firstName || ''
    });

    // SpiderTrack: identifies the visitor by the REAL email typed (so it can be
    // matched to the purchase later via webhook) and decorates the link with
    // the tracking id. InitiateCheckout is NOT fired here on purpose — the
    // DigitalGoat checkout page fires its own IC, so firing it here too would
    // double-count one checkout click as two InitiateCheckout events.
    try {
      if (window.trck) {
        window.trck.identify({ email: trimmedEmail });
        targetUrl = window.trck.decorate(targetUrl);
      }
    } catch {
      // tracking must never block checkout
    }

    // Tell the back-redirect trap this exit is intentional, so pressing Back
    // mid-checkout doesn't bounce the person into the redirect page.
    window.__goingToCheckout = true;

    window.location.href = targetUrl;
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#050505] font-sans antialiased m-0 p-0 selection:bg-blue-200">
      {/* FACEBOOK TOP HEADER */}
      <header className="bg-white border-b border-[#dadde1] sticky top-0 z-30 h-14 px-3.5 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Menu"
            className="p-1 border-none bg-transparent cursor-pointer flex flex-col gap-[5px]"
          >
            <span className="block w-[22px] h-[2.5px] bg-[#050505] rounded-[2px]" />
            <span className="block w-[22px] h-[2.5px] bg-[#050505] rounded-[2px]" />
            <span className="block w-[22px] h-[2.5px] bg-[#050505] rounded-[2px]" />
          </button>
          <span className="text-[#0866ff] font-bold text-[27px] tracking-[-0.5px] select-none">
            facebook
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            className="w-10 h-10 rounded-full bg-[#e4e6eb] border-none flex items-center justify-center cursor-pointer hover:bg-[#d8dadf] transition-colors"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                fill="#050505"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* FEED CONTAINER */}
      <main className="max-w-[500px] mx-auto py-3 px-2 pb-16">
        <article className="bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden border border-[#dadde1]/60">
          {/* POST HEADER (.p-top) */}
          <div className="flex items-center gap-2.5 px-3.5 py-3">
            <img
              src="/images/hostAvatar2.webp"
              alt="Jesus Official"
              width={42}
              height={42}
              className="w-[42px] h-[42px] rounded-full object-cover shrink-0 ring-1 ring-black/10"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[15px] flex items-center gap-1.5 leading-tight">
                <span>Jesus Official</span>
                <svg
                  className="shrink-0"
                  viewBox="0 0 12 12"
                  width="14"
                  height="14"
                  aria-label="Verified"
                >
                  <path
                    fill="#1877F2"
                    d="M6 0l1.5 1.2 1.9-.2.6 1.8 1.6 1L11 6l.6 1.9-1.6 1-.6 1.8-1.9-.2L6 12l-1.5-1.2-1.9.2-.6-1.8-1.6-1L1 6 .4 4.1l1.6-1L2.6 1l1.9.2z"
                  />
                  <path fill="#fff" d="M5.3 8.2L3 5.9l.9-.9 1.4 1.4 3-3 .9.9z" />
                </svg>
              </div>
              <div className="text-[12px] text-[#65676b] mt-[1px] flex items-center gap-1">
                <span>{postTime || 'Today'}</span>
                <span>·</span>
                <span title="Public">🌐</span>
              </div>
            </div>
            <button
              type="button"
              aria-label="More options"
              className="text-[#65676b] text-[20px] px-1 hover:bg-[#f2f2f2] rounded-full transition-colors border-none bg-transparent cursor-pointer select-none"
            >
              ⋯
            </button>
          </div>

          {/* POST TITLE (.p-title) */}
          <div className="px-3.5 pb-2.5 text-[14.5px] sm:text-[15px] font-semibold leading-[1.35] text-[#050505]">
            <span>
              {firstName ? `${firstName}, ` : ''}you opened the door. Here is the word I prepared for you. Listen closely.
            </span>
          </div>

          {/* STREAM STATUS BAR (LIVE & AUDIENCE COUNT) */}
          <div className="flex items-center justify-between px-3.5 py-2 bg-[#f7f8fa] border-y border-[#e4e6eb] text-[13px]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-[#e41e3f] text-white text-[11px] font-bold px-2 py-0.5 rounded-[3px] uppercase tracking-wide shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
              <span className="flex items-center gap-1.5 text-[#050505] font-semibold text-[13px]">
                <svg viewBox="0 0 20 20" width="15" height="15" fill="#65676b" className="shrink-0">
                  <path d="M10 4.5C4.5 4.5 0 10 0 10s4.5 5.5 10 5.5 10-5.5 10-5.5-4.5-5.5-10-5.5zm0 9a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/>
                </svg>
                <span>{viewers.toLocaleString('en-US')} watching now</span>
              </span>
            </div>
            <span className="text-[12px] text-[#65676b] font-medium hidden sm:inline-block">
              Live broadcast
            </span>
          </div>

          {/* PLAYER CONTAINER (.player-wrap) */}
          <div
            className="relative bg-black w-full overflow-hidden cursor-pointer"
            onClick={handlePlayerAreaClick}
          >
            <style>{`
              .vt-loading-wrapper {
                pointer-events: none !important;
              }
            `}</style>

            {/* VTurb Smartplayer Web Component with 178.05% vertical aspect ratio */}
            <div
              className="w-full"
              dangerouslySetInnerHTML={{
                __html: `
                  <vturb-smartplayer id="vid-6abe9e98fb23b657fbd5be68" style="display: block; margin: 0 auto; width: 100%; max-width: 400px;">
                    <div class="vturb-player-placeholder" style="position: relative; width: 100%; padding: 178.05555555555554% 0 0; z-index: 0; background-color: black;"></div>
                  </vturb-smartplayer>
                `
              }}
            />
          </div>

          {/* BEFORE REVEAL: STATS + FACEBOOK ACTIONS (LIKE, COMMENT, SHARE) + LIVE CHAT */}
          {!isRevealed && (
            <>
              {/* POST STATS ROW (.p-stats) - STRICTLY SINGLE LINE */}
              <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11.5px] xs:text-[12px] sm:text-[13px] text-[#65676b] border-b border-[#dadde1] select-none whitespace-nowrap overflow-hidden">
                <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                  <div className="flex items-center -space-x-1.5">
                    {/* Facebook Like Circle */}
                    <span className="w-[18px] h-[18px] rounded-full bg-[#1877f2] flex items-center justify-center text-white ring-2 ring-white z-3">
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="white">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 11H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3v-11z" />
                      </svg>
                    </span>
                    {/* Facebook Love Circle */}
                    <span className="w-[18px] h-[18px] rounded-full bg-[#fa3e3e] flex items-center justify-center text-white ring-2 ring-white z-2">
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="white">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </span>
                    {/* Facebook Pray Circle */}
                    <span className="w-[18px] h-[18px] rounded-full bg-[#f7b125] flex items-center justify-center text-white ring-2 ring-white z-1 text-[8px]">
                      🙏
                    </span>
                  </div>
                  <b className="font-semibold text-[#050505] ml-1">{likes.toLocaleString('en-US')}</b>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-right whitespace-nowrap ml-auto">
                  <span>{commentCount} comments</span>
                  <span>·</span>
                  <span>2.1K shares</span>
                </div>
              </div>

              {/* EXACT FACEBOOK ACTION BUTTONS (NO EMOJIS, AUTHENTIC SVG ICONS) */}
              <div className="flex items-center border-b border-[#dadde1] mx-2 py-0.5">
                {/* LIKE */}
                <button
                  type="button"
                  onClick={toggleLike}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[13.5px] font-semibold rounded-[4px] hover:bg-[#f2f2f2] transition-colors cursor-pointer select-none border-none bg-transparent font-inherit ${
                    isLiked ? 'text-[#1877f2]' : 'text-[#65676b]'
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill={isLiked ? '#1877f2' : 'none'}
                    stroke={isLiked ? '#1877f2' : '#65676b'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>

                {/* COMMENT */}
                <button
                  type="button"
                  onClick={() => setShowCommentInput(!showCommentInput)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[13.5px] font-semibold text-[#65676b] rounded-[4px] hover:bg-[#f2f2f2] transition-colors cursor-pointer select-none border-none bg-transparent font-inherit"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="#65676b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span>Comment</span>
                </button>

                {/* SHARE */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[13.5px] font-semibold text-[#65676b] rounded-[4px] hover:bg-[#f2f2f2] transition-colors cursor-pointer select-none border-none bg-transparent font-inherit"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="#65676b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>

              {/* LIVE COMMENTS FEED (.chat) */}
              <div
                ref={chatBoxRef}
                className="px-3.5 pt-2.5 pb-2 max-h-[220px] overflow-y-auto space-y-2.5"
              >
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2 animate-in fade-in duration-200">
                    <img
                      src={c.avatar}
                      alt=""
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover shrink-0 bg-[#ddd]"
                    />
                    <div className="bg-[#f0f2f5] rounded-[16px] px-3 py-[7px] max-w-[85%]">
                      <div className="font-semibold text-[13px] text-[#050505] leading-tight">
                        {c.name}
                      </div>
                      <div className="text-[13.5px] text-[#050505] leading-[1.3] mt-[1px] break-words">
                        {c.text}
                      </div>
                      <div className="text-[11px] text-[#65676b] mt-[3px]">
                        {formatTimeAgo(c.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* WRITE COMMENT (.c-write) */}
              {showCommentInput && (
                <form
                  onSubmit={handlePostUserComment}
                  className="flex items-center gap-2 px-3.5 pt-1.5 pb-3 border-t border-[#f0f2f5]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#e4e6eb] shrink-0" />
                  <div className="flex-1 bg-[#f0f2f5] rounded-[18px] flex items-center px-1.5 pl-3.5">
                    <input
                      type="text"
                      value={userCommentText}
                      onChange={(e) => setUserCommentText(e.target.value)}
                      placeholder="Write a comment…"
                      maxLength={120}
                      className="flex-1 border-none bg-transparent outline-none text-[14px] py-[9px] font-inherit text-[#050505]"
                    />
                    <button
                      type="submit"
                      disabled={!userCommentText.trim()}
                      className="text-[#0866ff] text-[15px] font-bold px-2.5 cursor-pointer bg-none border-none disabled:opacity-40"
                    >
                      Post
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* OFFERS SECTION: ONCE PITCH REVEALS, HIDE COMMENTS & STATS COMPLETELY, SHOW ONLY STEP 1, STEP 2 & RECENT DONATIONS */}
          {isRevealed && (
            <section className="p-3.5 pt-4 animate-in fade-in duration-300">
              {/* STEP 1: EMAIL */}
              <div className="flex items-center gap-3 p-3 bg-[#f7f8fa] border border-[#dddfe2] rounded-[10px] mb-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4a017] to-[#f4c534] text-white flex items-center justify-center font-extrabold text-[18px] shrink-0 shadow-[0_2px_6px_rgba(212,160,23,0.35)]">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-[#d4a017] tracking-[1.3px] uppercase mb-0.5">
                    Step 1
                  </div>
                  <div className="text-[14px] sm:text-[15px] font-bold text-[#050505] leading-[1.3]">
                    ✉️ Enter your email to receive the details of your donation and blessings
                  </div>
                </div>
              </div>

              {/* Email Input Box */}
              <div
                className={`bg-[#f7f8fa] border rounded-[10px] p-3.5 mb-4 transition-all ${
                  isShaking ? 'animate-[shake_0.45s_ease] border-[#f02849] ring-2 ring-red-200' : 'border-[#dddfe2]'
                }`}
              >
                <label
                  htmlFor="userEmail"
                  className="block text-[14px] font-semibold text-[#050505] mb-2"
                >
                  Your email:
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  id="userEmail"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  className="w-full p-3 border border-[#ccd0d5] rounded-[8px] text-[16px] outline-none font-inherit focus:border-[#0866ff] focus:ring-2 focus:ring-blue-100 bg-white"
                />
                {emailError && (
                  <p className="text-[#f02849] text-[12px] font-semibold mt-1.5">
                    {emailError}
                  </p>
                )}
              </div>

              {/* STEP 2: CHOOSE AMOUNT */}
              <div className="flex items-center gap-3 p-3 bg-[#f7f8fa] border border-[#dddfe2] rounded-[10px] mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4a017] to-[#f4c534] text-white flex items-center justify-center font-extrabold text-[18px] shrink-0 shadow-[0_2px_6px_rgba(212,160,23,0.35)]">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-[#d4a017] tracking-[1.3px] uppercase mb-0.5">
                    Step 2
                  </div>
                  <div className="text-[14px] sm:text-[15px] font-bold text-[#050505] leading-[1.3]">
                    🤍 Choose the value of your donation
                  </div>
                </div>
              </div>

              {/* 5 ROWS: $50 FIRST (HIGHLIGHTED IN GOLD WITH "MOST CHOSEN" TAG), THEN 70, 25, 200, 9 */}
              <div className="space-y-2.5 mb-4">
                {/* 1. $50 - MOST CHOSEN (Gold highlight at the top) */}
                <div
                  onClick={() => handleSelectOffer(50)}
                  className="relative bg-gradient-to-r from-[#fffef8] to-[#fff9e6] border-2 border-[#f7b928] rounded-[12px] px-4 py-3.5 shadow-[0_0_0_1px_#f7b928,0_4px_12px_rgba(247,185,40,0.25)] cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between"
                >
                  <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 bg-[#f7b928] text-black text-[11px] font-extrabold px-3 py-0.5 rounded-full whitespace-nowrap shadow-xs uppercase tracking-wider">
                    ⭐ MOST CHOSEN
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold text-[#b07800]/80 tracking-[1px] uppercase mb-0.5">
                      Send Offer
                    </div>
                    <div className="font-extrabold text-[22px] text-[#b07800] tracking-tight leading-none">
                      $50
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOffer(50);
                    }}
                    className="text-[#b07800] font-extrabold text-[14px] cursor-pointer bg-transparent border-none"
                  >
                    CHOOSE &rarr;
                  </button>
                </div>

                {/* 2. $70 */}
                <div
                  onClick={() => handleSelectOffer(70)}
                  className="bg-white border border-[#e4e6eb] hover:border-[#0866ff] rounded-[12px] px-4 py-3.5 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="text-[10.5px] font-bold text-[#8a8d91] tracking-[1px] uppercase mb-0.5">
                      Send Offer
                    </div>
                    <div className="font-bold text-[20px] text-[#050505] leading-none">
                      $70
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOffer(70);
                    }}
                    className="text-[#0866ff] font-bold text-[14px] cursor-pointer bg-transparent border-none"
                  >
                    CHOOSE &rarr;
                  </button>
                </div>

                {/* 3. $25 */}
                <div
                  onClick={() => handleSelectOffer(25)}
                  className="bg-white border border-[#e4e6eb] hover:border-[#0866ff] rounded-[12px] px-4 py-3.5 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="text-[10.5px] font-bold text-[#8a8d91] tracking-[1px] uppercase mb-0.5">
                      Send Offer
                    </div>
                    <div className="font-bold text-[20px] text-[#050505] leading-none">
                      $25
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOffer(25);
                    }}
                    className="text-[#0866ff] font-bold text-[14px] cursor-pointer bg-transparent border-none"
                  >
                    CHOOSE &rarr;
                  </button>
                </div>

                {/* 4. $200 */}
                <div
                  onClick={() => handleSelectOffer(200)}
                  className="bg-white border border-[#e4e6eb] hover:border-[#0866ff] rounded-[12px] px-4 py-3.5 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="text-[10.5px] font-bold text-[#8a8d91] tracking-[1px] uppercase mb-0.5">
                      Send Offer
                    </div>
                    <div className="font-bold text-[20px] text-[#050505] leading-none">
                      $200
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOffer(200);
                    }}
                    className="text-[#0866ff] font-bold text-[14px] cursor-pointer bg-transparent border-none"
                  >
                    CHOOSE &rarr;
                  </button>
                </div>

                {/* 5. $9 */}
                <div
                  onClick={() => handleSelectOffer(9)}
                  className="bg-white border border-[#e4e6eb] hover:border-[#0866ff] rounded-[12px] px-4 py-3.5 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="text-[10.5px] font-bold text-[#8a8d91] tracking-[1px] uppercase mb-0.5">
                      Send Offer
                    </div>
                    <div className="font-bold text-[20px] text-[#050505] leading-none">
                      $9
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOffer(9);
                    }}
                    className="text-[#0866ff] font-bold text-[14px] cursor-pointer bg-transparent border-none"
                  >
                    CHOOSE &rarr;
                  </button>
                </div>
              </div>

              {/* FOOTER GUARANTEE */}
              <p className="text-center text-[12px] text-[#65676b] my-2">
                🔒 Secure checkout · 60-day guarantee
              </p>

              {/* RECENT DONATIONS WALL (.sup) */}
              <div className="border-t-[8px] border-[#f0f2f5] -mx-3.5 px-3.5 pt-4 pb-2 mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[16px] text-[#050505]">
                    💛 Recent Donations
                  </span>
                  <span className="inline-flex items-center gap-1.5 ml-auto bg-[#e7f8ee] text-[#177d3e] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-[#1ea75a] animate-ping" />
                    LIVE
                  </span>
                </div>
                <div className="text-[13px] text-[#65676b] mb-3">
                  People honoring their faith right now
                </div>

                <div className="divide-y divide-[#eef0f2]">
                  {LIVE_OFFERINGS.slice(0, 5).map((of, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2.5">
                      <img
                        src={of.av}
                        alt=""
                        width={42}
                        height={42}
                        className="w-[42px] h-[42px] rounded-full object-cover shrink-0 bg-[#e4e6eb]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[14px] leading-tight text-[#050505]">
                          {of.n}
                        </div>
                        <div className="text-[13px] text-[#65676b] mt-0.5 truncate">
                          {of.uf} · donated <b>${of.v}</b>
                        </div>
                      </div>
                      <div className="text-[12px] text-[#8a8d91] shrink-0 self-start pt-1 font-mono">
                        {of.m} min ago
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllOfferings(true)}
                  className="w-full mt-3 py-2 text-center text-[#0866ff] font-semibold text-[13px] hover:underline cursor-pointer"
                >
                  See all recent donations &rarr;
                </button>
              </div>
            </section>
          )}
        </article>
      </main>

      {/* MODAL / SHEET: ALL RECENT DONATIONS */}
      {showAllOfferings && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowAllOfferings(false)}
        >
          <div
            className="w-full max-w-[500px] max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-[#dadde1] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">💛</span>
                <h3 className="font-bold text-[16px] text-[#050505]">
                  All recent donations
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAllOfferings(false)}
                className="w-8 h-8 rounded-full bg-[#f0f2f5] flex items-center justify-center text-[#65676b] font-bold text-[16px] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 divide-y divide-[#eef0f2]">
              {LIVE_OFFERINGS.map((of, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2.5">
                  <img
                    src={of.av}
                    alt=""
                    width={42}
                    height={42}
                    className="w-[42px] h-[42px] rounded-full object-cover shrink-0 bg-[#e4e6eb]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14px] leading-tight text-[#050505]">
                      {of.n}
                    </div>
                    <div className="text-[13px] text-[#65676b] mt-0.5 truncate">
                      {of.uf} · donated <b>${of.v}</b>
                    </div>
                  </div>
                  <div className="text-[12px] text-[#8a8d91] shrink-0 self-start pt-1 font-mono">
                    {of.m} min ago
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-[#f0f2f5] border-t border-[#dadde1]">
              <button
                type="button"
                onClick={() => setShowAllOfferings(false)}
                className="w-full py-2.5 bg-[#0866ff] text-white font-bold rounded-lg text-[14px] cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
