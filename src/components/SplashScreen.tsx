import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isFading, setIsFading] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
      const removeTimer = setTimeout(() => {
        setIsRemoved(true);
        if (onFinish) onFinish();
      }, 350);
      return () => clearTimeout(removeTimer);
    }, 1100);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (isRemoved) return null;

  return (
    <div
      className={`fixed inset-0 bg-[#efeae2] z-[500] flex flex-col items-center justify-center gap-5 pt-[62px] transition-opacity duration-350 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-live="polite"
    >
      <div className="relative">
        <img
          src="/images/hostAvatar3.webp"
          alt="Jesus"
          width={100}
          height={100}
          className="w-[100px] h-[100px] rounded-full object-cover shadow-[0_4px_16px_rgba(0,0,0,0.15)] ring-4 ring-white/60"
        />
        <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#25D366] border-2 border-white rounded-full"></span>
      </div>

      <div className="text-[#075E54] text-[15px] font-medium tracking-wide">
        Connecting you now...
      </div>

      <div className="flex gap-1.5 items-center">
        <span
          className="w-2.5 h-2.5 bg-[#075E54] rounded-full animate-wa-bounce"
          style={{ animationDelay: '0s' }}
        />
        <span
          className="w-2.5 h-2.5 bg-[#075E54] rounded-full animate-wa-bounce"
          style={{ animationDelay: '0.2s' }}
        />
        <span
          className="w-2.5 h-2.5 bg-[#075E54] rounded-full animate-wa-bounce"
          style={{ animationDelay: '0.4s' }}
        />
      </div>
    </div>
  );
};
