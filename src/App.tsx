/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';
import {
  BurdenCategory,
  ChatMessage,
  ConversationStep
} from './types';
import {
  INITIAL_MESSAGES,
  STEP1_ASK_NAME_MESSAGES,
  getStep2Messages,
  getStep3Messages,
  BURDEN_OPTIONS,
  getBurdenMessages,
  getPreparationMessages,
  getDoorMessages
} from './data/conversation';
import { getInitialFirstName, saveFirstName } from './utils/urlParams';
import { installBackRedirect } from './utils/backRedirect';
import { WhatsAppHeader } from './components/WhatsAppHeader';
import { ChatBubble } from './components/ChatBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { ChoiceButtons, ChoiceOption } from './components/ChoiceButtons';
import { ChatInput } from './components/ChatInput';
import { SplashScreen } from './components/SplashScreen';
import { LiveJesusStep } from './components/LiveJesusStep';

function getCurrentTimeStr(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function App() {
  // Check if initial route asks for the live video stage
  const [activeStage, setActiveStage] = useState<'chat' | 'live'>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('step') === 'live' || params.get('live') === '1' || window.location.pathname.includes('live')) {
      return 'live';
    }
    return 'chat';
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState<ConversationStep>('step0_ready');
  const [userName, setUserName] = useState<string>(() => getInitialFirstName());
  const [selectedBurden, setSelectedBurden] = useState<BurdenCategory | undefined>(undefined);
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [inputReady, setInputReady] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const deliveryIdRef = useRef<number>(0);
  const hasStartedInitialRef = useRef<boolean>(false);

  // Smooth auto-scroll
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  useEffect(() => {
    if (activeStage === 'chat') {
      scrollToBottom('smooth');
    }
  }, [messages, isTyping, inputReady, activeStage]);

  // Installs the back-button redirect trap once per page load. Set the real
  // URL in src/utils/backRedirect.ts (BACK_REDIRECT_URL) before going live.
  useEffect(() => {
    installBackRedirect();
  }, []);

  // Helper to deliver a sequence of Jesus messages with typing delays
  const deliverMessages = async (
    texts: string[],
    onComplete?: () => void
  ) => {
    const deliveryId = ++deliveryIdRef.current;
    setInputReady(false);

    for (let i = 0; i < texts.length; i++) {
      if (deliveryIdRef.current !== deliveryId) return;

      setIsTyping(true);
      const text = texts[i];
      const typingTime = Math.min(Math.max(text.length * 26, 650), 1800);

      await new Promise((res) => setTimeout(res, typingTime));
      if (deliveryIdRef.current !== deliveryId) return;

      setIsTyping(false);

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: 'jesus',
        text,
        timestamp: getCurrentTimeStr()
      };

      setMessages((prev) => {
        if (
          prev.length > 0 &&
          prev[prev.length - 1].sender === 'jesus' &&
          prev[prev.length - 1].text === text
        ) {
          return prev;
        }
        return [...prev, newMsg];
      });

      if (i < texts.length - 1) {
        await new Promise((res) => setTimeout(res, 300));
        if (deliveryIdRef.current !== deliveryId) return;
      }
    }

    if (deliveryIdRef.current === deliveryId) {
      setIsTyping(false);
      setInputReady(true);
      if (onComplete) onComplete();
    }
  };

  // Initial step 0 delivery (runs once in chat stage)
  useEffect(() => {
    if (activeStage !== 'chat') return;
    if (hasStartedInitialRef.current) return;
    hasStartedInitialRef.current = true;

    deliverMessages(INITIAL_MESSAGES);
  }, [activeStage]);

  // Handle user response to Step 0: "🙏 Yes, speak to me"
  const handleStep0Accept = async () => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: '🙏 Yes, speak to me',
      timestamp: getCurrentTimeStr()
    };
    setMessages((prev) => [...prev, userMsg]);
    setStep('step1_name');

    await deliverMessages(STEP1_ASK_NAME_MESSAGES);
  };

  // Handle user response to Step 1: Submitting Name
  const handleStep1NameSubmit = async (name: string) => {
    const cleanName = name.trim();
    setUserName(cleanName);
    saveFirstName(cleanName);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: cleanName,
      timestamp: getCurrentTimeStr()
    };
    setMessages((prev) => [...prev, userMsg]);
    setStep('step2_deep_breath');

    const step2Texts = getStep2Messages(cleanName);
    await deliverMessages(step2Texts);
  };

  // Handle user response to Step 2: "✅ YES, I'M READY"
  const handleStep2Ready = async () => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: "✅ YES, I'M READY",
      timestamp: getCurrentTimeStr()
    };
    setMessages((prev) => [...prev, userMsg]);
    setStep('step3_burden');

    const step3Texts = getStep3Messages(userName || 'my child');
    await deliverMessages(step3Texts);
  };

  // Handle user response to Step 3: Choosing burden
  const handleStep3BurdenSelect = async (opt: ChoiceOption) => {
    const category = opt.value as BurdenCategory;
    setSelectedBurden(category);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: opt.label,
      timestamp: getCurrentTimeStr()
    };
    setMessages((prev) => [...prev, userMsg]);
    setStep('step4_branch');

    const branchTexts = getBurdenMessages(category, userName || 'my child');
    await deliverMessages(branchTexts);
  };

  // Handle user response to Step 4: "🙏 YES, I ACCEPT"
  const handleStep4Accept = async () => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: '🙏 YES, I ACCEPT',
      timestamp: getCurrentTimeStr()
    };
    setMessages((prev) => [...prev, userMsg]);
    setStep('step5_preparation');

    const prepTexts = getPreparationMessages(selectedBurden || 'everything', userName || 'my child');
    await deliverMessages(prepTexts);
  };

  // Handle user response to Step 5: "🙏 SPEAK, LORD. I'M HERE."
  const handleStep5Speak = async () => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: "🙏 SPEAK, LORD. I'M HERE.",
      timestamp: getCurrentTimeStr()
    };
    setMessages((prev) => [...prev, userMsg]);
    setStep('step6_door');

    const doorTexts = getDoorMessages(userName || 'my child');
    await deliverMessages(doorTexts);
  };

  // Handle user response to Step 6: "🙏 OPEN THE DOOR OF BLESSING"
  // Smoothly transitions into the SECOND STEP (Live Video & Facebook Live Chat)
  const handleStep6OpenDoor = () => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: '🙏 OPEN THE DOOR OF BLESSING',
      timestamp: getCurrentTimeStr()
    };
    setMessages((prev) => [...prev, userMsg]);
    setStep('step7_redirecting');
    setIsRedirecting(true);

    if (userName) saveFirstName(userName);

    // Transition to the Second Stage (Facebook Live with Brazilian live chat)
    setTimeout(() => {
      // Update browser history state
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('step', 'live');
        if (userName) url.searchParams.set('firstName', userName);
        window.history.pushState({}, '', url.toString());
      } catch {
        // ignore
      }
      setIsRedirecting(false);
      setActiveStage('live');
      window.scrollTo(0, 0);
    }, 1200);
  };

  // Restart chat
  const handleRestart = () => {
    deliveryIdRef.current++;
    setMessages([]);
    setStep('step0_ready');
    setIsTyping(true);
    setInputReady(false);
    setIsRedirecting(false);

    setTimeout(() => {
      deliverMessages(INITIAL_MESSAGES);
    }, 150);
  };

  // Back button click in header: standard browser back navigation. The
  // back-redirect "bounce trap" (installBackRedirect) only fires on the
  // actual hardware/gesture Back button, not this in-app header button.
  const handleHeaderBack = () => {
    window.history.back();
  };

  // IF IN SECOND STAGE (LIVE VIDEO & FACEBOOK LIVE CHAT):
  if (activeStage === 'live') {
    return (
      <LiveJesusStep
        userName={userName}
        onBackToChat={() => {
          setActiveStage('chat');
          try {
            const url = new URL(window.location.href);
            url.searchParams.delete('step');
            window.history.pushState({}, '', url.toString());
          } catch {
            // ignore
          }
        }}
      />
    );
  }

  // FIRST STAGE: PURE WHATSAPP MOBILE INTERFACE (100% CLEAN, NO UNWANTED POPUPS)
  return (
    <div className="fixed inset-0 h-screen h-[100dvh] w-full flex justify-center bg-[#efeae2] overflow-hidden select-none">
      <div className="w-full max-w-[560px] h-full flex flex-col relative bg-[#efeae2] wa-chat-bg sm:shadow-2xl sm:border-x sm:border-neutral-300/40 overflow-hidden">
        {/* Splash Screen */}
        <SplashScreen />

        {/* WhatsApp Header */}
        <WhatsAppHeader
          isTyping={isTyping}
          onBackClick={handleHeaderBack}
          onRestart={handleRestart}
        />

        {/* Chat Scrollable Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain px-1.5 sm:px-3 py-2 flex flex-col justify-start relative"
        >
          {/* Encryption notice pill */}
          <div className="w-full px-2 pt-1 pb-1 flex justify-center shrink-0">
            <div className="bg-[#fff9c4]/90 border border-[#fbc02d]/35 text-[#54656f] text-[12px] leading-[1.3] px-3 py-1.5 rounded-lg max-w-[94%] text-center shadow-xs flex items-center justify-center gap-1.5 select-none">
              <Lock className="w-3.5 h-3.5 text-[#e65100] shrink-0" />
              <span>
                Messages are protected with end-to-end encryption.
              </span>
            </div>
          </div>

          {/* Date pill */}
          <div className="w-full flex justify-center my-1.5 shrink-0 select-none">
            <span className="bg-white/80 text-[#54656f] text-[11px] font-semibold px-2.5 py-0.5 rounded-md shadow-[0_1px_0.5px_rgba(11,20,26,0.1)] uppercase tracking-wider">
              TODAY
            </span>
          </div>

          {/* Messages */}
          <div className="flex flex-col justify-start w-full">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}

            {/* Typing Indicator */}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Inline Choice Buttons */}
          {inputReady && !isTyping && (
            <div className="w-full mt-1 mb-2">
              {/* Step 0 Choice */}
              {step === 'step0_ready' && (
                <ChoiceButtons
                  options={[
                    {
                      id: 'step0-yes',
                      label: '🙏 Yes, speak to me'
                    }
                  ]}
                  onSelect={handleStep0Accept}
                />
              )}

              {/* Step 2 Choice */}
              {step === 'step2_deep_breath' && (
                <ChoiceButtons
                  options={[
                    {
                      id: 'step2-ready',
                      label: "✅ YES, I'M READY"
                    }
                  ]}
                  onSelect={handleStep2Ready}
                />
              )}

              {/* Step 3: 4 Burden Choices */}
              {step === 'step3_burden' && (
                <ChoiceButtons
                  options={BURDEN_OPTIONS.map((b) => ({
                    id: b.category,
                    label: b.label,
                    value: b.category
                  }))}
                  onSelect={handleStep3BurdenSelect}
                />
              )}

              {/* Step 4 Choice */}
              {step === 'step4_branch' && (
                <ChoiceButtons
                  options={[
                    {
                      id: 'step4-accept',
                      label: '🙏 YES, I ACCEPT'
                    }
                  ]}
                  onSelect={handleStep4Accept}
                />
              )}

              {/* Step 5 Choice */}
              {step === 'step5_preparation' && (
                <ChoiceButtons
                  options={[
                    {
                      id: 'step5-speak',
                      label: "🙏 SPEAK, LORD. I'M HERE."
                    }
                  ]}
                  onSelect={handleStep5Speak}
                />
              )}

              {/* Step 6 Choice */}
              {step === 'step6_door' && (
                <ChoiceButtons
                  options={[
                    {
                      id: 'step6-open',
                      label: '🙏 OPEN THE DOOR OF BLESSING'
                    }
                  ]}
                  onSelect={handleStep6OpenDoor}
                />
              )}
            </div>
          )}

          {/* Redirecting feedback banner */}
          {isRedirecting && (
            <div className="px-4 py-3 mx-3 my-2 bg-white/95 rounded-xl shadow-lg border border-[#075E54]/30 text-center animate-pulse">
              <p className="text-[#075E54] font-semibold text-[14.5px]">
                Opening the door... accessing the video revelation for you 🙏
              </p>
            </div>
          )}

          <div ref={chatBottomRef} className="h-1 shrink-0" />
        </div>

        {/* Input bar docked at bottom during Step 1 */}
        {inputReady && !isTyping && step === 'step1_name' && (
          <ChatInput
            placeholder="✏️ Type your first name..."
            onSubmit={handleStep1NameSubmit}
          />
        )}
      </div>
    </div>
  );
}
