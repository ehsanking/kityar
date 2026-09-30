import React from 'react';
import { motion } from 'framer-motion';
import ZhaketLogo, { ZhaketLogoConfig } from './ZhaketLogo';

interface RenderPlacedLogoProps {
  config: ZhaketLogoConfig;
  className?: string;
  isDraggable?: boolean;
}

export const RenderPlacedLogo: React.FC<RenderPlacedLogoProps> = ({
  config,
  className = '',
  isDraggable = true,
}) => {
  if (!config.enabled) return null;

  // Placement class
  let positionStyleClass = '';
  switch (config.placement) {
    case 'top-left':
      positionStyleClass = 'top-3.5 left-3.5';
      break;
    case 'top-center':
      positionStyleClass = 'top-3.5 left-1/2 -translate-x-1/2';
      break;
    case 'bottom-right':
      positionStyleClass = 'bottom-3.5 right-3.5';
      break;
    case 'bottom-left':
      positionStyleClass = 'bottom-3.5 left-3.5';
      break;
    case 'top-right':
    default:
      positionStyleClass = 'top-3.5 right-3.5';
      break;
  }

  const logoContent = (
    <ZhaketLogo
      backdrop={config.backdrop}
      customLogoUrl={config.customLogoUrl}
      sizePx={config.customSizePx || 52}
      logoWidthPx={config.logoWidthPx}
      boxPaddingPx={config.boxPaddingPx}
      boxRadiusPx={config.boxRadiusPx}
      boxBorderWidth={config.boxBorderWidth}
      boxBorderColor={config.boxBorderColor}
      boxBgColor={config.boxBgColor}
    />
  );

  const customOffsetStyle: React.CSSProperties = {};
  if (config.placement === 'custom' || config.xOffset !== 0 || config.yOffset !== 0) {
    if (config.xOffset) customOffsetStyle.transform = `translate(${config.xOffset}px, ${config.yOffset}px)`;
  }

  if (isDraggable) {
    return (
      <motion.div
        drag
        dragMomentum={false}
        style={customOffsetStyle}
        className={`absolute z-30 cursor-grab active:cursor-grabbing select-none ${positionStyleClass} ${className}`}
        title="لوگوی ژاکت — برای جابجایی می‌توانید آن را درگ کنید"
      >
        {logoContent}
      </motion.div>
    );
  }

  return (
    <div style={customOffsetStyle} className={`absolute z-30 select-none ${positionStyleClass} ${className}`}>
      {logoContent}
    </div>
  );
};

export default RenderPlacedLogo;
