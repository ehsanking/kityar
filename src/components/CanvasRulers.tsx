import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPersianDigits } from '../utils/persianNumbers';

export interface SmartSnapLine {
  id: string;
  orientation: 'vertical' | 'horizontal';
  position: number;
  label?: string;
  snapType?: 'center' | 'edge' | 'canvas';
  color?: string;
}

export interface DraggingGuideInfo {
  isActive: boolean;
  x: number;
  y: number;
  width?: number;
  height?: number;
  snapLines?: SmartSnapLine[];
  snapLabel?: string | null;
}

export type RulerUnit = 'px' | 'percent';

export interface CanvasRulersProps {
  width: number;
  height: number;
  unit?: RulerUnit;
  showRulers?: boolean;
  showCrosshairLines?: boolean;
  crosshairColor?: string; // Custom color for crosshair/guides (default: #fbbf24 amber)
  smartGuidesOpacity?: number; // 20 to 100 (percentage)
  smartGuidesThickness?: number; // 1 to 4 (pixels)
  draggingGuide?: DraggingGuideInfo | null;
  children: React.ReactNode;
}

export const CanvasRulers: React.FC<CanvasRulersProps> = ({
  width,
  height,
  unit = 'px',
  showRulers = true,
  showCrosshairLines = true,
  crosshairColor = '#fbbf24',
  smartGuidesOpacity = 90,
  smartGuidesThickness = 2,
  draggingGuide = null,
  children,
}) => {
  if (!showRulers) {
    return <>{children}</>;
  }

  const RULER_THICKNESS = 22; // 22px ruler bar
  const isPercent = unit === 'percent';

  // Normalize opacity to 0.2 - 1.0 range
  const normalizedOpacity = Math.max(0.2, Math.min(1.0, smartGuidesOpacity / 100));
  const safeThickness = Math.max(1, Math.min(6, smartGuidesThickness));

  // Generate ticks for Horizontal Ruler
  const horizontalTicks: { pos: number; isMajor: boolean; label?: string }[] = [];
  if (isPercent) {
    for (let pct = 0; pct <= 100; pct += 5) {
      const pos = Math.round((pct / 100) * width);
      const isMajor = pct % 25 === 0;
      horizontalTicks.push({
        pos,
        isMajor,
        label: isMajor ? `${toPersianDigits(pct)}٪` : undefined,
      });
    }
  } else {
    const MAJOR_STEP = 50;
    const MINOR_STEP = 10;
    for (let i = 0; i <= width; i += MINOR_STEP) {
      const isMajor = i % MAJOR_STEP === 0;
      horizontalTicks.push({
        pos: i,
        isMajor,
        label: isMajor ? toPersianDigits(i) : undefined,
      });
    }
  }

  // Generate ticks for Vertical Ruler
  const verticalTicks: { pos: number; isMajor: boolean; label?: string }[] = [];
  if (isPercent) {
    for (let pct = 0; pct <= 100; pct += 5) {
      const pos = Math.round((pct / 100) * height);
      const isMajor = pct % 25 === 0;
      verticalTicks.push({
        pos,
        isMajor,
        label: isMajor ? `${toPersianDigits(pct)}٪` : undefined,
      });
    }
  } else {
    const MAJOR_STEP = 50;
    const MINOR_STEP = 10;
    for (let i = 0; i <= height; i += MINOR_STEP) {
      const isMajor = i % MAJOR_STEP === 0;
      verticalTicks.push({
        pos: i,
        isMajor,
        label: isMajor ? toPersianDigits(i) : undefined,
      });
    }
  }

  // Dragging metrics
  const isDragging = draggingGuide?.isActive;
  const dragX = draggingGuide?.x ?? 0;
  const dragY = draggingGuide?.y ?? 0;
  const dragW = draggingGuide?.width ?? 0;
  const dragH = draggingGuide?.height ?? 0;
  const dragCenterX = Math.round(dragX + dragW / 2);
  const dragCenterY = Math.round(dragY + dragH / 2);
  const dragRight = dragX + dragW;
  const dragBottom = dragY + dragH;
  const snapLines = draggingGuide?.snapLines || [];

  // Coordinate display strings
  const dragXLabel = isPercent
    ? `X: ${toPersianDigits(Math.round((dragX / width) * 100))}٪`
    : `X: ${toPersianDigits(dragX)}px`;
  const dragYLabel = isPercent
    ? `Y: ${toPersianDigits(Math.round((dragY / height) * 100))}٪`
    : `Y: ${toPersianDigits(dragY)}px`;

  // Check if there is an active crosshair intersection
  const verticalSnap = snapLines.find((l) => l.orientation === 'vertical');
  const horizontalSnap = snapLines.find((l) => l.orientation === 'horizontal');
  const hasCrosshair = isDragging && (verticalSnap || horizontalSnap);
  const crosshairX = verticalSnap ? verticalSnap.position : dragCenterX;
  const crosshairY = horizontalSnap ? horizontalSnap.position : dragCenterY;
  const isFullCrosshair = isDragging && verticalSnap && horizontalSnap;

  return (
    <div className="relative inline-block select-none animate-in fade-in duration-200">
      {/* Top Ruler Bar & Top-Left Origin Corner */}
      <div className="flex">
        {/* Origin Corner (0,0) */}
        <div 
          style={{ width: `${RULER_THICKNESS}px`, height: `${RULER_THICKNESS}px` }}
          className="bg-slate-950 border-r border-b border-slate-800 flex items-center justify-center text-[9px] font-mono font-bold text-amber-400/80 shadow-inner z-20 shrink-0 uppercase"
          title={isPercent ? 'نقطه مبدا بوم (0%, 0%) بر حسب درصد' : 'نقطه مبدا بوم (0, 0) بر حسب پیکسل'}
        >
          {isPercent ? '%' : 'px'}
        </div>

        {/* Horizontal Ruler (X Axis) */}
        <div 
          style={{ width: `${width}px`, height: `${RULER_THICKNESS}px` }}
          className="bg-slate-950/95 border-b border-slate-800 relative overflow-hidden font-mono text-[8px] text-slate-400 shadow-sm z-20"
        >
          <svg className="w-full h-full pointer-events-none">
            {horizontalTicks.map((tick) => (
              <g key={`htick-${tick.pos}`} transform={`translate(${tick.pos}, 0)`}>
                {/* Tick Mark */}
                <line
                  x1={0}
                  y1={tick.isMajor ? 10 : 16}
                  x2={0}
                  y2={22}
                  stroke={tick.isMajor ? '#94a3b8' : '#475569'}
                  strokeWidth={tick.isMajor ? 1.5 : 1}
                />
                {/* Numeric/Percent Label */}
                {tick.label !== undefined && (
                  <text
                    x={2}
                    y={10}
                    fill="#94a3b8"
                    fontSize={isPercent ? 7 : 7.5}
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    {tick.label}
                  </text>
                )}
              </g>
            ))}

            {/* Dynamic Active Drag Projection on Top Ruler */}
            {isDragging && (
              <g style={{ opacity: normalizedOpacity }}>
                {/* Shaded Layer Width Span */}
                <rect
                  x={dragX}
                  y={0}
                  width={Math.max(2, dragW)}
                  height={RULER_THICKNESS}
                  fill="rgba(245, 158, 11, 0.2)"
                  stroke="#f59e0b"
                  strokeWidth={1}
                />

                {/* Left Edge Snap Projection on Axis */}
                <line
                  x1={dragX}
                  y1={0}
                  x2={dragX}
                  y2={RULER_THICKNESS}
                  stroke={crosshairColor}
                  strokeWidth={safeThickness}
                  strokeDasharray="2,2"
                />

                {/* Right Edge Snap Projection on Axis */}
                {dragW > 0 && (
                  <line
                    x1={dragRight}
                    y1={0}
                    x2={dragRight}
                    y2={RULER_THICKNESS}
                    stroke={crosshairColor}
                    strokeWidth={safeThickness}
                    strokeDasharray="2,2"
                  />
                )}

                {/* Center Pin Indicator on Axis */}
                <line
                  x1={dragCenterX}
                  y1={0}
                  x2={dragCenterX}
                  y2={RULER_THICKNESS}
                  stroke={crosshairColor}
                  strokeWidth={safeThickness}
                  strokeDasharray="2,2"
                />

                {/* Thin, Dashed Magnetic Snap Lines on Top Ruler Axis */}
                {snapLines.filter((l) => l.orientation === 'vertical').map((snap) => {
                  const lineColor = snap.color || crosshairColor;
                  return (
                    <g key={`ruler-snap-x-${snap.id}`}>
                      <line
                        x1={snap.position}
                        y1={0}
                        x2={snap.position}
                        y2={RULER_THICKNESS}
                        stroke={lineColor}
                        strokeWidth={safeThickness}
                        strokeDasharray="2,2"
                      />
                      <polygon
                        points={`${snap.position - (safeThickness + 2)},${RULER_THICKNESS} ${snap.position + (safeThickness + 2)},${RULER_THICKNESS} ${snap.position},${RULER_THICKNESS - (safeThickness + 3)}`}
                        fill={lineColor}
                      />
                      <circle
                        cx={snap.position}
                        cy={4}
                        r={safeThickness}
                        fill={lineColor}
                      />
                    </g>
                  );
                })}
              </g>
            )}
          </svg>

          {/* Floating Coordinate Pill on Top Ruler during Drag with Smooth Transition */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                key="top-drag-coord-pill"
                initial={{ opacity: 0, y: -6, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  left: `${Math.min(width - 50, Math.max(0, dragCenterX - 25))}px`,
                }}
                exit={{ opacity: 0, y: -4, scale: 0.9 }}
                transition={{ 
                  left: { type: 'spring', stiffness: 500, damping: 30 },
                  opacity: { duration: 0.15 },
                  y: { duration: 0.15 },
                }}
                style={{ 
                  backgroundColor: crosshairColor,
                }}
                className="absolute top-0 text-slate-950 font-black text-[8px] px-1 py-0.2 rounded-b shadow-md pointer-events-none whitespace-nowrap z-30 font-mono"
              >
                {dragXLabel}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Body: Vertical Ruler + Canvas Stage */}
      <div className="flex">
        {/* Vertical Ruler (Y Axis) */}
        <div 
          style={{ width: `${RULER_THICKNESS}px`, height: `${height}px` }}
          className="bg-slate-950/95 border-r border-slate-800 relative overflow-hidden font-mono text-[8px] text-slate-400 shadow-sm z-20 shrink-0"
        >
          <svg className="w-full h-full pointer-events-none">
            {verticalTicks.map((tick) => (
              <g key={`vtick-${tick.pos}`} transform={`translate(0, ${tick.pos})`}>
                {/* Tick Mark */}
                <line
                  x1={tick.isMajor ? 10 : 16}
                  y1={0}
                  x2={22}
                  y2={0}
                  stroke={tick.isMajor ? '#94a3b8' : '#475569'}
                  strokeWidth={tick.isMajor ? 1.5 : 1}
                />
                {/* Numeric/Percent Label */}
                {tick.label !== undefined && (
                  <text
                    x={2}
                    y={-2}
                    fill="#94a3b8"
                    fontSize={isPercent ? 6.5 : 7.5}
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    {tick.label}
                  </text>
                )}
              </g>
            ))}

            {/* Dynamic Active Drag Projection on Vertical Ruler */}
            {isDragging && (
              <g style={{ opacity: normalizedOpacity }}>
                {/* Shaded Layer Height Span */}
                <rect
                  x={0}
                  y={dragY}
                  width={RULER_THICKNESS}
                  height={Math.max(2, dragH)}
                  fill="rgba(245, 158, 11, 0.2)"
                  stroke="#f59e0b"
                  strokeWidth={1}
                />

                {/* Top Edge Snap Projection on Axis */}
                <line
                  x1={0}
                  y1={dragY}
                  x2={RULER_THICKNESS}
                  y2={dragY}
                  stroke={crosshairColor}
                  strokeWidth={safeThickness}
                  strokeDasharray="2,2"
                />

                {/* Bottom Edge Snap Projection on Axis */}
                {dragH > 0 && (
                  <line
                    x1={0}
                    y1={dragBottom}
                    x2={RULER_THICKNESS}
                    y2={dragBottom}
                    stroke={crosshairColor}
                    strokeWidth={safeThickness}
                    strokeDasharray="2,2"
                  />
                )}

                {/* Center Pin Indicator on Axis */}
                <line
                  x1={0}
                  y1={dragCenterY}
                  x2={RULER_THICKNESS}
                  y2={dragCenterY}
                  stroke={crosshairColor}
                  strokeWidth={safeThickness}
                  strokeDasharray="2,2"
                />

                {/* Thin, Dashed Magnetic Snap Lines on Side Ruler Axis */}
                {snapLines.filter((l) => l.orientation === 'horizontal').map((snap) => {
                  const lineColor = snap.color || crosshairColor;
                  return (
                    <g key={`ruler-snap-y-${snap.id}`}>
                      <line
                        x1={0}
                        y1={snap.position}
                        x2={RULER_THICKNESS}
                        y2={snap.position}
                        stroke={lineColor}
                        strokeWidth={safeThickness}
                        strokeDasharray="2,2"
                      />
                      <polygon
                        points={`${RULER_THICKNESS},${snap.position - (safeThickness + 2)} ${RULER_THICKNESS},${snap.position + (safeThickness + 2)} ${RULER_THICKNESS - (safeThickness + 3)},${snap.position}`}
                        fill={lineColor}
                      />
                      <circle
                        cx={4}
                        cy={snap.position}
                        r={safeThickness}
                        fill={lineColor}
                      />
                    </g>
                  );
                })}
              </g>
            )}
          </svg>

          {/* Floating Coordinate Pill on Vertical Ruler during Drag with Smooth Transition */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                key="vertical-drag-coord-pill"
                initial={{ opacity: 0, x: -6, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  top: `${Math.min(height - 20, Math.max(0, dragCenterY - 8))}px`,
                }}
                exit={{ opacity: 0, x: -4, scale: 0.9 }}
                transition={{ 
                  top: { type: 'spring', stiffness: 500, damping: 30 },
                  opacity: { duration: 0.15 },
                  x: { duration: 0.15 },
                }}
                style={{ 
                  backgroundColor: crosshairColor,
                }}
                className="absolute left-0 text-slate-950 font-black text-[7.5px] px-0.5 py-0.2 rounded-r shadow-md pointer-events-none whitespace-nowrap z-30 font-mono"
              >
                {dragYLabel}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Canvas Area Container */}
        <div className="relative">
          {children}

          {/* Dynamic Smart Snapping Lines & Visual Crosshairs Across Canvas during Layer Drag */}
          <AnimatePresence>
            {isDragging && showCrosshairLines && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: normalizedOpacity }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute inset-0 pointer-events-none z-40 overflow-hidden"
              >
                {/* Active Smart Snap Lines with Smooth Slide & Fade In Transition */}
                <AnimatePresence>
                  {snapLines.map((line) => {
                    const isVert = line.orientation === 'vertical';
                    const isCenter = line.snapType === 'center';
                    const isCanvasEdge = line.snapType === 'canvas';
                    const color = line.color || (isCenter ? crosshairColor : isCanvasEdge ? '#06b6d4' : '#10b981');

                    if (isVert) {
                      return (
                        <motion.div
                          key={`snap-v-${line.id}`}
                          initial={{ opacity: 0, scaleY: 0.7 }}
                          animate={{ 
                            opacity: 1, 
                            scaleY: 1,
                            left: `${line.position}px`,
                          }}
                          exit={{ opacity: 0, scaleY: 0.8 }}
                          transition={{ 
                            left: { type: 'spring', stiffness: 600, damping: 35 },
                            opacity: { duration: 0.12 },
                            scaleY: { duration: 0.15 },
                          }}
                          className="absolute top-0 bottom-0 pointer-events-none origin-center"
                        >
                          <div
                            className={`w-0 h-full ${
                              isCenter ? 'border-dashed' : isCanvasEdge ? 'border-solid' : 'border-solid'
                            }`}
                            style={{
                              borderLeftWidth: `${isCanvasEdge ? safeThickness + 1 : safeThickness}px`,
                              borderLeftStyle: isCenter ? 'dashed' : 'solid',
                              borderLeftColor: color,
                              boxShadow: isCanvasEdge ? `0 0 16px ${color}, 0 0 6px #ffffff` : `0 0 12px ${color}`,
                            }}
                          />

                          {line.label && (
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.85 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              className="absolute top-2 -translate-x-1/2 bg-slate-950/95 font-sans text-[9px] font-bold px-2.5 py-0.8 rounded-full border shadow-xl whitespace-nowrap flex items-center gap-1.5 z-50 backdrop-blur-md"
                              style={{
                                color: color,
                                borderColor: `${color}aa`,
                                boxShadow: `0 0 12px ${color}55`,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: color }} />
                              {isCanvasEdge && <span className="text-[10px]">⊞</span>}
                              <span>{line.label}</span>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    } else {
                      return (
                        <motion.div
                          key={`snap-h-${line.id}`}
                          initial={{ opacity: 0, scaleX: 0.7 }}
                          animate={{ 
                            opacity: 1, 
                            scaleX: 1,
                            top: `${line.position}px`,
                          }}
                          exit={{ opacity: 0, scaleX: 0.8 }}
                          transition={{ 
                            top: { type: 'spring', stiffness: 600, damping: 35 },
                            opacity: { duration: 0.12 },
                            scaleX: { duration: 0.15 },
                          }}
                          className="absolute left-0 right-0 pointer-events-none origin-center"
                        >
                          <div
                            className={`w-full h-0 ${
                              isCenter ? 'border-dashed' : isCanvasEdge ? 'border-solid' : 'border-solid'
                            }`}
                            style={{
                              borderTopWidth: `${isCanvasEdge ? safeThickness + 1 : safeThickness}px`,
                              borderTopStyle: isCenter ? 'dashed' : 'solid',
                              borderTopColor: color,
                              boxShadow: isCanvasEdge ? `0 0 16px ${color}, 0 0 6px #ffffff` : `0 0 12px ${color}`,
                            }}
                          />

                          {line.label && (
                            <motion.div
                              initial={{ opacity: 0, x: 8, scale: 0.8 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              exit={{ opacity: 0, x: 4, scale: 0.85 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              className="absolute right-2 -translate-y-1/2 bg-slate-950/95 font-sans text-[9px] font-bold px-2.5 py-0.8 rounded-full border shadow-xl whitespace-nowrap flex items-center gap-1.5 z-50 backdrop-blur-md"
                              style={{
                                color: color,
                                borderColor: `${color}aa`,
                                boxShadow: `0 0 12px ${color}55`,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: color }} />
                              {isCanvasEdge && <span className="text-[10px]">⊞</span>}
                              <span>{line.label}</span>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    }
                  })}
                </AnimatePresence>

                {/* Visual Crosshair Reticle when Aligned with Center with Spring Physics */}
                <AnimatePresence>
                  {hasCrosshair && (
                    <motion.div
                      key="center-crosshair-reticle"
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        left: `${crosshairX}px`,
                        top: `${crosshairY}px`,
                      }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{ 
                        left: { type: 'spring', stiffness: 500, damping: 30 },
                        top: { type: 'spring', stiffness: 500, damping: 30 },
                        opacity: { duration: 0.15 },
                        scale: { type: 'spring', stiffness: 450, damping: 22 },
                      }}
                      className="absolute pointer-events-none z-50"
                    >
                      <div 
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center animate-pulse"
                        style={{ 
                          borderWidth: `${safeThickness}px`,
                          borderColor: crosshairColor,
                          backgroundColor: `${crosshairColor}22`,
                          boxShadow: `0 0 16px ${crosshairColor}`,
                        }}
                      >
                        <div 
                          className="rounded-full shadow-sm"
                          style={{ 
                            width: `${safeThickness + 1}px`, 
                            height: `${safeThickness + 1}px`,
                            backgroundColor: crosshairColor,
                          }} 
                        />
                      </div>

                      {isFullCrosshair && (
                        <motion.div 
                          initial={{ opacity: 0, y: 8, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.85 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className="absolute -top-7 -translate-x-1/2 text-slate-950 font-black text-[8px] px-2 py-0.5 rounded-full border shadow-2xl whitespace-nowrap flex items-center gap-1 backdrop-blur-md animate-bounce"
                          style={{
                            backgroundColor: crosshairColor,
                            borderColor: '#ffffff88',
                          }}
                        >
                          <span>✛</span>
                          <span>تقارن مرکزی کامل</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Default Bounding Box Edge Projections with Smooth Fade & Glide */}
                <AnimatePresence>
                  {snapLines.length === 0 && (
                    <motion.div
                      key="default-projections"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.div
                        className="absolute top-0 bottom-0 border-l border-dashed"
                        animate={{ left: `${dragCenterX}px` }}
                        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                        style={{ 
                          borderLeftWidth: `${safeThickness}px`,
                          borderLeftColor: `${crosshairColor}66`,
                        }}
                      />
                      <motion.div
                        className="absolute left-0 right-0 border-t border-dashed"
                        animate={{ top: `${dragCenterY}px` }}
                        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                        style={{ 
                          borderTopWidth: `${safeThickness}px`,
                          borderTopColor: `${crosshairColor}66`,
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CanvasRulers;
