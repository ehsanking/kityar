import React from 'react';
import { motion } from 'framer-motion';
import { CanvasLayerItem } from '../types/canvasLayers';
import { sanitizeSvg } from '../utils/sanitizeSvg';

interface DynamicVectorRendererProps {
  layer: CanvasLayerItem;
  isSelected?: boolean;
  onSelect?: () => void;
  isInteractive?: boolean;
}

export const DynamicVectorRenderer: React.FC<DynamicVectorRendererProps> = ({
  layer,
  isSelected = false,
  onSelect,
  isInteractive = true,
}) => {
  if (!layer.visible) return null;

  const data = layer.data || {};
  const svgCode = data.svgCode;
  const imageUrl = data.imageUrl;

  // Flips & scale
  const scaleX = (layer.scale || 1) * (layer.flipHorizontal ? -1 : 1);
  const scaleY = (layer.scale || 1) * (layer.flipVertical ? -1 : 1);

  // Filters & shadows
  const filters: string[] = [];
  if (layer.blur && layer.blur > 0) filters.push(`blur(${layer.blur}px)`);
  if (layer.brightness !== undefined && layer.brightness !== 100) filters.push(`brightness(${layer.brightness}%)`);
  if (layer.contrast !== undefined && layer.contrast !== 100) filters.push(`contrast(${layer.contrast}%)`);
  if (layer.shadow && layer.shadow.enabled) {
    filters.push(`drop-shadow(${layer.shadow.x}px ${layer.shadow.y}px ${layer.shadow.blur}px ${layer.shadow.color})`);
  }

  const transformStyle: React.CSSProperties = {
    transform: `rotate(${layer.rotation || 0}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
    opacity: (layer.opacity ?? 100) / 100,
    mixBlendMode: layer.blendMode || 'normal',
    filter: filters.length > 0 ? filters.join(' ') : undefined,
    borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : undefined,
    border: layer.border && layer.border.enabled ? `${layer.border.width}px solid ${layer.border.color}` : undefined,
  };

  const content = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      style={transformStyle}
      className={`transition-all duration-150 relative cursor-grab active:cursor-grabbing p-1 ${
        isSelected ? 'ring-2 ring-purple-400 rounded-xl' : ''
      }`}
    >
      {isSelected && (
        <div className="absolute -top-6 right-0 bg-purple-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-md z-30 pointer-events-none whitespace-nowrap">
          {layer.name}
        </div>
      )}
      {svgCode ? (
        <div
          className="w-32 h-32 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full drop-shadow-xl select-none"
          dangerouslySetInnerHTML={{ __html: sanitizeSvg(svgCode) }}
        />
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt="AI Visual Layer"
          className="w-32 h-32 object-contain drop-shadow-xl rounded-xl pointer-events-none select-none"
        />
      ) : null}
    </div>
  );

  if (isInteractive && !layer.locked) {
    return (
      <motion.div
        drag
        dragMomentum={false}
        className="absolute z-20"
        style={{ left: layer.x || 0, top: layer.y || 0 }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{ left: layer.x || 0, top: layer.y || 0 }}
    >
      {content}
    </div>
  );
};

export default DynamicVectorRenderer;
