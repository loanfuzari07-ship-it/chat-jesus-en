import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MoreVertical, RotateCcw, Info } from 'lucide-react';
interface WhatsAppHeaderProps { isTyping: boolean; onBackClick: () => void; onRestart: () => void; }
export const WhatsAppHeader: React.FC<WhatsAppHeaderProps> = ({ isTyping, onBackClick, onRestart }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false); };
    if (menuOpen) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);
  return (
    <header id="wa-header" className="divine-header">
      <button type="button" className="divine-icon-button" aria-label="Back" onClick={onBackClick}><ArrowLeft size={20} /></button>
      <div className="divine-avatar-ring"><img src="/images/jesus-avatar.webp" alt="Jesus" width={48} height={48} /><span /></div>
      <div className="divine-header-copy"><h1>Jesus</h1><p id="wa-status">{isTyping ? 'typing...' : 'online'}</p></div>
      <div className="divine-menu-wrap" ref={menuRef}>
        <button type="button" className="divine-icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="More options" aria-expanded={menuOpen}><MoreVertical size={21} /></button>
        {menuOpen && <div className="divine-menu"><button type="button" onClick={() => { setMenuOpen(false); onRestart(); }}><RotateCcw size={16} />Restart conversation</button><button type="button" onClick={() => { setMenuOpen(false); onBackClick(); }}><Info size={16} />About this word</button></div>}
      </div>
    </header>
  );
};
