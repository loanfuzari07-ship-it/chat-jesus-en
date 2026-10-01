import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Video, Phone, MoreVertical, RotateCcw, ShieldCheck, Info } from 'lucide-react';

interface WhatsAppHeaderProps {
  isTyping: boolean;
  onBackClick: () => void;
  onRestart: () => void;
}

export const WhatsAppHeader: React.FC<WhatsAppHeaderProps> = ({
  isTyping,
  onBackClick,
  onRestart
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header
      id="wa-header"
      className="w-full bg-[#075E54] flex items-center px-2 sm:px-3.5 py-2.5 gap-2 select-none shadow-[0_2px_4px_rgba(0,0,0,0.2)] shrink-0 z-30"
      style={{ paddingTop: 'max(10px, env(safe-area-inset-top))' }}
    >
      {/* Back button & Avatar click area */}
      <div className="flex items-center gap-1.5 cursor-pointer" onClick={onBackClick}>
        <button
          type="button"
          aria-label="Back"
          className="text-white p-1 rounded-full hover:bg-black/10 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="relative">
          <img
            src="/images/hostAvatar3.webp"
            alt="Jesus"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-white/30"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] border-2 border-[#075E54] rounded-full"></span>
        </div>
      </div>

      {/* Info: Name & Status */}
      <div className="flex-1 min-w-0 pl-1 cursor-pointer" onClick={() => setMenuOpen(true)}>
        <div className="text-white font-semibold text-[16px] leading-[1.2] truncate">
          Jesus
        </div>
        <div
          id="wa-status"
          className="text-[#b2dfdb] text-[12px] leading-[1.2] min-h-[15px] transition-all duration-150"
        >
          {isTyping ? (
            <span className="italic font-normal">typing...</span>
          ) : (
            'online'
          )}
        </div>
      </div>

      {/* WhatsApp Action Icons: Video, Call, More */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-white" ref={menuRef}>
        <button
          type="button"
          aria-label="Video call"
          onClick={onBackClick}
          className="p-1.5 rounded-full hover:bg-black/10 active:bg-black/20 text-white transition-colors"
        >
          <Video className="w-5 h-5 text-white" />
        </button>

        <button
          type="button"
          aria-label="Voice call"
          onClick={onBackClick}
          className="p-1.5 rounded-full hover:bg-black/10 active:bg-black/20 text-white transition-colors"
        >
          <Phone className="w-4 h-4 text-white" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="More options"
            className="p-1.5 rounded-full hover:bg-black/10 active:bg-black/20 text-white transition-colors cursor-pointer"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>

          {menuOpen && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-md shadow-2xl py-1.5 z-50 text-neutral-800 text-[14px] border border-neutral-100 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onRestart();
                }}
                className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-[#075E54]" />
                <span>Restart conversation</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onBackClick();
                }}
                className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-neutral-100 active:bg-neutral-200 transition-colors border-t border-neutral-100"
              >
                <Info className="w-4 h-4 text-[#075E54]" />
                <span>About this word</span>
              </button>

              <div className="px-4 py-2 text-[11px] text-neutral-400 border-t border-neutral-100 flex items-center gap-1.5 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#075E54]" />
                <span>Personal encrypted conversation</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
