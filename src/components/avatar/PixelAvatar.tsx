import React from 'react';
import { AvatarConfig, DEFAULT_AVATAR_CONFIG } from '../../types/profile';

export interface PixelAvatarProps {
  config?: Partial<AvatarConfig> | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  viewMode?: 'full' | 'bust' | 'head';
  className?: string;
  animateIdle?: boolean;
}

// Canonical grid dimensions: 48 units wide by 88 units tall
const CANVAS_WIDTH = 48;
const CANVAS_HEIGHT = 88;

/**
 * PixelAvatar Component
 * 
 * Renders an authentic 8-bit retro RPG sprite character using a crisp pixel-matrix SVG architecture.
 * Features strict pixel-art aesthetic inspired by classic indie games and handheld consoles.
 * Layer order guarantees seamless alignment of hair, garments, glasses, and handheld props.
 */
export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  config: userConfig,
  size = 'md',
  viewMode = 'full',
  className = '',
  animateIdle = false,
}) => {
  const config: AvatarConfig = {
    ...DEFAULT_AVATAR_CONFIG,
    ...(userConfig || {}),
  };

  // Size mappings (in CSS pixels)
  const sizeMap = {
    xs: 28,
    sm: 40,
    md: 80,
    lg: 180,
    xl: 300,
  };

  const pixelSize = sizeMap[size];

  // Adjust SVG viewBox based on viewMode
  let viewBox = `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`;
  let aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;

  if (viewMode === 'bust') {
    viewBox = '8 4 32 38';
    aspectRatio = 32 / 38;
  } else if (viewMode === 'head') {
    viewBox = '12 4 24 26';
    aspectRatio = 24 / 26;
  }

  const skin = config.skinTone || '#EAD4BA';
  const hair = config.hairColor || '#443223';
  const topCol = config.topColor || '#1A1614';
  const bottomCol = config.bottomColor || '#DBC4A5';
  const outerCol = config.outerwearColor || '#72583E';
  const shoeCol = config.shoesColor || '#1A1614';

  const INK_OUTLINE = '#141210';
  const INK_SHADOW = 'rgba(20, 18, 16, 0.25)';

  return (
    <div
      className={`inline-flex items-center justify-center select-none relative ${className}`}
      style={{
        width: pixelSize,
        height: viewMode === 'full' ? pixelSize * (CANVAS_HEIGHT / CANVAS_WIDTH) : pixelSize,
      }}
    >
      <svg
        viewBox={viewBox}
        className={`w-full h-full ${animateIdle ? 'animate-pulse' : ''}`}
        style={{
          imageRendering: 'pixelated',
          shapeRendering: 'crispEdges',
        }}
        aria-label="Pixel RPG Character Avatar"
        role="img"
      >
        <g id="pixel-avatar-root">
          {/* ========================================================= */}
          {/* LAYER 1: BASE BODY SILHOUETTE & SKIN                      */}
          {/* ========================================================= */}
          {/* Head & Neck Base */}
          <g id="layer-skin-base">
            {/* Neck */}
            <rect x="22" y="24" width="4" height="6" fill={skin} />
            <rect x="21" y="24" width="1" height="5" fill={INK_OUTLINE} />
            <rect x="26" y="24" width="1" height="5" fill={INK_OUTLINE} />

            {/* Head Silhouette */}
            <rect x="16" y="8" width="16" height="17" fill={skin} />
            {/* Head Outlines */}
            <rect x="18" y="7" width="12" height="1" fill={INK_OUTLINE} />
            <rect x="15" y="10" width="1" height="13" fill={INK_OUTLINE} />
            <rect x="32" y="10" width="1" height="13" fill={INK_OUTLINE} />
            <rect x="16" y="24" width="3" height="1" fill={INK_OUTLINE} />
            <rect x="29" y="24" width="3" height="1" fill={INK_OUTLINE} />
            <rect x="19" y="25" width="10" height="1" fill={INK_OUTLINE} />

            {/* Ears */}
            <rect x="14" y="14" width="2" height="4" fill={skin} />
            <rect x="14" y="14" width="1" height="4" fill={INK_OUTLINE} />
            <rect x="32" y="14" width="2" height="4" fill={skin} />
            <rect x="33" y="14" width="1" height="4" fill={INK_OUTLINE} />

            {/* Arms & Hands (Base Skin) */}
            <g id="layer-arms">
              {/* Left Arm & Hand */}
              <rect x="10" y="30" width="4" height="20" fill={skin} />
              <rect x="9" y="30" width="1" height="21" fill={INK_OUTLINE} />
              <rect x="10" y="50" width="4" height="1" fill={INK_OUTLINE} />
              {/* Right Arm & Hand */}
              <rect x="34" y="30" width="4" height="20" fill={skin} />
              <rect x="38" y="30" width="1" height="21" fill={INK_OUTLINE} />
              <rect x="34" y="50" width="4" height="1" fill={INK_OUTLINE} />
            </g>

            {/* Legs Base (Beneath Clothing) */}
            <g id="layer-legs-base">
              <rect x="17" y="52" width="5" height="24" fill={skin} />
              <rect x="26" y="52" width="5" height="24" fill={skin} />
              <rect x="16" y="52" width="1" height="24" fill={INK_OUTLINE} />
              <rect x="22" y="52" width="1" height="24" fill={INK_OUTLINE} />
              <rect x="25" y="52" width="1" height="24" fill={INK_OUTLINE} />
              <rect x="31" y="52" width="1" height="24" fill={INK_OUTLINE} />
            </g>
          </g>

          {/* ========================================================= */}
          {/* LAYER 2: FACIAL FEATURES & EXPRESSIONS                    */}
          {/* ========================================================= */}
          <g id="layer-face">
            {/* Eyes based on faceExpression */}
            {config.faceExpression === 'contemplative' && (
              <>
                {/* Half-lidded thoughtful poet gaze */}
                <rect x="18" y="14" width="4" height="1" fill={INK_OUTLINE} />
                <rect x="19" y="15" width="3" height="1" fill={INK_OUTLINE} />
                <rect x="26" y="14" width="4" height="1" fill={INK_OUTLINE} />
                <rect x="26" y="15" width="3" height="1" fill={INK_OUTLINE} />
              </>
            )}
            {config.faceExpression === 'neutral' && (
              <>
                {/* Stoic 8-bit eyes */}
                <rect x="18" y="14" width="3" height="2" fill={INK_OUTLINE} />
                <rect x="19" y="14" width="1" height="1" fill="#FFF9F3" />
                <rect x="27" y="14" width="3" height="2" fill={INK_OUTLINE} />
                <rect x="28" y="14" width="1" height="1" fill="#FFF9F3" />
              </>
            )}
            {config.faceExpression === 'smirk' && (
              <>
                {/* Witty sharp eyes with slightly raised eyebrow */}
                <rect x="18" y="13" width="3" height="1" fill={INK_OUTLINE} />
                <rect x="18" y="15" width="3" height="1" fill={INK_OUTLINE} />
                <rect x="27" y="12" width="3" height="1" fill={INK_OUTLINE} />
                <rect x="27" y="14" width="3" height="2" fill={INK_OUTLINE} />
              </>
            )}
            {config.faceExpression === 'melancholy' && (
              <>
                {/* Slanted downward sad / yearning eyes */}
                <rect x="18" y="13" width="3" height="1" fill={INK_OUTLINE} />
                <rect x="18" y="14" width="4" height="2" fill={INK_OUTLINE} />
                <rect x="27" y="13" width="3" height="1" fill={INK_OUTLINE} />
                <rect x="26" y="14" width="4" height="2" fill={INK_OUTLINE} />
              </>
            )}
            {config.faceExpression === 'focused' && (
              <>
                {/* Determined study brows and focused pupils */}
                <rect x="18" y="13" width="4" height="1" fill={INK_OUTLINE} />
                <rect x="19" y="14" width="2" height="2" fill={INK_OUTLINE} />
                <rect x="26" y="13" width="4" height="1" fill={INK_OUTLINE} />
                <rect x="27" y="14" width="2" height="2" fill={INK_OUTLINE} />
              </>
            )}

            {/* Nose */}
            <rect x="23" y="17" width="2" height="1" fill={INK_OUTLINE} />
            <rect x="24" y="18" width="1" height="1" fill={INK_OUTLINE} />

            {/* Mouth */}
            {config.faceExpression === 'smirk' ? (
              <>
                <rect x="23" y="21" width="3" height="1" fill={INK_OUTLINE} />
                <rect x="25" y="20" width="1" height="1" fill={INK_OUTLINE} />
              </>
            ) : config.faceExpression === 'melancholy' ? (
              <>
                <rect x="22" y="22" width="1" height="1" fill={INK_OUTLINE} />
                <rect x="23" y="21" width="2" height="1" fill={INK_OUTLINE} />
                <rect x="25" y="22" width="1" height="1" fill={INK_OUTLINE} />
              </>
            ) : (
              <rect x="22" y="21" width="4" height="1" fill={INK_OUTLINE} />
            )}

            {/* Facial Details */}
            {config.facialDetails === 'freckles' && (
              <g id="detail-freckles" fill={INK_SHADOW}>
                <rect x="18" y="17" width="1" height="1" />
                <rect x="20" y="18" width="1" height="1" />
                <rect x="27" y="18" width="1" height="1" />
                <rect x="29" y="17" width="1" height="1" />
              </g>
            )}
            {config.facialDetails === 'blush' && (
              <g id="detail-blush" fill="#C47C77">
                <rect x="17" y="17" width="3" height="1" />
                <rect x="18" y="18" width="2" height="1" />
                <rect x="28" y="17" width="3" height="1" />
                <rect x="28" y="18" width="2" height="1" />
              </g>
            )}
            {config.facialDetails === 'under_eye_shadow' && (
              <g id="detail-shadows" fill={INK_SHADOW}>
                <rect x="18" y="16" width="4" height="1" />
                <rect x="26" y="16" width="4" height="1" />
              </g>
            )}
            {config.facialDetails === 'beauty_mark' && (
              <rect x="28" y="20" width="1" height="1" fill={INK_OUTLINE} />
            )}
          </g>

          {/* ========================================================= */}
          {/* LAYER 3: BOTTOMS (TROUSERS & SKIRTS)                      */}
          {/* ========================================================= */}
          <g id="layer-bottoms">
            {config.bottom === 'cargo_pants' && (
              <g id="bottom-cargo">
                {/* Wide relaxed cargo pants with side pockets */}
                <rect x="16" y="47" width="7" height="27" fill={bottomCol} />
                <rect x="25" y="47" width="7" height="27" fill={bottomCol} />
                <rect x="21" y="47" width="6" height="5" fill={bottomCol} />
                {/* Outlines */}
                <rect x="15" y="47" width="1" height="28" fill={INK_OUTLINE} />
                <rect x="23" y="52" width="2" height="22" fill={INK_OUTLINE} />
                <rect x="32" y="47" width="1" height="28" fill={INK_OUTLINE} />
                {/* Cargo Pockets */}
                <rect x="14" y="56" width="2" height="6" fill={bottomCol} />
                <rect x="14" y="56" width="1" height="6" fill={INK_OUTLINE} />
                <rect x="14" y="62" width="2" height="1" fill={INK_OUTLINE} />
                <rect x="32" y="56" width="2" height="6" fill={bottomCol} />
                <rect x="33" y="56" width="1" height="6" fill={INK_OUTLINE} />
                <rect x="32" y="62" width="2" height="1" fill={INK_OUTLINE} />
                {/* Pant Cuffs */}
                <rect x="15" y="74" width="8" height="1" fill={INK_OUTLINE} />
                <rect x="25" y="74" width="8" height="1" fill={INK_OUTLINE} />
              </g>
            )}

            {config.bottom === 'cuffed_jeans' && (
              <g id="bottom-jeans">
                {/* Straight cuffed denim */}
                <rect x="17" y="47" width="6" height="26" fill={bottomCol} />
                <rect x="25" y="47" width="6" height="26" fill={bottomCol} />
                <rect x="22" y="47" width="4" height="4" fill={bottomCol} />
                <rect x="16" y="47" width="1" height="26" fill={INK_OUTLINE} />
                <rect x="23" y="51" width="2" height="22" fill={INK_OUTLINE} />
                <rect x="31" y="47" width="1" height="26" fill={INK_OUTLINE} />
                {/* Turn-up Cuffs (lighter denim fold) */}
                <rect x="17" y="70" width="6" height="3" fill="#DBC4A5" />
                <rect x="25" y="70" width="6" height="3" fill="#DBC4A5" />
                <rect x="16" y="70" width="7" height="1" fill={INK_OUTLINE} />
                <rect x="25" y="70" width="7" height="1" fill={INK_OUTLINE} />
                <rect x="16" y="73" width="7" height="1" fill={INK_OUTLINE} />
                <rect x="25" y="73" width="7" height="1" fill={INK_OUTLINE} />
              </g>
            )}

            {config.bottom === 'pleated_skirt' && (
              <g id="bottom-skirt">
                {/* High-waisted pleated academic skirt */}
                <polygon
                  points="16,46 32,46 35,62 13,62"
                  fill={bottomCol}
                />
                {/* Skirt Outlines & Pleats */}
                <rect x="16" y="46" width="16" height="1" fill={INK_OUTLINE} />
                <rect x="13" y="62" width="22" height="1" fill={INK_OUTLINE} />
                <rect x="18" y="47" width="1" height="15" fill={INK_OUTLINE} />
                <rect x="22" y="47" width="1" height="15" fill={INK_OUTLINE} />
                <rect x="26" y="47" width="1" height="15" fill={INK_OUTLINE} />
                <rect x="30" y="47" width="1" height="15" fill={INK_OUTLINE} />
                {/* Exposed legs under skirt */}
                <rect x="18" y="63" width="4" height="12" fill={skin} />
                <rect x="26" y="63" width="4" height="12" fill={skin} />
              </g>
            )}

            {config.bottom === 'tailored_slacks' && (
              <g id="bottom-slacks">
                {/* Tapered formal trousers with center crease */}
                <rect x="17" y="47" width="6" height="27" fill={bottomCol} />
                <rect x="25" y="47" width="6" height="27" fill={bottomCol} />
                <rect x="22" y="47" width="4" height="4" fill={bottomCol} />
                <rect x="16" y="47" width="1" height="27" fill={INK_OUTLINE} />
                <rect x="23" y="51" width="2" height="23" fill={INK_OUTLINE} />
                <rect x="31" y="47" width="1" height="27" fill={INK_OUTLINE} />
                {/* Center Crease */}
                <rect x="20" y="49" width="1" height="23" fill={INK_SHADOW} />
                <rect x="28" y="49" width="1" height="23" fill={INK_SHADOW} />
                <rect x="16" y="74" width="7" height="1" fill={INK_OUTLINE} />
                <rect x="25" y="74" width="7" height="1" fill={INK_OUTLINE} />
              </g>
            )}
          </g>

          {/* ========================================================= */}
          {/* LAYER 4: SHOES                                            */}
          {/* ========================================================= */}
          <g id="layer-shoes">
            {config.shoes === 'combat_boots' && (
              <g id="shoes-boots">
                {/* Heavy lugged sole combat boots */}
                <rect x="14" y="74" width="8" height="7" fill={shoeCol} />
                <rect x="13" y="79" width="10" height="3" fill={INK_OUTLINE} />
                <rect x="14" y="73" width="7" height="1" fill={INK_OUTLINE} />
                <rect x="26" y="74" width="8" height="7" fill={shoeCol} />
                <rect x="25" y="79" width="10" height="3" fill={INK_OUTLINE} />
                <rect x="27" y="73" width="7" height="1" fill={INK_OUTLINE} />
                {/* Boot eyelets/laces */}
                <rect x="18" y="75" width="2" height="1" fill="#FFF9F3" />
                <rect x="18" y="77" width="2" height="1" fill="#FFF9F3" />
                <rect x="28" y="75" width="2" height="1" fill="#FFF9F3" />
                <rect x="28" y="77" width="2" height="1" fill="#FFF9F3" />
              </g>
            )}

            {config.shoes === 'penny_loafers' && (
              <g id="shoes-loafers">
                <rect x="15" y="75" width="7" height="6" fill={shoeCol} />
                <rect x="14" y="79" width="9" height="2" fill={INK_OUTLINE} />
                <rect x="17" y="76" width="3" height="1" fill="#DBC4A5" />
                <rect x="26" y="75" width="7" height="6" fill={shoeCol} />
                <rect x="25" y="79" width="9" height="2" fill={INK_OUTLINE} />
                <rect x="28" y="76" width="3" height="1" fill="#DBC4A5" />
              </g>
            )}

            {config.shoes === 'retro_sneakers' && (
              <g id="shoes-sneakers">
                {/* Low top canvas skater sneaker */}
                <rect x="14" y="75" width="8" height="4" fill={shoeCol} />
                <rect x="13" y="79" width="10" height="3" fill="#FFF9F3" />
                <rect x="13" y="81" width="10" height="1" fill={INK_OUTLINE} />
                <rect x="26" y="75" width="8" height="4" fill={shoeCol} />
                <rect x="25" y="79" width="10" height="3" fill="#FFF9F3" />
                <rect x="25" y="81" width="10" height="1" fill={INK_OUTLINE} />
              </g>
            )}

            {config.shoes === 'oxford_shoes' && (
              <g id="shoes-oxfords">
                <rect x="15" y="75" width="7" height="5" fill={shoeCol} />
                <rect x="14" y="78" width="9" height="3" fill={INK_OUTLINE} />
                <rect x="26" y="75" width="7" height="5" fill={shoeCol} />
                <rect x="25" y="78" width="9" height="3" fill={INK_OUTLINE} />
              </g>
            )}
          </g>

          {/* ========================================================= */}
          {/* LAYER 5: TOPS                                             */}
          {/* ========================================================= */}
          <g id="layer-tops">
            {config.top === 'oversized_tee' && (
              <g id="top-tee">
                {/* Boxy graphic tee drop shoulder */}
                <rect x="14" y="27" width="20" height="21" fill={topCol} />
                <rect x="10" y="27" width="5" height="12" fill={topCol} />
                <rect x="33" y="27" width="5" height="12" fill={topCol} />
                {/* Outlines */}
                <rect x="13" y="26" width="22" height="1" fill={INK_OUTLINE} />
                <rect x="9" y="27" width="1" height="13" fill={INK_OUTLINE} />
                <rect x="9" y="39" width="5" height="1" fill={INK_OUTLINE} />
                <rect x="38" y="27" width="1" height="13" fill={INK_OUTLINE} />
                <rect x="34" y="39" width="5" height="1" fill={INK_OUTLINE} />
                <rect x="14" y="47" width="20" height="1" fill={INK_OUTLINE} />
                {/* Collar scoop */}
                <rect x="21" y="27" width="6" height="2" fill={skin} />
                <rect x="21" y="28" width="6" height="1" fill={INK_OUTLINE} />
              </g>
            )}

            {config.top === 'turtleneck' && (
              <g id="top-turtleneck">
                {/* High folded roll collar */}
                <rect x="20" y="23" width="8" height="5" fill={topCol} />
                <rect x="19" y="23" width="1" height="5" fill={INK_OUTLINE} />
                <rect x="28" y="23" width="1" height="5" fill={INK_OUTLINE} />
                <rect x="20" y="22" width="8" height="1" fill={INK_OUTLINE} />
                <rect x="14" y="27" width="20" height="20" fill={topCol} />
                <rect x="10" y="28" width="5" height="18" fill={topCol} />
                <rect x="33" y="28" width="5" height="18" fill={topCol} />
                <rect x="13" y="27" width="22" height="1" fill={INK_OUTLINE} />
                <rect x="9" y="28" width="1" height="19" fill={INK_OUTLINE} />
                <rect x="38" y="28" width="1" height="19" fill={INK_OUTLINE} />
                <rect x="14" y="47" width="20" height="1" fill={INK_OUTLINE} />
              </g>
            )}

            {config.top === 'button_oxford' && (
              <g id="top-oxford">
                <rect x="14" y="27" width="20" height="20" fill={topCol} />
                <rect x="10" y="28" width="5" height="18" fill={topCol} />
                <rect x="33" y="28" width="5" height="18" fill={topCol} />
                {/* Collar points */}
                <polygon points="20,27 24,31 24,27" fill="#FCF8F2" stroke={INK_OUTLINE} strokeWidth="0.5" />
                <polygon points="28,27 24,31 24,27" fill="#FCF8F2" stroke={INK_OUTLINE} strokeWidth="0.5" />
                {/* Button placket */}
                <rect x="23" y="31" width="2" height="16" fill={INK_SHADOW} />
                <rect x="23" y="33" width="2" height="1" fill={INK_OUTLINE} />
                <rect x="23" y="38" width="2" height="1" fill={INK_OUTLINE} />
                <rect x="23" y="43" width="2" height="1" fill={INK_OUTLINE} />
                <rect x="14" y="47" width="20" height="1" fill={INK_OUTLINE} />
              </g>
            )}

            {config.top === 'knit_sweater' && (
              <g id="top-sweater">
                <rect x="13" y="27" width="22" height="21" fill={topCol} />
                <rect x="9" y="27" width="5" height="19" fill={topCol} />
                <rect x="34" y="27" width="5" height="19" fill={topCol} />
                {/* Cable knit rib texture */}
                <rect x="18" y="29" width="1" height="18" fill={INK_SHADOW} />
                <rect x="24" y="29" width="1" height="18" fill={INK_SHADOW} />
                <rect x="30" y="29" width="1" height="18" fill={INK_SHADOW} />
                <rect x="13" y="47" width="22" height="1" fill={INK_OUTLINE} />
              </g>
            )}

            {config.top === 'striped_longsleeve' && (
              <g id="top-striped">
                <rect x="14" y="27" width="20" height="20" fill="#FCF8F2" />
                <rect x="10" y="28" width="5" height="18" fill="#FCF8F2" />
                <rect x="33" y="28" width="5" height="18" fill="#FCF8F2" />
                {/* Horizontal Stripes */}
                {[30, 34, 38, 42, 46].map(y => (
                  <React.Fragment key={y}>
                    <rect x="14" y={y} width="20" height="2" fill={topCol} />
                    <rect x="10" y={y} width="5" height="2" fill={topCol} />
                    <rect x="33" y={y} width="5" height="2" fill={topCol} />
                  </React.Fragment>
                ))}
                <rect x="14" y="47" width="20" height="1" fill={INK_OUTLINE} />
              </g>
            )}
          </g>

          {/* ========================================================= */}
          {/* LAYER 6: OUTERWEAR                                        */}
          {/* ========================================================= */}
          <g id="layer-outerwear">
            {config.outerwear === 'cozy_cardigan' && (
              <g id="outer-cardigan">
                {/* Open front slouchy cardigan */}
                <rect x="11" y="26" width="6" height="24" fill={outerCol} />
                <rect x="31" y="26" width="6" height="24" fill={outerCol} />
                <rect x="8" y="27" width="4" height="20" fill={outerCol} />
                <rect x="36" y="27" width="4" height="20" fill={outerCol} />
                {/* Cardigan edge lapels */}
                <rect x="16" y="27" width="1" height="23" fill={INK_OUTLINE} />
                <rect x="31" y="27" width="1" height="23" fill={INK_OUTLINE} />
                <rect x="8" y="47" width="4" height="1" fill={INK_OUTLINE} />
                <rect x="36" y="47" width="4" height="1" fill={INK_OUTLINE} />
              </g>
            )}

            {config.outerwear === 'tweed_blazer' && (
              <g id="outer-blazer">
                {/* Notched lapel academic blazer */}
                <rect x="11" y="26" width="7" height="23" fill={outerCol} />
                <rect x="30" y="26" width="7" height="23" fill={outerCol} />
                <rect x="8" y="27" width="4" height="20" fill={outerCol} />
                <rect x="36" y="27" width="4" height="20" fill={outerCol} />
                {/* Lapel cutouts */}
                <polygon points="18,26 18,34 14,30" fill={outerCol} stroke={INK_OUTLINE} strokeWidth="0.5" />
                <polygon points="30,26 30,34 34,30" fill={outerCol} stroke={INK_OUTLINE} strokeWidth="0.5" />
                <rect x="12" y="42" width="4" height="1" fill={INK_OUTLINE} />
                <rect x="32" y="42" width="4" height="1" fill={INK_OUTLINE} />
              </g>
            )}

            {config.outerwear === 'trench_coat' && (
              <g id="outer-trench">
                {/* Long overcoat stretching down thighs */}
                <rect x="10" y="26" width="8" height="36" fill={outerCol} />
                <rect x="30" y="26" width="8" height="36" fill={outerCol} />
                <rect x="7" y="27" width="4" height="22" fill={outerCol} />
                <rect x="37" y="27" width="4" height="22" fill={outerCol} />
                {/* Trench Belt */}
                <rect x="10" y="45" width="28" height="3" fill={INK_OUTLINE} />
                <rect x="22" y="45" width="4" height="3" fill="#DBC4A5" />
              </g>
            )}

            {config.outerwear === 'denim_jacket' && (
              <g id="outer-denim">
                <rect x="11" y="26" width="6" height="21" fill={outerCol} />
                <rect x="31" y="26" width="6" height="21" fill={outerCol} />
                <rect x="8" y="27" width="4" height="19" fill={outerCol} />
                <rect x="36" y="27" width="4" height="19" fill={outerCol} />
                {/* Chest flap pockets */}
                <rect x="12" y="32" width="4" height="3" fill={INK_SHADOW} />
                <rect x="32" y="32" width="4" height="3" fill={INK_SHADOW} />
              </g>
            )}
          </g>

          {/* ========================================================= */}
          {/* LAYER 7: HAIRSTYLES                                       */}
          {/* ========================================================= */}
          <g id="layer-hair">
            {config.hairStyle === 'shaggy_mess' && (
              <g id="hair-shaggy">
                {/* Indie shaggy curtain bangs with volume on top and sides */}
                <rect x="15" y="5" width="18" height="9" fill={hair} />
                <rect x="13" y="7" width="3" height="14" fill={hair} />
                <rect x="32" y="7" width="3" height="14" fill={hair} />
                {/* Bangs falling over forehead */}
                <rect x="16" y="11" width="3" height="4" fill={hair} />
                <rect x="21" y="10" width="4" height="4" fill={hair} />
                <rect x="27" y="11" width="4" height="4" fill={hair} />
                {/* Shaggy spiky tips */}
                <rect x="12" y="18" width="2" height="3" fill={hair} />
                <rect x="34" y="18" width="2" height="3" fill={hair} />
                <rect x="18" y="4" width="12" height="1" fill={hair} />
              </g>
            )}

            {config.hairStyle === 'poet_curls' && (
              <g id="hair-curls">
                {/* Voluminous textured curls */}
                <rect x="14" y="4" width="20" height="12" fill={hair} />
                <rect x="11" y="7" width="5" height="16" fill={hair} />
                <rect x="32" y="7" width="5" height="16" fill={hair} />
                {/* Curly fringe blocks */}
                <rect x="16" y="12" width="4" height="3" fill={hair} />
                <rect x="22" y="11" width="4" height="3" fill={hair} />
                <rect x="28" y="12" width="4" height="3" fill={hair} />
                {/* Outer curl bumps */}
                <rect x="10" y="11" width="2" height="4" fill={hair} />
                <rect x="36" y="11" width="2" height="4" fill={hair} />
                <rect x="10" y="17" width="2" height="4" fill={hair} />
                <rect x="36" y="17" width="2" height="4" fill={hair} />
              </g>
            )}

            {config.hairStyle === 'classic_bob' && (
              <g id="hair-bob">
                {/* Architectural blunt chin-length bob */}
                <rect x="15" y="5" width="18" height="8" fill={hair} />
                <rect x="13" y="8" width="4" height="16" fill={hair} />
                <rect x="31" y="8" width="4" height="16" fill={hair} />
                {/* Straight blunt fringe */}
                <rect x="16" y="10" width="16" height="3" fill={hair} />
                {/* Sharp bottom edge */}
                <rect x="13" y="23" width="4" height="1" fill={INK_OUTLINE} />
                <rect x="31" y="23" width="4" height="1" fill={INK_OUTLINE} />
              </g>
            )}

            {config.hairStyle === 'wavy_locks' && (
              <g id="hair-wavy">
                {/* Long strands cascading past the shoulders */}
                <rect x="15" y="5" width="18" height="9" fill={hair} />
                <rect x="12" y="7" width="4" height="26" fill={hair} />
                <rect x="32" y="7" width="4" height="26" fill={hair} />
                <rect x="16" y="11" width="5" height="3" fill={hair} />
                <rect x="27" y="11" width="5" height="3" fill={hair} />
                {/* Flowing tips */}
                <rect x="11" y="27" width="3" height="7" fill={hair} />
                <rect x="34" y="27" width="3" height="7" fill={hair} />
              </g>
            )}

            {config.hairStyle === 'side_part' && (
              <g id="hair-sidepart">
                {/* Neat vintage side-parted coif */}
                <rect x="15" y="5" width="18" height="8" fill={hair} />
                <rect x="14" y="8" width="3" height="12" fill={hair} />
                <rect x="31" y="8" width="3" height="9" fill={hair} />
                {/* Sweeping diagonal bang */}
                <polygon points="17,10 28,14 17,14" fill={hair} />
              </g>
            )}

            {config.hairStyle === 'pixie' && (
              <g id="hair-pixie">
                {/* Cropped short pixie cut */}
                <rect x="15" y="5" width="18" height="8" fill={hair} />
                <rect x="14" y="8" width="2" height="7" fill={hair} />
                <rect x="32" y="8" width="2" height="7" fill={hair} />
                <rect x="17" y="10" width="14" height="2" fill={hair} />
              </g>
            )}

            {config.hairStyle === 'slick_back' && (
              <g id="hair-slick">
                {/* Slicked back locks tucked behind ears */}
                <rect x="16" y="5" width="16" height="7" fill={hair} />
                <rect x="14" y="8" width="2" height="12" fill={hair} />
                <rect x="32" y="8" width="2" height="12" fill={hair} />
              </g>
            )}
          </g>

          {/* ========================================================= */}
          {/* LAYER 8: ACCESSORIES & HEADWEAR                           */}
          {/* ========================================================= */}
          <g id="layer-accessories">
            {config.accessories.includes('round_spectacles') && (
              <g id="acc-spectacles">
                {/* Round vintage horn-rim spectacles */}
                <rect x="17" y="13" width="5" height="5" fill="none" stroke={INK_OUTLINE} strokeWidth="1" />
                <rect x="26" y="13" width="5" height="5" fill="none" stroke={INK_OUTLINE} strokeWidth="1" />
                <rect x="22" y="14" width="4" height="1" fill={INK_OUTLINE} />
                {/* Lens glass reflections */}
                <rect x="18" y="14" width="1" height="1" fill="#FFFFFF" />
                <rect x="27" y="14" width="1" height="1" fill="#FFFFFF" />
              </g>
            )}

            {config.accessories.includes('wire_rims') && (
              <g id="acc-wirerims">
                {/* Wire rectangular frames */}
                <rect x="17" y="14" width="5" height="3" fill="none" stroke={INK_OUTLINE} strokeWidth="0.8" />
                <rect x="26" y="14" width="5" height="3" fill="none" stroke={INK_OUTLINE} strokeWidth="0.8" />
                <rect x="22" y="15" width="4" height="0.8" fill={INK_OUTLINE} />
              </g>
            )}

            {config.accessories.includes('over_ear_headphones') && (
              <g id="acc-headphones">
                {/* Retro Walkman headphones with orange/black foam earcups */}
                <rect x="18" y="3" width="12" height="1.5" fill={INK_OUTLINE} />
                <rect x="12" y="12" width="3" height="7" fill="#E2843A" stroke={INK_OUTLINE} strokeWidth="0.8" />
                <rect x="33" y="12" width="3" height="7" fill="#E2843A" stroke={INK_OUTLINE} strokeWidth="0.8" />
              </g>
            )}

            {config.accessories.includes('knit_beanie') && (
              <g id="acc-beanie">
                {/* Fisherman knit beanie pulled low over forehead */}
                <rect x="15" y="2" width="18" height="9" fill="#755151" />
                <rect x="14" y="8" width="20" height="3" fill="#563838" stroke={INK_OUTLINE} strokeWidth="0.8" />
              </g>
            )}

            {config.accessories.includes('french_beret') && (
              <g id="acc-beret">
                {/* Angled artist poet beret with stalk */}
                <ellipse cx="23" cy="5" rx="12" ry="4" fill="#1A1614" />
                <rect x="22" y="1" width="1" height="2" fill="#1A1614" />
              </g>
            )}

            {config.accessories.includes('silver_earring') && (
              <g id="acc-earring">
                <rect x="13" y="18" width="1" height="3" fill="#DCD4C7" />
                <rect x="13" y="21" width="2" height="1" fill="#FFFFFF" />
              </g>
            )}

            {config.accessories.includes('neck_scarf') && (
              <g id="acc-scarf">
                <rect x="20" y="24" width="8" height="4" fill="#755151" />
                <rect x="22" y="28" width="3" height="6" fill="#755151" stroke={INK_OUTLINE} strokeWidth="0.5" />
              </g>
            )}
          </g>

          {/* ========================================================= */}
          {/* LAYER 9: HANDHELD LITERARY PROPS                          */}
          {/* ========================================================= */}
          <g id="layer-props">
            {config.heldItem === 'antique_book' && (
              <g id="prop-book">
                {/* Hardcover volume held in left hand */}
                <rect x="6" y="38" width="7" height="13" fill="#755151" />
                <rect x="5" y="38" width="1" height="13" fill="#DBC4A5" />
                <rect x="6" y="38" width="7" height="1" fill={INK_OUTLINE} />
                <rect x="6" y="50" width="7" height="1" fill={INK_OUTLINE} />
                <rect x="12" y="38" width="1" height="13" fill={INK_OUTLINE} />
                {/* Gold spine title embossing */}
                <rect x="7" y="42" width="4" height="1" fill="#DBC4A5" />
                <rect x="7" y="45" width="3" height="1" fill="#DBC4A5" />
                {/* Hand gripping the book */}
                <rect x="8" y="44" width="3" height="3" fill={skin} stroke={INK_OUTLINE} strokeWidth="0.5" />
              </g>
            )}

            {config.heldItem === 'leather_journal' && (
              <g id="prop-journal">
                {/* Moleskine notebook with elastic band */}
                <rect x="6" y="40" width="6" height="11" fill="#1A1614" />
                <rect x="10" y="40" width="1" height="11" fill="#DBC4A5" />
                <rect x="8" y="45" width="3" height="3" fill={skin} stroke={INK_OUTLINE} strokeWidth="0.5" />
              </g>
            )}

            {config.heldItem === 'steaming_coffee' && (
              <g id="prop-coffee">
                {/* Ceramic diner mug with rising steam */}
                <rect x="35" y="43" width="6" height="7" fill="#FCF8F2" stroke={INK_OUTLINE} strokeWidth="0.8" />
                <rect x="41" y="45" width="2" height="3" fill="none" stroke={INK_OUTLINE} strokeWidth="0.8" />
                <rect x="36" y="44" width="4" height="1" fill="#443223" />
                {/* Steam wisps */}
                <rect x="37" y="40" width="1" height="2" fill="#DBC4A5" />
                <rect x="39" y="38" width="1" height="2" fill="#DBC4A5" />
                {/* Hand holding mug */}
                <rect x="34" y="45" width="3" height="3" fill={skin} stroke={INK_OUTLINE} strokeWidth="0.5" />
              </g>
            )}

            {config.heldItem === 'fountain_pen' && (
              <g id="prop-pen">
                {/* Vintage fountain pen with brass nib */}
                <rect x="36" y="38" width="2" height="12" fill="#1A1614" />
                <polygon points="36,50 38,50 37,53" fill="#DBC4A5" stroke={INK_OUTLINE} strokeWidth="0.5" />
                <rect x="35" y="43" width="3" height="3" fill={skin} />
              </g>
            )}

            {config.heldItem === 'walkman' && (
              <g id="prop-walkman">
                {/* Portable analog cassette player on hip */}
                <rect x="5" y="42" width="6" height="9" fill="#7C7960" stroke={INK_OUTLINE} strokeWidth="0.8" />
                <circle cx="8" cy="45" r="1" fill="#1A1614" />
                <circle cx="8" cy="48" r="1" fill="#1A1614" />
                <rect x="8" y="44" width="3" height="2" fill={skin} />
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};
