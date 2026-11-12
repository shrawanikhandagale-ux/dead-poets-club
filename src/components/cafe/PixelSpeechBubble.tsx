import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface PixelSpeechBubbleProps {
  text: string;
  authorLabel?: string;
  isSelf?: boolean;
  isDemo?: boolean;
  maxWidthClass?: string;
  compact?: boolean;
  className?: string;
}

/**
 * PixelSpeechBubble
 * Crisp indie-game pixel-art speech bubble with warm parchment fill and
 * a stepped pixel tail. Designed to stay legible in both Daylight and After Hours themes.
 */
export const PixelSpeechBubble: React.FC<PixelSpeechBubbleProps> = ({
  text,
  authorLabel,
  isSelf = false,
  isDemo = false,
  maxWidthClass = 'max-w-[196px]',
  compact = false,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 4, scale: 0.96 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -3, scale: 0.96 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.16, ease: 'easeOut' }}
      className={`relative flex flex-col items-center pointer-events-none select-none ${className}`}
    >
      <div
        className={`pixel-bubble-surface ${maxWidthClass} ${
          compact ? 'px-2.5 py-1.5' : 'px-3 py-2'
        } bg-[#FFFDF9] text-[#2E2118] border-2 ${
          isSelf ? 'border-[#6E3E44]' : 'border-[#1B1410]'
        } rounded-[4px] shadow-[2px_2px_0px_#1B1410]`}
        style={{ imageRendering: 'pixelated' }}
      >
        {authorLabel && (
          <div className="flex items-center justify-between gap-2 mb-0.5 border-b border-[#E7DAC7] pb-0.5">
            <span
              className={`font-mono text-[10px] font-medium tracking-wide truncate ${
                isSelf ? 'text-[#6E3E44]' : 'text-[#5A422E]'
              }`}
            >
              {authorLabel}
            </span>
            {isDemo && (
              <span className="font-mono text-[9px] uppercase tracking-wide text-[#8C7158]">
                NPC
              </span>
            )}
          </div>
        )}
        <p className="font-sans text-xs leading-[1.35] font-medium text-[#2E2118] break-words">
          {text}
        </p>
      </div>

      {/* Stepped pixel-art downward pointer */}
      <svg
        width="14"
        height="7"
        viewBox="0 0 14 7"
        aria-hidden="true"
        className="-mt-[2px] pixel-crisp"
      >
        {/* Outer border pixels */}
        <rect x="2" y="0" width="10" height="2" fill={isSelf ? '#6E3E44' : '#1B1410'} />
        <rect x="4" y="2" width="6" height="2" fill={isSelf ? '#6E3E44' : '#1B1410'} />
        <rect x="6" y="4" width="2" height="2" fill={isSelf ? '#6E3E44' : '#1B1410'} />
        {/* Inner parchment fill */}
        <rect x="4" y="0" width="6" height="2" fill="#FFFDF9" />
        <rect x="6" y="2" width="2" height="2" fill="#FFFDF9" />
      </svg>
    </motion.div>
  );
};

