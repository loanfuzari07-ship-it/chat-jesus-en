import React from 'react';
import { ChatMessage } from '../types';
interface ChatBubbleProps { message: ChatMessage; }
export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isJesus = message.sender === 'jesus';
  const formatted = message.text.split(/(\*\*.*?\*\*)/g).map((part, i) => part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>);
  return <div className={`divine-message-row ${isJesus ? 'from-jesus' : 'from-visitor'}`}><div className="divine-message"><div className="divine-message-text">{formatted}</div><div className="divine-message-time"><span>{message.timestamp}</span>{!isJesus && <svg width="16" height="12" viewBox="0 0 18 12" fill="none" aria-label="Delivered"><path d="M1 6l3 3 7-8M7 9l2 2 8-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}</div></div></div>;
};
