import React from 'react';
import { AvatarConfig } from '../../types/profile';
import {
  HELD_ITEM_OPTIONS,
  ACCESSORY_OPTIONS,
  OUTERWEAR_OPTIONS,
  BADGE_OPTIONS,
} from './avatarData';

interface InventoryPanelProps {
  config: AvatarConfig;
  onSlotClick?: (category: 'props' | 'accessories' | 'outerwear' | 'badges') => void;
  interactive?: boolean;
  className?: string;
}

/**
 * InventoryPanel Component
 * 
 * Recreates the retro 8-bit inventory equipment screen seen in sugigore.jpg.
 * Features framed ink double-borders, pixel icons for each equipped item,
 * and retro typewriter / pixel typography.
 */
export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  config,
  onSlotClick,
  interactive = true,
  className = '',
}) => {
  const heldItemMeta = HELD_ITEM_OPTIONS.find(o => o.id === config.heldItem) || HELD_ITEM_OPTIONS[1];
  const primaryAccessoryMeta = ACCESSORY_OPTIONS.find(o => config.accessories.includes(o.id)) || ACCESSORY_OPTIONS[0];
  const outerwearMeta = OUTERWEAR_OPTIONS.find(o => o.id === config.outerwear) || OUTERWEAR_OPTIONS[1];
  const badgeMeta = BADGE_OPTIONS.find(o => o.id === config.equippedBadge) || BADGE_OPTIONS[0];

  return (
    <div
      className={`border-3 border-[#1A1614] bg-[#FCF8F2] p-4 sm:p-5 rounded shadow-[4px_4px_0px_#1A1614] ${className}`}
    >
      {/* Retro Header: [ INVENTORY ] */}
      <div className="flex items-center justify-between border-b-2 border-[#1A1614] pb-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-[#755151] border border-[#1A1614]" />
          <h3 className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#1A1614] uppercase">
            [ INVENTORY ]
          </h3>
        </div>
        <span className="font-mono text-[10px] text-[#72583E] tracking-wider uppercase font-bold">
          SLOTS: 4/4
        </span>
      </div>

      {/* 2x2 Equipment Matrix */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* SLOT 1: Handheld Literary Prop */}
        <button
          type="button"
          disabled={!interactive}
          onClick={() => onSlotClick && onSlotClick('props')}
          className={`p-3 bg-[#FFF9F3] border-2 border-[#1A1614] rounded flex flex-col items-center justify-between text-left transition-all ${
            interactive
              ? 'hover:bg-[#DBC4A5]/30 hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_#1A1614] cursor-pointer'
              : ''
          }`}
        >
          <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold text-[#755151] uppercase mb-1">
            <span>SLOT 01</span>
            <span className="text-[#A08670]">PROP</span>
          </div>
          {/* Pixel Icon: Book / Journal / Mug */}
          <div className="w-12 h-12 flex items-center justify-center my-1">
            <svg
              viewBox="0 0 24 24"
              className="w-10 h-10"
              style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
            >
              {config.heldItem === 'steaming_coffee' ? (
                <g fill="#1A1614">
                  <rect x="5" y="8" width="12" height="12" />
                  <rect x="7" y="10" width="8" height="8" fill="#FFF9F3" />
                  <rect x="17" y="10" width="4" height="6" />
                  <rect x="18" y="12" width="2" height="2" fill="#FFF9F3" />
                  <rect x="9" y="3" width="2" height="3" fill="#A08670" />
                  <rect x="13" y="4" width="2" height="3" fill="#A08670" />
                </g>
              ) : config.heldItem === 'walkman' ? (
                <g fill="#1A1614">
                  <rect x="4" y="4" width="16" height="16" />
                  <rect x="6" y="6" width="12" height="12" fill="#DBC4A5" />
                  <rect x="8" y="8" width="8" height="4" fill="#1A1614" />
                  <circle cx="10" cy="14" r="1.5" fill="#1A1614" />
                  <circle cx="14" cy="14" r="1.5" fill="#1A1614" />
                </g>
              ) : (
                <g fill="#1A1614">
                  {/* Antique Book */}
                  <rect x="5" y="3" width="14" height="18" />
                  <rect x="7" y="5" width="10" height="14" fill="#755151" />
                  <rect x="6" y="3" width="2" height="18" fill="#DBC4A5" />
                  <rect x="9" y="8" width="6" height="1.5" fill="#DBC4A5" />
                  <rect x="9" y="12" width="4" height="1.5" fill="#DBC4A5" />
                </g>
              )}
            </svg>
          </div>
          <div className="w-full text-center">
            <span className="font-mono text-xs font-bold text-[#1A1614] block truncate">
              {heldItemMeta.name}
            </span>
            <span className="font-mono text-[9px] text-[#72583E] block truncate">
              {heldItemMeta.desc}
            </span>
          </div>
        </button>

        {/* SLOT 2: Headwear & Spectacles */}
        <button
          type="button"
          disabled={!interactive}
          onClick={() => onSlotClick && onSlotClick('accessories')}
          className={`p-3 bg-[#FFF9F3] border-2 border-[#1A1614] rounded flex flex-col items-center justify-between text-left transition-all ${
            interactive
              ? 'hover:bg-[#DBC4A5]/30 hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_#1A1614] cursor-pointer'
              : ''
          }`}
        >
          <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold text-[#755151] uppercase mb-1">
            <span>SLOT 02</span>
            <span className="text-[#A08670]">OPTIC/GEAR</span>
          </div>
          {/* Pixel Icon: Spectacles / Headphones */}
          <div className="w-12 h-12 flex items-center justify-center my-1">
            <svg
              viewBox="0 0 24 24"
              className="w-10 h-10"
              style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
            >
              {config.accessories.includes('over_ear_headphones') ? (
                <g fill="#1A1614">
                  <rect x="4" y="6" width="16" height="2" />
                  <rect x="3" y="7" width="2" height="7" />
                  <rect x="19" y="7" width="2" height="7" />
                  <rect x="2" y="12" width="4" height="7" fill="#E2843A" />
                  <rect x="18" y="12" width="4" height="7" fill="#E2843A" />
                </g>
              ) : (
                <g fill="#1A1614">
                  {/* Round Spectacles */}
                  <rect x="3" y="9" width="7" height="7" />
                  <rect x="4" y="10" width="5" height="5" fill="#FFF9F3" />
                  <rect x="14" y="9" width="7" height="7" />
                  <rect x="15" y="10" width="5" height="5" fill="#FFF9F3" />
                  <rect x="10" y="11" width="4" height="2" />
                  <rect x="1" y="10" width="2" height="2" />
                  <rect x="21" y="10" width="2" height="2" />
                </g>
              )}
            </svg>
          </div>
          <div className="w-full text-center">
            <span className="font-mono text-xs font-bold text-[#1A1614] block truncate">
              {primaryAccessoryMeta.name}
            </span>
            <span className="font-mono text-[9px] text-[#72583E] block truncate">
              {primaryAccessoryMeta.desc}
            </span>
          </div>
        </button>

        {/* SLOT 3: Wardrobe Outerwear */}
        <button
          type="button"
          disabled={!interactive}
          onClick={() => onSlotClick && onSlotClick('outerwear')}
          className={`p-3 bg-[#FFF9F3] border-2 border-[#1A1614] rounded flex flex-col items-center justify-between text-left transition-all ${
            interactive
              ? 'hover:bg-[#DBC4A5]/30 hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_#1A1614] cursor-pointer'
              : ''
          }`}
        >
          <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold text-[#755151] uppercase mb-1">
            <span>SLOT 03</span>
            <span className="text-[#A08670]">ATTIRE</span>
          </div>
          {/* Pixel Icon: Cardigan / Blazer / Coat */}
          <div className="w-12 h-12 flex items-center justify-center my-1">
            <svg
              viewBox="0 0 24 24"
              className="w-10 h-10"
              style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
            >
              <g fill="#1A1614">
                <rect x="5" y="5" width="14" height="15" />
                <rect x="3" y="6" width="3" height="10" />
                <rect x="18" y="6" width="3" height="10" />
                {/* Collar V neck */}
                <polygon points="12,12 8,5 16,5" fill="#DBC4A5" />
                <rect x="11.5" y="12" width="1" height="8" fill="#FFF9F3" />
                <circle cx="12" cy="14" r="0.8" fill="#1A1614" />
                <circle cx="12" cy="17" r="0.8" fill="#1A1614" />
              </g>
            </svg>
          </div>
          <div className="w-full text-center">
            <span className="font-mono text-xs font-bold text-[#1A1614] block truncate">
              {outerwearMeta.name}
            </span>
            <span className="font-mono text-[9px] text-[#72583E] block truncate">
              {outerwearMeta.desc}
            </span>
          </div>
        </button>

        {/* SLOT 4: Society Relic & Badge */}
        <button
          type="button"
          disabled={!interactive}
          onClick={() => onSlotClick && onSlotClick('badges')}
          className={`p-3 bg-[#FFF9F3] border-2 border-[#1A1614] rounded flex flex-col items-center justify-between text-left transition-all ${
            interactive
              ? 'hover:bg-[#DBC4A5]/30 hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_#1A1614] cursor-pointer'
              : ''
          }`}
        >
          <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold text-[#755151] uppercase mb-1">
            <span>SLOT 04</span>
            <span className="text-[#A08670]">RELIC</span>
          </div>
          {/* Pixel Icon: Skeleton Key / Raven / Crest */}
          <div className="w-12 h-12 flex items-center justify-center my-1">
            <svg
              viewBox="0 0 24 24"
              className="w-10 h-10"
              style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
            >
              {config.equippedBadge === 'quill_crest' ? (
                <g fill="#1A1614">
                  <polygon points="18,3 8,17 10,19 20,5" />
                  <rect x="6" y="18" width="3" height="3" />
                  <rect x="4" y="21" width="2" height="1" fill="#755151" />
                </g>
              ) : (
                /* Antique Key as seen in sugigore.jpg */
                <g fill="#1A1614">
                  <circle cx="9" cy="8" r="4.5" />
                  <circle cx="9" cy="8" r="2.2" fill="#FFF9F3" />
                  <rect x="8" y="12" width="2.5" height="9" />
                  <rect x="10.5" y="16" width="3" height="2" />
                  <rect x="10.5" y="19" width="4" height="2" />
                </g>
              )}
            </svg>
          </div>
          <div className="w-full text-center">
            <span className="font-mono text-xs font-bold text-[#1A1614] block truncate">
              {badgeMeta.name}
            </span>
            <span className="font-mono text-[9px] text-[#72583E] block truncate">
              {badgeMeta.desc}
            </span>
          </div>
        </button>
      </div>

      {/* Footer Signature: e.g. "AIKO" or "DPC" */}
      <div className="mt-4 pt-2.5 border-t border-dashed border-[#A08670] flex items-center justify-between text-[10px] font-mono text-[#72583E]">
        <span className="tracking-widest uppercase">CLASS OF 1889</span>
        <span className="font-bold text-[#1A1614] tracking-widest uppercase">· DPC ARCHIVE ·</span>
      </div>
    </div>
  );
};
