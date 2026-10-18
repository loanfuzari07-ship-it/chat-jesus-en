import React, { useState, useEffect, useRef } from 'react';
import { preloadVTurbAssets } from '../utils/preloadVideo';
import {
  LIVE_COMMENTS,
  LIVE_OFFERINGS,
  LiveCommenter
} from '../data/liveChatData';
import {
  getInitialFirstName,
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

const OFFERS_DELAY_SEC = 657; // 10:57

// Checkout URLs are configured separately for the English dollar offers.
const OFFER_CHECKOUT_URLS: Record<number, string> = {
  25: 'https://pay.digitalgoat.com.br/checkout/cmupt5qgu013m01on5igkgplm?offer=Y8XY8LP',
  50: 'https://pay.digitalgoat.com.br/checkout/cmupt5qgu013m01on5igkgplm?offer=QZK0PVD',
  70: 'https://pay.digitalgoat.com.br/checkout/cmupt5qgu013m01on5igkgplm?offer=31YQF5Z',
  100: 'https://pay.digitalgoat.com.br/checkout/cmupt5qgu013m01on5igkgplm?offer=YC35KU2'
};

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

  // Modal for all offerings
  const [showAllOfferings, setShowAllOfferings] = useState<boolean>(false);

  // Time display (e.g. "Today at 5:49 PM")
  const [postTime, setPostTime] = useState<string>('');

  const poolRef = useRef<LiveCommenter[]>([...LIVE_COMMENTS]);
  const poolIdxRef = useRef<number>(0);
  const chatBoxRef = useRef<HTMLDivElement>(null);

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

  // Timer & VTurb message sync for reveal at 10:57 (657 seconds)
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
        const vturb = document.getElementById('vid-6ad53ae248a15a578a6de50f');
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
    preloadVTurbAssets();
    // Remove any previous instances to allow fresh execution
    const prevPlayerScript = document.getElementById('vturb-script-v4');
    if (prevPlayerScript) prevPlayerScript.remove();
    const prevSmart = document.getElementById('vturb-smartplayer-js');
    if (prevSmart) prevSmart.remove();

    const s = document.createElement('script');
    s.id = 'vturb-script-v4';
    s.src = 'https://scripts.converteai.net/15c55340-cc1a-4abb-9c8a-da5918cd9642/players/6ad53ae248a15a578a6de50f/v4/player.js';
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
    const vturb = document.getElementById('vid-6ad53ae248a15a578a6de50f');
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

  // No contact-information step before choosing an offer.
  const handleSelectOffer = (value: number) => {
    const checkoutBase = OFFER_CHECKOUT_URLS[value];
    if (!checkoutBase) return;
    const selected = new URL(checkoutBase);
    let targetUrl = buildTargetUrl(checkoutBase, {
      offer: selected.searchParams.get('offer') || '',
      off: selected.searchParams.get('off') || '',
      first_name: firstName || '',
      name: firstName || ''
    });
    try {
      if (window.trck) {
        const decorated = window.trck.decorate(targetUrl);
        if (typeof decorated === 'string' && decorated) targetUrl = decorated;
      }
    } catch {}
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
              src="/images/jesus-avatar.webp"
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
            className="relative bg-black w-full max-w-[400px] mx-auto cursor-pointer"
            onClick={handlePlayerAreaClick}
          >
            <style>{`
              .vt-loading-wrapper {
                pointer-events: none !important;
              }
            `}</style>

            {/* VTurb controls the height; its 3:4 placeholder reserves loading space. */}
            <div
              className="w-full"
              dangerouslySetInnerHTML={{
                __html: `
                  <vturb-smartplayer id="vid-6ad53ae248a15a578a6de50f" style="display: block; margin: 0 auto; width: 100%; max-width: 400px;">
                    <div class="vturb-player-placeholder" style="position: relative; width: 100%; padding: 133.33333333333331% 0 0; z-index: 0; background-color: black;"></div>
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

          {/* Headline and offers share the existing reveal trigger. */}
          {isRevealed && (
            <section className="p-3.5 pt-4 animate-in fade-in duration-300" aria-labelledby="offersTitle">
              <h2 id="offersTitle" className="text-center text-[22px] font-extrabold leading-[1.3] mt-2 mb-6">
                Choose Your Miracle Offering
              </h2>
              <div className="space-y-2.5 mb-4">
                {[50, 25, 70, 100].map((value) => (
                  <div
                    key={value}
                    aria-disabled={!OFFER_CHECKOUT_URLS[value]}
                    onClick={() => handleSelectOffer(value)}
                    className={`relative border-2 rounded-[12px] p-4 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between gap-3 ${
                      value === 50
                        ? 'bg-gradient-to-r from-[#fffef8] to-[#fff9e6] border-[#f7b928] shadow-[0_0_0_1px_#f7b928,0_4px_12px_rgba(247,185,40,0.25)]'
                        : 'bg-white border-[#e4e6eb] hover:border-[#0866ff]'
                    }`}
                  >
                    {value === 50 && (
                      <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 bg-[#f7b928] text-black text-[11px] font-extrabold px-3 py-0.5 rounded-full whitespace-nowrap shadow-xs uppercase tracking-wider">
                        MOST CHOSEN
                      </div>
                    )}
                    <div className={`font-bold text-[22px] ${value === 50 ? 'text-[#b07800]' : 'text-[#050505]'}`}>
                      ${value}
                    </div>
                    <button
                      type="button"
                      aria-label={`Choose the $${value} offering`}
                      disabled={!OFFER_CHECKOUT_URLS[value]}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectOffer(value);
                      }}
                      className={`inline-flex items-center justify-center shrink-0 whitespace-nowrap min-h-[44px] font-bold text-[13px] px-3 py-2 rounded-[8px] cursor-pointer shadow-xs transition-colors ${
                        value === 50
                          ? 'bg-[#f7b928] hover:bg-[#e6ac22] text-black'
                          : 'bg-[#0866ff] hover:bg-[#0755d6] text-white'
                      }`}
                    >
                      CHOOSE →
                    </button>
                  </div>
                ))}
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
