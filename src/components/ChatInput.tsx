import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
interface ChatInputProps { placeholder?: string; onSubmit: (text: string) => void; disabled?: boolean; }
export const ChatInput: React.FC<ChatInputProps> = ({ placeholder = 'Type your message…', onSubmit, disabled = false }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { const timer = setTimeout(() => inputRef.current?.focus(), 150); return () => clearTimeout(timer); }, []);
  const submit = (event: React.FormEvent) => { event.preventDefault(); const text = value.trim(); if (!text || disabled) return; onSubmit(text); setValue(''); };
  return <div className="divine-input-bar"><form onSubmit={submit}><input ref={inputRef} type="text" aria-label={placeholder} value={value} disabled={disabled} onChange={e => setValue(e.target.value)} placeholder={placeholder} autoComplete="off" /><button type="submit" disabled={disabled || !value.trim()} aria-label="Send message"><ArrowUp size={21} /></button></form></div>;
};
