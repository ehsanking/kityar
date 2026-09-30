import React, { useRef, useState, useEffect } from 'react';
import { 
  Smartphone, Monitor, Box, Sparkles, Zap, 
  ShieldCheck, ShoppingBag, Eye, Globe, CreditCard,
  Flame, Percent, Star, Award, CheckCircle2, Lock, Gift,
  TrendingUp, DollarSign, QrCode, Move, Sparkle,
  Rocket, Crown, Heart, ThumbsUp, CircleDot,
  MousePointer, ShoppingCart, Briefcase, Palette, Wallet, Cloud, Truck, Layers, Crosshair,
  Apple, Play, Bell, Touchpad, BatteryCharging, Wifi
} from 'lucide-react';
import { CanvasLayerItem, LayerType } from '../types/canvasLayers';
import { DraggingGuideInfo, SmartSnapLine } from './CanvasRulers';
import { VECTOR_ICON_COMPONENTS } from '../data/vectorIcons';
import { toPersianDigits } from '../utils/persianNumbers';
import { sanitizeSvg } from '../utils/sanitizeSvg';
import { fillTemplate, selectVars, useTemplateVars } from '../features/batch/template';

interface DynamicLayerRendererProps {
  layer: CanvasLayerItem;
  otherLayers?: CanvasLayerItem[];
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdateLayer?: (layerId: string, updates: Partial<CanvasLayerItem>) => void;
  onUpdateLayerData?: (layerId: string, newData: any) => void;
  onUpdatePosition?: (layerId: string, x: number, y: number) => void;
  onOpenContextMenu?: (x: number, y: number, layer: CanvasLayerItem) => void;
  isInteractive?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  enableMagneticSnap?: boolean;
  gridSnapSize?: number;
  onDragStateChange?: (info: DraggingGuideInfo | null) => void;
}

// Icon mapper for icon-library layers
const ICON_COMPONENTS: Record<string, React.FC<{ className?: string }>> = {
  ShoppingBag, CreditCard, Tag: ShoppingBag, Percent, DollarSign, Gift, TrendingUp,
  ShieldCheck, Lock, Award, CheckCircle2, Star, Zap, Flame,
  Cpu: Sparkles, Database: Box, Server: Monitor, Sparkles,
  Download: Box, Globe, QrCode, Heart: Sparkle, Key: Lock,
};

export const DynamicLayerRenderer: React.FC<DynamicLayerRendererProps> = ({
  layer,
  otherLayers = [],
  isSelected = false,
  onSelect,
  onUpdateLayer,
  onUpdateLayerData,
  onUpdatePosition,
  onOpenContextMenu,
  isInteractive = true,
  canvasWidth = 340,
  canvasHeight = 340,
  enableMagneticSnap = true,
  gridSnapSize = 1,
  onDragStateChange,
}) => {
  if (!layer.visible) return null;

  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [transformHUD, setTransformHUD] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [snapGuide, setSnapGuide] = useState<{
    guideX: number | null;
    guideY: number | null;
    label: string | null;
  }>({ guideX: null, guideY: null, label: null });

  // Effective coordinates (realtime drag position or saved layer position)
  const displayX = dragPos ? dragPos.x : (layer.x || 0);
  const displayY = dragPos ? dragPos.y : (layer.y || 0);

  // --- INTERACTIVE RESIZING HANDLER (Corner & Edge Handles Drag) ---
  const handleResizePointerDown = (corner: 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r', e: React.PointerEvent) => {
    if (!isInteractive || layer.locked || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect?.();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialScale = layer.scale ?? 1;
    const data = layer.data || {};
    const initialFontSize = Number(data.fontSize) || 20;
    const initialLogoSize = Number(data.logoSize) || Number(data.customSizePx) || 48;
    const initialWidth = Number(data.width) || 120;
    const initialHeight = Number(data.height) || 70;

    setIsResizing(true);

    const onPointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - startX;
      const deltaY = moveEv.clientY - startY;

      let distance = 0;
      if (corner === 'br') distance = (deltaX + deltaY) / 2;
      else if (corner === 'tl') distance = (-deltaX - deltaY) / 2;
      else if (corner === 'tr') distance = (deltaX - deltaY) / 2;
      else if (corner === 'bl') distance = (-deltaX + deltaY) / 2;
      else if (corner === 'r') distance = deltaX;
      else if (corner === 'l') distance = -deltaX;
      else if (corner === 'b') distance = deltaY;
      else if (corner === 't') distance = -deltaY;

      const isLockedRatio = data.lockAspectRatio === true || (layer as any).lockAspectRatio === true || moveEv.shiftKey;

      if (layer.type === 'text') {
        const nextFontSize = Math.max(10, Math.min(140, Math.round(initialFontSize + distance / 4)));
        onUpdateLayerData?.(layer.id, { fontSize: nextFontSize });
        setTransformHUD(`اندازه قلم: ${toPersianDigits(nextFontSize)}px`);
      } else if (layer.type === 'logo') {
        const nextLogoSize = Math.max(16, Math.min(260, Math.round(initialLogoSize + distance / 2)));
        onUpdateLayerData?.(layer.id, { logoSize: nextLogoSize, customSizePx: nextLogoSize });
        setTransformHUD(`سایز لوگو: ${toPersianDigits(nextLogoSize)}px`);
      } else if (data.width || data.height) {
        let nextWidth = Math.max(16, Math.round(initialWidth + deltaX));
        let nextHeight = Math.max(16, Math.round(initialHeight + deltaY));

        if (isLockedRatio && initialWidth > 0 && initialHeight > 0) {
          const aspectRatio = initialWidth / initialHeight;
          if (corner === 'tl' || corner === 'tr' || corner === 'bl' || corner === 'br') {
            const scaleFactor = 1 + distance / Math.max(initialWidth, initialHeight);
            nextWidth = Math.max(16, Math.round(initialWidth * scaleFactor));
            nextHeight = Math.max(16, Math.round(nextWidth / aspectRatio));
          } else if (corner === 'r' || corner === 'l') {
            nextHeight = Math.max(16, Math.round(nextWidth / aspectRatio));
          } else if (corner === 't' || corner === 'b') {
            nextWidth = Math.max(16, Math.round(nextHeight * aspectRatio));
          }
        }

        onUpdateLayerData?.(layer.id, { width: nextWidth, height: nextHeight });
        setTransformHUD(`ابعاد ${isLockedRatio ? '🔗' : ''}: ${toPersianDigits(nextWidth)} × ${toPersianDigits(nextHeight)} px`);
      } else {
        const scaleDelta = distance / 100;
        const nextScale = Math.max(0.2, Math.min(4.0, Number((initialScale + scaleDelta).toFixed(2))));
        onUpdateLayer?.(layer.id, { scale: nextScale });
        setTransformHUD(`مقیاس ${isLockedRatio ? '🔗' : ''}: ${toPersianDigits(Math.round(nextScale * 100))}٪`);
      }
    };

    const onPointerUp = () => {
      setIsResizing(false);
      setTransformHUD(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // --- INTERACTIVE ROTATION HANDLER (Top Stem Knob Drag) ---
  const handleRotatePointerDown = (e: React.PointerEvent) => {
    if (!isInteractive || layer.locked || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect?.();

    if (!elementRef.current) return;
    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setIsRotating(true);

    const onPointerMove = (moveEv: PointerEvent) => {
      const radians = Math.atan2(moveEv.clientY - centerY, moveEv.clientX - centerX);
      let degrees = Math.round(radians * (180 / Math.PI) + 90);
      if (degrees > 180) degrees -= 360;
      if (degrees < -180) degrees += 360;

      const SNAP_ANGLES = [0, 45, 90, 135, 180, -45, -90, -135, -180];
      for (const sa of SNAP_ANGLES) {
        if (Math.abs(degrees - sa) <= 4) {
          degrees = sa;
          break;
        }
      }

      onUpdateLayer?.(layer.id, { rotation: degrees });
      setTransformHUD(`زاویه چرخش: ${toPersianDigits(degrees)}°`);
    };

    const onPointerUp = () => {
      setIsRotating(false);
      setTransformHUD(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Keyboard Nudge (Pixel-perfect micro adjustments with Arrow keys)
  useEffect(() => {
    if (!isSelected || !isInteractive || layer.locked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
         activeEl.tagName === 'TEXTAREA' ||
         activeEl.isContentEditable)
      ) {
        return;
      }

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : (e.altKey ? 5 : 1);
        let nextX = layer.x || 0;
        let nextY = layer.y || 0;

        if (e.key === 'ArrowLeft') nextX -= step;
        if (e.key === 'ArrowRight') nextX += step;
        if (e.key === 'ArrowUp') nextY -= step;
        if (e.key === 'ArrowDown') nextY += step;

        onUpdatePosition?.(layer.id, nextX, nextY);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, isInteractive, layer.locked, layer.x, layer.y, layer.id, onUpdatePosition]);

  // Pointer Drag Handler with Dynamic Multi-Layer Smart Alignment Snapping
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isInteractive || layer.locked || e.button !== 0) return;

    const target = e.target as HTMLElement;
    if (target.isContentEditable || target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    onSelect?.();

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const initialLayerX = layer.x || 0;
    const initialLayerY = layer.y || 0;

    const elWidth = elementRef.current?.offsetWidth || 100;
    const elHeight = elementRef.current?.offsetHeight || 60;

    // Gather geometry of other visible layers on the canvas for dynamic smart snapping
    const otherBounds = (otherLayers || [])
      .filter((o) => o.id !== layer.id && o.visible !== false)
      .map((o) => {
        const domEl = document.querySelector(`[data-layer-id="${o.id}"]`) as HTMLElement | null;
        const w = domEl ? domEl.offsetWidth : (Number(o.data?.width) || 120);
        const h = domEl ? domEl.offsetHeight : (Number(o.data?.height) || 50);
        const ox = o.x || 0;
        const oy = o.y || 0;
        return {
          id: o.id,
          name: o.name || 'لایه',
          left: ox,
          centerX: Math.round(ox + w / 2),
          right: ox + w,
          top: oy,
          centerY: Math.round(oy + h / 2),
          bottom: oy + h,
          width: w,
          height: h,
        };
      });

    let currentCalculatedX = initialLayerX;
    let currentCalculatedY = initialLayerY;

    setIsDragging(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startPointerX;
      const deltaY = moveEvent.clientY - startPointerY;

      let nextX = Math.round(initialLayerX + deltaX);
      let nextY = Math.round(initialLayerY + deltaY);

      const SNAP_THRESHOLD = 5; // Exactly 5px as requested
      const activeSnapLines: SmartSnapLine[] = [];
      let snapLabel: string | null = null;
      let primaryGuideX: number | null = null;
      let primaryGuideY: number | null = null;

      if (enableMagneticSnap) {
        const curLeft = nextX;
        const curCenterX = Math.round(nextX + elWidth / 2);
        const curRight = nextX + elWidth;
        const curTop = nextY;
        const curCenterY = Math.round(nextY + elHeight / 2);
        const curBottom = nextY + elHeight;

        let snappedX = false;
        let snappedY = false;

        // 1. HORIZONTAL SNAPPING: Center & Edges of other layers
        for (const other of otherBounds) {
          if (snappedX) break;

          // Center-to-Center snap (Vertical guideline down the center)
          if (Math.abs(curCenterX - other.centerX) <= SNAP_THRESHOLD) {
            nextX = other.centerX - Math.round(elWidth / 2);
            activeSnapLines.push({
              id: `snap-cx-${other.id}`,
              orientation: 'vertical',
              position: other.centerX,
              label: `تراز مرکز با ${other.name}`,
              snapType: 'center',
              color: '#ec4899',
            });
            primaryGuideX = other.centerX;
            snapLabel = `تراز مرکز با «${other.name}»`;
            snappedX = true;
          }
          // Left-to-Left edge snap
          else if (Math.abs(curLeft - other.left) <= SNAP_THRESHOLD) {
            nextX = other.left;
            activeSnapLines.push({
              id: `snap-ll-${other.id}`,
              orientation: 'vertical',
              position: other.left,
              label: `انطباق چپ با ${other.name}`,
              snapType: 'edge',
              color: '#06b6d4',
            });
            primaryGuideX = other.left;
            snapLabel = `انطباق چپ با «${other.name}»`;
            snappedX = true;
          }
          // Right-to-Right edge snap
          else if (Math.abs(curRight - other.right) <= SNAP_THRESHOLD) {
            nextX = other.right - elWidth;
            activeSnapLines.push({
              id: `snap-rr-${other.id}`,
              orientation: 'vertical',
              position: other.right,
              label: `انطباق راست با ${other.name}`,
              snapType: 'edge',
              color: '#06b6d4',
            });
            primaryGuideX = other.right;
            snapLabel = `انطباق راست با «${other.name}»`;
            snappedX = true;
          }
          // Adjacent Left-to-Right snap
          else if (Math.abs(curLeft - other.right) <= SNAP_THRESHOLD) {
            nextX = other.right;
            activeSnapLines.push({
              id: `snap-lr-${other.id}`,
              orientation: 'vertical',
              position: other.right,
              label: `چسبیدن به راست ${other.name}`,
              snapType: 'edge',
              color: '#10b981',
            });
            primaryGuideX = other.right;
            snapLabel = `چسبیدن به راست «${other.name}»`;
            snappedX = true;
          }
          // Adjacent Right-to-Left snap
          else if (Math.abs(curRight - other.left) <= SNAP_THRESHOLD) {
            nextX = other.left - elWidth;
            activeSnapLines.push({
              id: `snap-rl-${other.id}`,
              orientation: 'vertical',
              position: other.left,
              label: `چسبیدن به چپ ${other.name}`,
              snapType: 'edge',
              color: '#10b981',
            });
            primaryGuideX = other.left;
            snapLabel = `چسبیدن به چپ «${other.name}»`;
            snappedX = true;
          }
        }

        // Horizontal Snap against Canvas Boundaries, Safe Margins & Canvas Center
        if (!snappedX && canvasWidth) {
          const canvasCenterX = Math.round(canvasWidth / 2);
          const SAFE_MARGIN = canvasWidth >= 300 ? 16 : 8;

          // 1. Center of Canvas
          if (Math.abs(curCenterX - canvasCenterX) <= SNAP_THRESHOLD) {
            nextX = canvasCenterX - Math.round(elWidth / 2);
            activeSnapLines.push({
              id: 'snap-canvas-cx',
              orientation: 'vertical',
              position: canvasCenterX,
              label: 'مرکز افقی بوم',
              snapType: 'center',
              color: '#ec4899',
            });
            primaryGuideX = canvasCenterX;
            snapLabel = 'مرکز افقی بوم';
            snappedX = true;
          } 
          // 2. Left Edge of Canvas Container (0px)
          else if (Math.abs(curLeft - 0) <= SNAP_THRESHOLD + 2) {
            nextX = 0;
            activeSnapLines.push({
              id: 'snap-canvas-l',
              orientation: 'vertical',
              position: 0,
              label: 'لبه چپ کانتینر بوم (0px)',
              snapType: 'canvas',
              color: '#06b6d4',
            });
            primaryGuideX = 0;
            snapLabel = 'انطباق با لبه چپ بوم';
            snappedX = true;
          } 
          // 3. Right Edge of Canvas Container (Width)
          else if (Math.abs(curRight - canvasWidth) <= SNAP_THRESHOLD + 2) {
            nextX = canvasWidth - elWidth;
            activeSnapLines.push({
              id: 'snap-canvas-r',
              orientation: 'vertical',
              position: canvasWidth,
              label: `لبه راست کانتینر بوم (${canvasWidth}px)`,
              snapType: 'canvas',
              color: '#06b6d4',
            });
            primaryGuideX = canvasWidth;
            snapLabel = 'انطباق با لبه راست بوم';
            snappedX = true;
          }
          // 4. Safe Margin Left
          else if (Math.abs(curLeft - SAFE_MARGIN) <= SNAP_THRESHOLD) {
            nextX = SAFE_MARGIN;
            activeSnapLines.push({
              id: 'snap-canvas-margin-l',
              orientation: 'vertical',
              position: SAFE_MARGIN,
              label: `حاشیه امن چپ (${SAFE_MARGIN}px)`,
              snapType: 'canvas',
              color: '#10b981',
            });
            primaryGuideX = SAFE_MARGIN;
            snapLabel = `حاشیه امن چپ (${SAFE_MARGIN}px)`;
            snappedX = true;
          }
          // 5. Safe Margin Right
          else if (Math.abs(curRight - (canvasWidth - SAFE_MARGIN)) <= SNAP_THRESHOLD) {
            nextX = canvasWidth - SAFE_MARGIN - elWidth;
            activeSnapLines.push({
              id: 'snap-canvas-margin-r',
              orientation: 'vertical',
              position: canvasWidth - SAFE_MARGIN,
              label: `حاشیه امن راست (${canvasWidth - SAFE_MARGIN}px)`,
              snapType: 'canvas',
              color: '#10b981',
            });
            primaryGuideX = canvasWidth - SAFE_MARGIN;
            snapLabel = `حاشیه امن راست (${SAFE_MARGIN}px)`;
            snappedX = true;
          }
        }

        // 2. VERTICAL SNAPPING: Center & Edges of other layers
        for (const other of otherBounds) {
          if (snappedY) break;

          // Center-to-Center snap (Horizontal guideline across the center)
          if (Math.abs(curCenterY - other.centerY) <= SNAP_THRESHOLD) {
            nextY = other.centerY - Math.round(elHeight / 2);
            activeSnapLines.push({
              id: `snap-cy-${other.id}`,
              orientation: 'horizontal',
              position: other.centerY,
              label: `تراز مرکز با ${other.name}`,
              snapType: 'center',
              color: '#ec4899',
            });
            primaryGuideY = other.centerY;
            snapLabel = snapLabel ? `${snapLabel} | تراز مرکز عمودی` : `تراز مرکز با «${other.name}»`;
            snappedY = true;
          }
          // Top-to-Top edge snap
          else if (Math.abs(curTop - other.top) <= SNAP_THRESHOLD) {
            nextY = other.top;
            activeSnapLines.push({
              id: `snap-tt-${other.id}`,
              orientation: 'horizontal',
              position: other.top,
              label: `انطباق بالا با ${other.name}`,
              snapType: 'edge',
              color: '#06b6d4',
            });
            primaryGuideY = other.top;
            snapLabel = snapLabel || `انطباق بالا با «${other.name}»`;
            snappedY = true;
          }
          // Bottom-to-Bottom edge snap
          else if (Math.abs(curBottom - other.bottom) <= SNAP_THRESHOLD) {
            nextY = other.bottom - elHeight;
            activeSnapLines.push({
              id: `snap-bb-${other.id}`,
              orientation: 'horizontal',
              position: other.bottom,
              label: `انطباق پایین با ${other.name}`,
              snapType: 'edge',
              color: '#06b6d4',
            });
            primaryGuideY = other.bottom;
            snapLabel = snapLabel || `انطباق پایین با «${other.name}»`;
            snappedY = true;
          }
          // Adjacent Top-to-Bottom snap
          else if (Math.abs(curTop - other.bottom) <= SNAP_THRESHOLD) {
            nextY = other.bottom;
            activeSnapLines.push({
              id: `snap-tb-${other.id}`,
              orientation: 'horizontal',
              position: other.bottom,
              label: `چسبیدن به زیر ${other.name}`,
              snapType: 'edge',
              color: '#10b981',
            });
            primaryGuideY = other.bottom;
            snapLabel = snapLabel || `چسبیدن به زیر «${other.name}»`;
            snappedY = true;
          }
          // Adjacent Bottom-to-Top snap
          else if (Math.abs(curBottom - other.top) <= SNAP_THRESHOLD) {
            nextY = other.top - elHeight;
            activeSnapLines.push({
              id: `snap-bt-${other.id}`,
              orientation: 'horizontal',
              position: other.top,
              label: `چسبیدن به بالای ${other.name}`,
              snapType: 'edge',
              color: '#10b981',
            });
            primaryGuideY = other.top;
            snapLabel = snapLabel || `چسبیدن به بالای «${other.name}»`;
            snappedY = true;
          }
        }

        // Vertical Snap against Canvas Boundaries, Safe Margins & Canvas Center
        if (!snappedY && canvasHeight) {
          const canvasCenterY = Math.round(canvasHeight / 2);
          const SAFE_MARGIN = canvasHeight >= 300 ? 16 : 8;

          // 1. Center of Canvas Vertical
          if (Math.abs(curCenterY - canvasCenterY) <= SNAP_THRESHOLD) {
            nextY = canvasCenterY - Math.round(elHeight / 2);
            activeSnapLines.push({
              id: 'snap-canvas-cy',
              orientation: 'horizontal',
              position: canvasCenterY,
              label: 'مرکز عمودی بوم',
              snapType: 'center',
              color: '#ec4899',
            });
            primaryGuideY = canvasCenterY;
            snapLabel = snapLabel ? 'مرکز کامل بوم' : 'مرکز عمودی بوم';
            snappedY = true;
          } 
          // 2. Top Edge of Canvas Container (0px)
          else if (Math.abs(curTop - 0) <= SNAP_THRESHOLD + 2) {
            nextY = 0;
            activeSnapLines.push({
              id: 'snap-canvas-t',
              orientation: 'horizontal',
              position: 0,
              label: 'لبه بالای کانتینر بوم (0px)',
              snapType: 'canvas',
              color: '#06b6d4',
            });
            primaryGuideY = 0;
            snapLabel = snapLabel ? `${snapLabel} | لبه بالای بوم` : 'انطباق با لبه بالای بوم';
            snappedY = true;
          } 
          // 3. Bottom Edge of Canvas Container (Height)
          else if (Math.abs(curBottom - canvasHeight) <= SNAP_THRESHOLD + 2) {
            nextY = canvasHeight - elHeight;
            activeSnapLines.push({
              id: 'snap-canvas-b',
              orientation: 'horizontal',
              position: canvasHeight,
              label: `لبه پایین کانتینر بوم (${canvasHeight}px)`,
              snapType: 'canvas',
              color: '#06b6d4',
            });
            primaryGuideY = canvasHeight;
            snapLabel = snapLabel ? `${snapLabel} | لبه پایین بوم` : 'انطباق با لبه پایین بوم';
            snappedY = true;
          }
          // 4. Safe Margin Top
          else if (Math.abs(curTop - SAFE_MARGIN) <= SNAP_THRESHOLD) {
            nextY = SAFE_MARGIN;
            activeSnapLines.push({
              id: 'snap-canvas-margin-t',
              orientation: 'horizontal',
              position: SAFE_MARGIN,
              label: `حاشیه امن بالا (${SAFE_MARGIN}px)`,
              snapType: 'canvas',
              color: '#10b981',
            });
            primaryGuideY = SAFE_MARGIN;
            snapLabel = snapLabel ? `${snapLabel} | حاشیه بالا` : `حاشیه امن بالا (${SAFE_MARGIN}px)`;
            snappedY = true;
          }
          // 5. Safe Margin Bottom
          else if (Math.abs(curBottom - (canvasHeight - SAFE_MARGIN)) <= SNAP_THRESHOLD) {
            nextY = canvasHeight - SAFE_MARGIN - elHeight;
            activeSnapLines.push({
              id: 'snap-canvas-margin-b',
              orientation: 'horizontal',
              position: canvasHeight - SAFE_MARGIN,
              label: `حاشیه امن پایین (${canvasHeight - SAFE_MARGIN}px)`,
              snapType: 'canvas',
              color: '#10b981',
            });
            primaryGuideY = canvasHeight - SAFE_MARGIN;
            snapLabel = snapLabel ? `${snapLabel} | حاشیه پایین` : `حاشیه امن پایین (${SAFE_MARGIN}px)`;
            snappedY = true;
          }
        }
      }

      // Optional Grid Snap (e.g. 5px or 10px)
      if (gridSnapSize && gridSnapSize > 1) {
        nextX = Math.round(nextX / gridSnapSize) * gridSnapSize;
        nextY = Math.round(nextY / gridSnapSize) * gridSnapSize;
        if (!snapLabel) snapLabel = `گرید ${gridSnapSize}px`;
      }

      // Photoshop-style pasteboard and bleed dragging (elements outside canvas remain fully selectable & controllable)
      if (canvasWidth && canvasHeight) {
        const minX = -350;
        const maxX = canvasWidth + 350;
        const minY = -350;
        const maxY = canvasHeight + 350;
        nextX = Math.max(minX, Math.min(maxX, nextX));
        nextY = Math.max(minY, Math.min(maxY, nextY));
      }

      currentCalculatedX = nextX;
      currentCalculatedY = nextY;

      setDragPos({ x: nextX, y: nextY });
      setSnapGuide({
        guideX: primaryGuideX,
        guideY: primaryGuideY,
        label: snapLabel,
      });

      // Transmit active dynamic smart snapping lines to CanvasRulers & parent
      onDragStateChange?.({
        isActive: true,
        x: nextX,
        y: nextY,
        width: elWidth,
        height: elHeight,
        snapLines: activeSnapLines,
        snapLabel: snapLabel,
      });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      setIsDragging(false);
      setDragPos(null);
      setSnapGuide({ guideX: null, guideY: null, label: null });
      onDragStateChange?.(null);

      if (currentCalculatedX !== initialLayerX || currentCalculatedY !== initialLayerY) {
        onUpdatePosition?.(layer.id, currentCalculatedX, currentCalculatedY);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const data = layer.data || {};
  const scaleX = (layer.scale || 1) * (layer.flipHorizontal ? -1 : 1);
  const scaleY = (layer.scale || 1) * (layer.flipVertical ? -1 : 1);

  // Filters & shadows
  const filters: string[] = [];
  if (layer.blur && layer.blur > 0) filters.push(`blur(${layer.blur}px)`);
  if (layer.brightness !== undefined && layer.brightness !== 100) filters.push(`brightness(${layer.brightness}%)`);
  if (layer.contrast !== undefined && layer.contrast !== 100) filters.push(`contrast(${layer.contrast}%)`);
  if (layer.saturate !== undefined && layer.saturate !== 100) filters.push(`saturate(${layer.saturate}%)`);
  if (layer.hueRotate !== undefined && layer.hueRotate !== 0) filters.push(`hue-rotate(${layer.hueRotate}deg)`);
  if (layer.grayscale !== undefined && layer.grayscale > 0) filters.push(`grayscale(${layer.grayscale}%)`);
  if (layer.invert !== undefined && layer.invert > 0) filters.push(`invert(${layer.invert}%)`);
  // Box shadows (inner glow and spread shadow)
  const boxShadows: string[] = [];

  if (layer.shadow && layer.shadow.enabled) {
    if (layer.shadow.spread && layer.shadow.spread > 0) {
      boxShadows.push(`${layer.shadow.x}px ${layer.shadow.y}px ${layer.shadow.blur}px ${layer.shadow.spread}px ${layer.shadow.color}`);
    } else {
      filters.push(`drop-shadow(${layer.shadow.x}px ${layer.shadow.y}px ${layer.shadow.blur}px ${layer.shadow.color})`);
    }
  }
  if (layer.outerGlow && layer.outerGlow.enabled) {
    filters.push(`drop-shadow(0px 0px ${layer.outerGlow.blur}px ${layer.outerGlow.color})`);
  }

  if (layer.innerGlow && layer.innerGlow.enabled) {
    boxShadows.push(`inset 0px 0px ${layer.innerGlow.blur}px ${layer.innerGlow.color}`);
  }

  const layerStyle: React.CSSProperties = {
    transform: `rotate(${layer.rotation || 0}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
    opacity: (layer.opacity ?? 100) / 100,
    mixBlendMode: layer.blendMode || 'normal',
    filter: filters.length > 0 ? filters.join(' ') : undefined,
    boxShadow: boxShadows.length > 0 ? boxShadows.join(', ') : undefined,
    backdropFilter: layer.backdropBlur && layer.backdropBlur > 0 ? `blur(${layer.backdropBlur}px)` : undefined,
    WebkitBackdropFilter: layer.backdropBlur && layer.backdropBlur > 0 ? `blur(${layer.backdropBlur}px)` : undefined,
    borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : undefined,
    border: layer.border && layer.border.enabled ? `${layer.border.width}px solid ${layer.border.color}` : undefined,
    zIndex: layer.zIndex || 10,
  };

  const templateVars = useTemplateVars(selectVars);

  const renderContent = () => {
    switch (layer.type) {
      // 1. TEXT LAYER
      case 'text': {
        const textVal = fillTemplate(data.text || 'متن دلخواه', templateVars);
        const subtitleVal = data.subtitle ? fillTemplate(data.subtitle, templateVars) : data.subtitle;
        const alignClass =
          data.textAlign === 'right'
            ? 'text-right'
            : data.textAlign === 'left'
            ? 'text-left'
            : 'text-center';

        return (
          <div 
            className={`${alignClass} space-y-1.5 p-2 rounded-xl select-none ${data.fontFamily || ''}`}
            style={{ textTransform: data.textTransform || 'none' }}
          >
            <h3
              contentEditable={isInteractive && !layer.locked}
              suppressContentEditableWarning
              onBlur={(e) => {
                onUpdateLayerData?.(layer.id, { text: e.currentTarget.textContent || textVal });
              }}
              style={{
                fontSize: data.fontSize ? `${data.fontSize}px` : '20px',
                color: data.textColor || '#ffffff',
                fontWeight: data.fontWeight || '900',
                textTransform: data.textTransform || 'none',
              }}
              className="font-black drop-shadow-md outline-none focus:bg-slate-900/80 focus:px-2 rounded transition-colors"
            >
              {textVal}
            </h3>
            {subtitleVal !== undefined && (
              <p
                contentEditable={isInteractive && !layer.locked}
                suppressContentEditableWarning
                onBlur={(e) => {
                  onUpdateLayerData?.(layer.id, { subtitle: e.currentTarget.textContent || subtitleVal });
                }}
                style={{
                  textTransform: data.textTransform || 'none',
                }}
                className="text-xs text-slate-200 outline-none focus:bg-slate-900/80 focus:px-2 rounded transition-colors"
              >
                {subtitleVal}
              </p>
            )}
          </div>
        );
      }

      // 2. CATEGORY BADGE & OFFICIAL ZHAKET BADGES LAYER
      case 'badge':
      case 'zhaket-badge': {
        const title = data.badgeTitle || data.badgeText || 'تاییدیه رسمی ژاکت';
        const tagline = data.badgeTagline;
        const icon = data.badgeIcon || '🛡️';
        const styleVariant = data.badgeStyle || 'gold-gradient';

        let badgeStyleClasses = 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/20';
        if (styleVariant === 'emerald-gradient') {
          badgeStyleClasses = 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-400/60 shadow-lg shadow-emerald-500/20';
        } else if (styleVariant === 'orange-zhaket') {
          badgeStyleClasses = 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white border-amber-400/60 shadow-lg shadow-orange-500/20';
        } else if (styleVariant === 'cyan-gradient') {
          badgeStyleClasses = 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white border-cyan-400/60 shadow-lg shadow-cyan-500/20';
        } else if (styleVariant === 'purple-gradient') {
          badgeStyleClasses = 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white border-purple-400/60 shadow-lg shadow-purple-500/20';
        } else if (styleVariant === 'dark-glass') {
          badgeStyleClasses = 'bg-slate-950/90 text-amber-300 border-amber-500/40 backdrop-blur-md shadow-xl';
        } else if (styleVariant === 'white-glow') {
          badgeStyleClasses = 'bg-white text-slate-950 border-slate-200 shadow-xl shadow-white/20';
        }

        const customStyle: React.CSSProperties = {};
        if (data.bgColor) customStyle.backgroundColor = data.bgColor;
        if (data.textColor) customStyle.color = data.textColor;
        if (data.borderColor) customStyle.borderColor = data.borderColor;

        return (
          <div 
            style={customStyle}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 backdrop-blur-md select-none transition-all ${badgeStyleClasses}`}
          >
            {icon && <span className="text-sm shrink-0 drop-shadow">{icon}</span>}
            <div className="flex flex-col text-right">
              <span
                contentEditable={isInteractive && !layer.locked}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const val = e.currentTarget.textContent || title;
                  onUpdateLayerData?.(layer.id, { badgeTitle: val, badgeText: val });
                }}
                className="text-xs font-black outline-none leading-tight"
              >
                {title}
              </span>
              {tagline && (
                <span
                  contentEditable={isInteractive && !layer.locked}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    onUpdateLayerData?.(layer.id, { badgeTagline: e.currentTarget.textContent || tagline });
                  }}
                  className="text-[9px] opacity-90 outline-none leading-tight font-medium"
                >
                  {tagline}
                </span>
              )}
            </div>
          </div>
        );
      }

      // 3. ICON LIBRARY LAYER
      case 'icon-library': {
        const iconName = data.iconName || 'ShoppingBag';
        const IconComponent = VECTOR_ICON_COMPONENTS[iconName] || ICON_COMPONENTS[iconName] || ShoppingBag;
        const iconBgShape = data.iconBgShape || 'circle';
        const iconColor = data.iconColor || '#fbbf24';
        const iconBgColor = data.iconBgColor;

        let shapeContainerClass = 'p-3 flex items-center justify-center shadow-xl select-none';
        if (iconBgShape === 'circle') shapeContainerClass += ' rounded-full bg-slate-950/85 border-2 border-amber-500/40 backdrop-blur-md';
        if (iconBgShape === 'rounded') shapeContainerClass += ' rounded-2xl bg-slate-950/85 border-2 border-amber-500/40 backdrop-blur-md';
        if (iconBgShape === 'square') shapeContainerClass += ' rounded-lg bg-slate-950/85 border-2 border-amber-500/40 backdrop-blur-md';
        if (iconBgShape === 'none') shapeContainerClass += ' bg-transparent';

        return (
          <div 
            className={shapeContainerClass}
            style={{ 
              color: iconColor,
              backgroundColor: iconBgColor || undefined,
            }}
          >
            <IconComponent className="w-8 h-8 drop-shadow-md" />
          </div>
        );
      }

      // 4. SHAPE & VECTOR GEOMETRY LAYER
      case 'shape': {
        const shapeType = data.shapeType || 'starburst';
        const shapeText = data.shapeText || 'PRO';

        if (shapeType === 'starburst') {
          return (
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 border-2 border-amber-200 flex items-center justify-center text-slate-950 font-black text-xs shadow-2xl shadow-amber-500/40 select-none">
              <span
                contentEditable={isInteractive && !layer.locked}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateLayerData?.(layer.id, { shapeText: e.currentTarget.textContent || shapeText })}
                className="outline-none"
              >
                {shapeText}
              </span>
            </div>
          );
        }

        if (shapeType === 'circle-glow') {
          return (
            <div className="w-20 h-20 rounded-full bg-slate-950/90 border-2 border-indigo-400 flex items-center justify-center text-indigo-300 font-black text-sm shadow-[0_0_25px_rgba(99,102,241,0.6)] backdrop-blur-md select-none">
              <span
                contentEditable={isInteractive && !layer.locked}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateLayerData?.(layer.id, { shapeText: e.currentTarget.textContent || shapeText })}
                className="outline-none"
              >
                {shapeText}
              </span>
            </div>
          );
        }

        if (shapeType === 'hexagon-gold') {
          return (
            <div className="w-20 h-20 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 rounded-3xl flex items-center justify-center text-slate-950 font-black text-base shadow-2xl rotate-45 border-2 border-amber-100 select-none">
              <span
                contentEditable={isInteractive && !layer.locked}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateLayerData?.(layer.id, { shapeText: e.currentTarget.textContent || shapeText })}
                className="-rotate-45 font-black outline-none"
              >
                {shapeText}
              </span>
            </div>
          );
        }

        if (shapeType === 'rect' || shapeType === 'vector-rect' || shapeType === 'glass-card') {
          return (
            <div 
              style={{
                width: data.width ? `${data.width}px` : '120px',
                height: data.height ? `${data.height}px` : '70px',
                backgroundColor: data.fillColor || 'rgba(79, 70, 229, 0.5)',
                borderColor: data.strokeColor || '#818cf8',
              }}
              className="rounded-2xl border-2 shadow-2xl flex items-center justify-center p-3 select-none backdrop-blur-md"
            >
              <span
                contentEditable={isInteractive && !layer.locked}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateLayerData?.(layer.id, { shapeText: e.currentTarget.textContent || shapeText })}
                className="text-white font-bold text-xs outline-none text-center"
              >
                {shapeText || 'کارت برداری'}
              </span>
            </div>
          );
        }

        if (shapeType === 'circle' || shapeType === 'vector-circle') {
          const size = (data.radius || 35) * 2;
          return (
            <div 
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: data.fillColor || 'rgba(16, 185, 129, 0.5)',
                borderColor: data.strokeColor || '#34d399',
              }}
              className="rounded-full border-2 shadow-2xl flex items-center justify-center p-2 select-none backdrop-blur-md"
            >
              <span
                contentEditable={isInteractive && !layer.locked}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateLayerData?.(layer.id, { shapeText: e.currentTarget.textContent || shapeText })}
                className="text-white font-bold text-xs outline-none text-center"
              >
                {shapeText || 'دایره'}
              </span>
            </div>
          );
        }

        if (shapeType === 'star' || shapeType === 'vector-star') {
          return (
            <div 
              style={{
                backgroundColor: data.fillColor || '#f59e0b',
                borderColor: data.strokeColor || '#fbbf24',
              }}
              className="w-20 h-20 rounded-2xl border-2 shadow-2xl flex items-center justify-center p-2 select-none rotate-12 backdrop-blur-md"
            >
              <div className="flex flex-col items-center justify-center -rotate-12">
                <Star className="w-6 h-6 text-amber-200 fill-amber-200 drop-shadow" />
                <span
                  contentEditable={isInteractive && !layer.locked}
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdateLayerData?.(layer.id, { shapeText: e.currentTarget.textContent || shapeText })}
                  className="text-slate-950 font-black text-[11px] outline-none"
                >
                  {shapeText || 'ویژه'}
                </span>
              </div>
            </div>
          );
        }

        return null;
      }

      // 5. DISCOUNT RIBBON LAYER
      case 'discount-ribbon': {
        const discountPercent = data.discountPercent || '۵۰٪ تخفیف';
        return (
          <div className="px-4 py-2 bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 text-white font-black text-xs rounded-xl shadow-2xl border border-amber-300 flex items-center gap-1.5 select-none">
            <Flame className="w-4 h-4 text-amber-200 animate-pulse" />
            <span
              contentEditable={isInteractive && !layer.locked}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateLayerData?.(layer.id, { discountPercent: e.currentTarget.textContent || discountPercent })}
              className="outline-none"
            >
              {discountPercent}
            </span>
          </div>
        );
      }

      // 6. RATING BADGE LAYER
      case 'rating-badge': {
        const ratingVal = data.ratingValue || '۵.۰';
        const ratingCount = data.ratingCount || '(۱۲۸ نظر)';
        return (
          <div className="px-3 py-1.5 bg-slate-950/90 border border-amber-500/40 rounded-2xl flex items-center gap-2 shadow-xl backdrop-blur-md select-none">
            <div className="flex text-amber-400 text-xs">★★★★★</div>
            <span
              contentEditable={isInteractive && !layer.locked}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateLayerData?.(layer.id, { ratingValue: e.currentTarget.textContent || ratingVal })}
              className="font-bold text-white font-mono text-xs outline-none"
            >
              {ratingVal}
            </span>
            <span
              contentEditable={isInteractive && !layer.locked}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateLayerData?.(layer.id, { ratingCount: e.currentTarget.textContent || ratingCount })}
              className="text-[10px] text-slate-400 outline-none"
            >
              {ratingCount}
            </span>
          </div>
        );
      }

      // 7. PRICE TAG LAYER
      case 'price-tag': {
        const origPrice = data.originalPrice || '۴۹۰,۰۰۰';
        const salePrice = data.salePrice || '۲۹۰,۰۰۰';
        const curr = data.currency || 'تومان';
        return (
          <div className="px-3.5 py-2 bg-slate-950/95 border border-emerald-500/50 rounded-2xl flex items-center gap-2.5 shadow-2xl backdrop-blur-md select-none">
            <span
              contentEditable={isInteractive && !layer.locked}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateLayerData?.(layer.id, { originalPrice: e.currentTarget.textContent || origPrice })}
              className="line-through text-slate-500 text-[10px] outline-none"
            >
              {origPrice}
            </span>
            <div className="flex items-center gap-1">
              <span
                contentEditable={isInteractive && !layer.locked}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateLayerData?.(layer.id, { salePrice: e.currentTarget.textContent || salePrice })}
                className="text-emerald-400 font-black text-sm outline-none"
              >
                {salePrice}
              </span>
              <span className="text-[10px] text-emerald-300/80 font-bold">{curr}</span>
            </div>
          </div>
        );
      }

      // 8. QR CODE LAYER
      case 'qr-code': {
        const qrTitle = data.qrTitle || 'مشاهده دمو آنلاین';
        const qrSubtitle = data.qrSubtitle || 'با دوربین اسکن کنید';
        return (
          <div className="p-2.5 bg-slate-950/90 border border-slate-700 rounded-2xl flex items-center gap-2.5 shadow-xl backdrop-blur-md select-none">
            <div className="w-10 h-10 bg-white p-1 rounded-xl flex items-center justify-center shrink-0">
              <QrCode className="w-8 h-8 text-slate-950" />
            </div>
            <div className="text-[10px] text-right">
              <span
                contentEditable={isInteractive && !layer.locked}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateLayerData?.(layer.id, { qrTitle: e.currentTarget.textContent || qrTitle })}
                className="text-amber-300 font-bold block outline-none"
              >
                {qrTitle}
              </span>
              <span
                contentEditable={isInteractive && !layer.locked}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateLayerData?.(layer.id, { qrSubtitle: e.currentTarget.textContent || qrSubtitle })}
                className="text-slate-400 outline-none text-[9px]"
              >
                {qrSubtitle}
              </span>
            </div>
          </div>
        );
      }

      // 9. FEATURE PILLS GRID LAYER
      case 'feature-pills': {
        const features = data.features || [
          'اتصال آنی ووکامرس',
          'طراحی مدرن UI/UX',
          'درگاه پرداخت اختصاصی',
          'ارسال پوش نوتیفیکیشن',
        ];
        const layoutMode = data.layoutMode || 'grid2x2';

        let containerLayoutClass = 'grid grid-cols-2 gap-1.5 w-full max-w-[320px]';
        if (layoutMode === 'horizontal') containerLayoutClass = 'flex flex-row flex-wrap gap-1.5 w-full max-w-[360px]';
        if (layoutMode === 'vertical') containerLayoutClass = 'flex flex-col gap-1.5 w-full max-w-[320px]';
        if (layoutMode === 'wrap') containerLayoutClass = 'flex flex-wrap gap-1.5 w-full max-w-[360px]';

        return (
          <div className={`${containerLayoutClass} text-[9px] select-none`}>
            {features.map((feat: string, idx: number) => (
              <div
                key={idx}
                contentEditable={isInteractive && !layer.locked}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const next = [...features];
                  next[idx] = e.currentTarget.textContent || feat;
                  onUpdateLayerData?.(layer.id, { features: next });
                }}
                className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-white font-medium flex items-center gap-1 shadow-sm outline-none focus:bg-slate-900"
                style={{ 
                  backgroundColor: data.pillBgColor || undefined,
                  color: data.pillTextColor || undefined,
                }}
              >
                <Zap className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        );
      }

      // 10. STAT CARD LAYER
      case 'stat-card': {
        const stats = data.stats || [
          { title: 'REST API', subtitle: 'اتصال سریع', color: 'text-amber-400' },
          { title: 'UI مدرن', subtitle: 'دارک و لایت', color: 'text-purple-400' },
          { title: 'پوش آنی', subtitle: 'بدون تاخیر', color: 'text-emerald-400' },
        ];
        return (
          <div className="grid grid-cols-3 gap-2 text-[10px] text-center w-full max-w-[340px] select-none">
            {stats.map((st: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-950/80 p-2.5 rounded-xl border border-white/10 backdrop-blur-md"
              >
                <span
                  contentEditable={isInteractive && !layer.locked}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const next = [...stats];
                    next[idx].title = e.currentTarget.textContent || st.title;
                    onUpdateLayerData?.(layer.id, { stats: next });
                  }}
                  className={`font-bold block text-xs ${st.color || 'text-amber-400'} outline-none focus:bg-slate-900 rounded`}
                >
                  {st.title}
                </span>
                <span
                  contentEditable={isInteractive && !layer.locked}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const next = [...stats];
                    next[idx].subtitle = e.currentTarget.textContent || st.subtitle;
                    onUpdateLayerData?.(layer.id, { stats: next });
                  }}
                  className="text-slate-400 outline-none focus:bg-slate-900 rounded block"
                >
                  {st.subtitle}
                </span>
              </div>
            ))}
          </div>
        );
      }

      // 11. TRUST SEAL FOOTER LAYER
      case 'trust-seal': {
        const trustTitle = data.trustTitle || 'تاییدیه رسمی مارکت ژاکت';
        const trustSubtitle = data.trustSubtitle || '۶ ماه پشتیبانی رایگان و آپدیت مادام‌العمر';
        return (
          <div className="bg-slate-950/85 p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs w-full max-w-[340px] backdrop-blur-md shadow-lg select-none">
            <div>
              <span
                contentEditable={isInteractive && !layer.locked}
                suppressContentEditableWarning
                onBlur={(e) => {
                  onUpdateLayerData?.(layer.id, { trustTitle: e.currentTarget.textContent || trustTitle });
                }}
                className="text-amber-400 font-bold block outline-none focus:bg-slate-900 rounded"
              >
                {trustTitle}
              </span>
              <span
                contentEditable={isInteractive && !layer.locked}
                suppressContentEditableWarning
                onBlur={(e) => {
                  onUpdateLayerData?.(layer.id, { trustSubtitle: e.currentTarget.textContent || trustSubtitle });
                }}
                className="text-[10px] text-slate-400 outline-none focus:bg-slate-900 rounded block"
              >
                {trustSubtitle}
              </span>
            </div>
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          </div>
        );
      }

      // 12. MOCKUP LAYER
      case 'mockup': {
        const mockupType = data.mockupType || 'mobile';
        const screenImage = data.screenImage;
        const frameColor = data.frameColor || 'dark';

        let frameBg = 'bg-slate-900 border-slate-700';
        if (frameColor === 'silver') frameBg = 'bg-slate-200 border-slate-300 text-slate-900';
        if (frameColor === 'gold') frameBg = 'bg-amber-950/90 border-amber-500/60';
        if (frameColor === 'midnight') frameBg = 'bg-indigo-950/90 border-indigo-500/50';

        const renderScreen = () => {
          if (screenImage) {
            return <img src={screenImage} alt="Screen" className="w-full h-full object-cover select-none pointer-events-none" />;
          }
          return (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-2 flex flex-col justify-between text-white text-[8px] select-none">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span className="font-bold text-amber-400">ووکامرس پلاس</span>
                <span className="text-emerald-400 font-mono">آنلاین</span>
              </div>
              <div className="grid grid-cols-2 gap-1 my-auto">
                <div className="bg-slate-800/80 p-1 rounded">
                  <span className="text-slate-400 block text-[6px]">فروش</span>
                  <span className="text-amber-300 font-bold">۱۲.۴ م</span>
                </div>
                <div className="bg-slate-800/80 p-1 rounded">
                  <span className="text-slate-400 block text-[6px]">سفارش</span>
                  <span className="text-purple-300 font-bold">۴۸</span>
                </div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded py-0.5 text-center text-amber-300 font-bold text-[7px]">
                پشتیبانی ژاکت
              </div>
            </div>
          );
        };

        if (mockupType === 'mobile') {
          return (
            <div className={`w-32 h-64 rounded-[2rem] p-1.5 border-4 shadow-2xl flex flex-col items-center justify-between relative overflow-hidden backdrop-blur-md ${frameBg}`}>
              <div className="w-10 h-3 bg-black rounded-full mb-1 z-20 flex items-center justify-end px-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-slate-950">
                {renderScreen()}
              </div>
              <div className="w-10 h-0.5 bg-white/40 rounded-full mt-1"></div>
            </div>
          );
        }

        if (mockupType === 'laptop') {
          return (
            <div className="flex flex-col items-center w-56 select-none">
              <div className={`w-full h-36 rounded-t-xl p-1.5 border-4 border-b-0 shadow-2xl backdrop-blur-md ${frameBg}`}>
                <div className="w-full h-full rounded-md overflow-hidden bg-slate-950">
                  {renderScreen()}
                </div>
              </div>
              <div className="w-64 h-2.5 bg-slate-700 rounded-b-lg shadow border border-slate-600 flex justify-center">
                <div className="w-10 h-0.5 bg-slate-500 rounded-full mt-0.5"></div>
              </div>
            </div>
          );
        }

        if (mockupType === 'tablet') {
          return (
            <div className={`w-48 h-64 rounded-2xl p-2 border-4 shadow-2xl flex flex-col justify-between backdrop-blur-md ${frameBg}`}>
              <div className="w-full h-full rounded-xl overflow-hidden bg-slate-950">
                {renderScreen()}
              </div>
            </div>
          );
        }

        return (
          <div className="w-36 h-48 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 border-2 border-amber-400 p-3 flex flex-col justify-between shadow-2xl text-white">
            <Box className="w-5 h-5 text-amber-300" />
            <div className="text-center">
              <h5 className="font-black text-xs">ووکامرس پلاس</h5>
              <p className="text-[8px] text-amber-200">لایسنس اورجینال</p>
            </div>
            <div className="text-[7px] text-amber-300 font-mono">v3.8.0</div>
          </div>
        );
      }

      // 13. VECTOR / AI GRAPHIC / IMAGE LAYER
      case 'vector-shape':
      case 'ai-graphic': {
        if (data.svgCode) {
          return (
            <div
              className="w-28 h-28 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full drop-shadow-xl select-none"
              dangerouslySetInnerHTML={{ __html: sanitizeSvg(data.svgCode) }}
            />
          );
        }
        if (data.imageUrl) {
          return (
            <img
              src={data.imageUrl}
              alt="Graphic Layer"
              className="w-28 h-28 object-contain drop-shadow-xl rounded-xl pointer-events-none select-none"
            />
          );
        }
        return null;
      }

      // 14. 3D MODEL / ILLUSTRATION LAYER (Shapefest, Figma 3D, DrawKit, Iconscout, Mobile 3D)
      case '3d-model': {
        const modelId = data.model3dId || 'box3d-woocommerce';
        const modelTitle = data.model3dTitle;
        const showText = data.showText === true && Boolean(modelTitle);
        const hideBg = data.hideBackground === true || data.model3dBgShape === 'none';
        const customBg = data.model3dBgColor || data.fillColor;
        const customBorder = data.model3dBorderColor || data.strokeColor;

        const renderModelIcon = () => {
          switch (modelId) {
            case 'shapefest-clay-hand':
              return <ThumbsUp className="w-12 h-12 text-sky-300 drop-shadow-xl" />;
            case 'shapefest-frosted-glass':
              return <Box className="w-12 h-12 text-purple-200 drop-shadow-xl" />;
            case 'shapefest-abstract-donut':
              return <CircleDot className="w-12 h-12 text-rose-300 drop-shadow-xl" />;
            case 'shapefest-gradient-spheres-ring':
              return <Sparkles className="w-12 h-12 text-amber-300 drop-shadow-xl" />;
            case 'figma3d-saas-badge':
              return <Sparkles className="w-12 h-12 text-indigo-300 drop-shadow-xl" />;
            case 'figma3d-layers-stack':
              return <Layers className="w-12 h-12 text-sky-300 drop-shadow-xl" />;
            case 'figma3d-cursor-pointer':
              return <MousePointer className="w-12 h-12 text-amber-300 drop-shadow-xl" />;
            case 'drawkit-ecommerce-cart':
              return <ShoppingCart className="w-12 h-12 text-emerald-300 drop-shadow-xl" />;
            case 'drawkit-business-briefcase':
              return <Briefcase className="w-12 h-12 text-amber-300 drop-shadow-xl" />;
            case 'drawkit-creative-palette':
              return <Palette className="w-12 h-12 text-rose-300 drop-shadow-xl" />;
            case 'iconscout-fintech-wallet':
              return <Wallet className="w-12 h-12 text-emerald-300 drop-shadow-xl" />;
            case 'iconscout-glossy-fire':
              return <Flame className="w-12 h-12 text-rose-400 fill-rose-400 drop-shadow-xl" />;
            case 'iconscout-cloud-server':
              return <Cloud className="w-12 h-12 text-sky-300 drop-shadow-xl" />;
            case 'iconscout-express-box':
              return <Truck className="w-12 h-12 text-amber-300 drop-shadow-xl" />;
            case 'trophy3d-gold':
              return <Award className="w-12 h-12 text-yellow-300 drop-shadow-xl" />;
            case 'rocket3d-speed':
              return <Rocket className="w-12 h-12 text-purple-300 drop-shadow-xl" />;
            case 'shield3d-secure':
              return <ShieldCheck className="w-12 h-12 text-emerald-300 drop-shadow-xl" />;
            case 'star3d-gold':
              return <Star className="w-12 h-12 text-amber-300 fill-amber-300 drop-shadow-xl" />;
            case 'coin3d-dollar':
              return <DollarSign className="w-12 h-12 text-amber-300 drop-shadow-xl" />;

            // --- MOBILE APP 3D MODELS ---
            case 'mobile-app-store':
              return <Apple className="w-12 h-12 text-white drop-shadow-xl" />;
            case 'mobile-google-play':
              return <Play className="w-12 h-12 text-emerald-400 fill-emerald-400 drop-shadow-xl" />;
            case 'mobile-smartphone-ui':
              return <Smartphone className="w-12 h-12 text-indigo-300 drop-shadow-xl" />;
            case 'mobile-push-bell':
              return <Bell className="w-12 h-12 text-amber-300 fill-amber-300 drop-shadow-xl animate-pulse" />;
            case 'mobile-wallet-card':
              return <CreditCard className="w-12 h-12 text-cyan-300 drop-shadow-xl" />;
            case 'mobile-5g-speed':
              return <Zap className="w-12 h-12 text-amber-300 fill-amber-300 drop-shadow-xl" />;
            case 'mobile-sms-lock':
              return <Lock className="w-12 h-12 text-emerald-300 drop-shadow-xl" />;
            case 'mobile-qr-scan':
              return <QrCode className="w-12 h-12 text-sky-300 drop-shadow-xl" />;
            case 'mobile-touch-gesture':
              return <Touchpad className="w-12 h-12 text-purple-300 drop-shadow-xl" />;
            case 'mobile-battery-saver':
              return <BatteryCharging className="w-12 h-12 text-emerald-300 drop-shadow-xl" />;

            default:
              return <Box className="w-12 h-12 text-amber-300 drop-shadow-xl" />;
          }
        };

        if (hideBg) {
          return (
            <div className="flex flex-col items-center justify-center p-2 select-none transform hover:scale-105 transition-transform">
              {renderModelIcon()}
              {showText && (
                <span className="text-[9px] font-black mt-1 bg-slate-950/90 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 shadow-md">
                  {modelTitle}
                </span>
              )}
            </div>
          );
        }

        const boxStyle: React.CSSProperties = {};
        if (customBg) boxStyle.backgroundColor = customBg;
        if (customBorder) boxStyle.borderColor = customBorder;

        return (
          <div
            style={boxStyle}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 p-3 border-2 border-indigo-400/50 flex flex-col items-center justify-center text-white shadow-2xl backdrop-blur-md select-none transform hover:scale-105 transition-transform"
          >
            {renderModelIcon()}
            {showText && (
              <span className="text-[9px] font-black mt-1 bg-slate-950/90 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 shadow-md truncate max-w-full">
                {modelTitle}
              </span>
            )}
          </div>
        );
      }

      // 15. LOGO LAYER
      case 'logo': {
        const customUrl = data.customLogoUrl || layer.data?.imageUrl;
        const logoSize = data.logoSize || 48;
        const boxPadding = data.boxPadding || 8;
        const boxBg = data.boxBgColor || 'rgba(15, 23, 42, 0.8)';
        const boxBorder = data.boxBorderColor || 'rgba(245, 158, 11, 0.4)';

        return (
          <div
            style={{
              padding: `${boxPadding}px`,
              backgroundColor: boxBg,
              borderColor: boxBorder,
            }}
            className="rounded-2xl border-2 flex items-center justify-center backdrop-blur-md shadow-xl select-none"
          >
            {customUrl ? (
              <img
                src={customUrl}
                alt="Logo"
                style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
                className="object-contain"
              />
            ) : (
              <svg
                viewBox="0 0 100 100"
                style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
                className="text-amber-400 fill-current drop-shadow-md shrink-0"
              >
                <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="none" stroke="currentColor" strokeWidth="6" />
                <path d="M30 40 L50 25 L70 40 L70 65 L50 75 L30 65 Z" fill="currentColor" />
              </svg>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      {/* Magnetic Snapping Guidelines (Luminous pink/amber alignment lines across canvas) */}
      {isDragging && snapGuide.guideX !== null && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-40 border-r-2 border-dashed border-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.9)]"
          style={{ left: `${snapGuide.guideX}px` }}
        />
      )}
      {isDragging && snapGuide.guideY !== null && (
        <div
          className="absolute left-0 right-0 pointer-events-none z-40 border-b-2 border-dashed border-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.9)]"
          style={{ top: `${snapGuide.guideY}px` }}
        />
      )}

      {/* Main Layer Wrapper with Precision Pointer Drag */}
      <div
        ref={elementRef}
        data-layer-id={layer.id}
        onPointerDown={handlePointerDown}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelect?.();
          onOpenContextMenu?.(e.clientX, e.clientY, layer);
        }}
        style={{
          left: `${displayX}px`,
          top: `${displayY}px`,
          cursor: layer.locked ? 'default' : isDragging ? 'grabbing' : isInteractive ? 'grab' : 'default',
          touchAction: 'none',
        }}
        className={`absolute select-none transition-shadow ${
          isDragging ? 'z-50 shadow-2xl scale-[1.01]' : ''
        }`}
      >
        {/* Real-time Precision Drag HUD */}
        {isDragging && (
          <div className="absolute -top-7 right-0 bg-slate-950/95 text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border border-amber-500/60 shadow-2xl flex items-center gap-1.5 whitespace-nowrap z-50 pointer-events-none backdrop-blur-md">
            <Crosshair className="w-3 h-3 text-amber-400 animate-spin" />
            <span className="text-slate-400">X:</span>
            <span>{toPersianDigits(displayX)}px</span>
            <span className="text-slate-400">Y:</span>
            <span>{toPersianDigits(displayY)}px</span>
            {snapGuide.label && (
              <span className="bg-pink-500/30 text-pink-300 px-1 rounded text-[9px] font-bold">
                {snapGuide.label}
              </span>
            )}
          </div>
        )}

        {/* Layer Content */}
        <div
          style={layerStyle}
          className={`relative ${
            isSelected
              ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 rounded-2xl shadow-2xl'
              : ''
          }`}
        >
          {/* Selection Bounding Box, Handles & Transform Indicators */}
          {isSelected && !isDragging && (
            <>
              {/* Real-time Transform HUD Badge during Resizing or Rotating */}
              {transformHUD && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950/95 text-amber-300 font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-500/60 shadow-2xl z-50 pointer-events-none backdrop-blur-md whitespace-nowrap animate-in fade-in">
                  {transformHUD}
                </div>
              )}

              {/* Layer Name Tag & X/Y Position */}
              <div className="absolute -top-6 right-0 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md z-30 pointer-events-none flex items-center gap-1 whitespace-nowrap">
                <Move className="w-2.5 h-2.5" />
                <span>{layer.name}</span>
                <span className="font-mono text-[8px] opacity-80">({toPersianDigits(displayX)},{toPersianDigits(displayY)})</span>
              </div>

              {!layer.locked && (
                <>
                  {/* Top Stem & Rotation Handle Knob */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-amber-400 pointer-events-none z-30" />
                  <div
                    onPointerDown={handleRotatePointerDown}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-amber-400 hover:bg-amber-300 border-2 border-slate-950 rounded-full shadow-lg z-40 cursor-grab active:cursor-grabbing transition-transform hover:scale-125"
                    title="بکشید تا المان بچرخد (360°)"
                  />

                  {/* 4 Corner Resize Handles */}
                  <div
                    onPointerDown={(e) => handleResizePointerDown('tl', e)}
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white hover:bg-amber-300 border-2 border-amber-500 rounded-sm shadow-md z-40 cursor-nwse-resize transition-transform hover:scale-125"
                    title="تغییر اندازه از بالا-چپ"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown('tr', e)}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white hover:bg-amber-300 border-2 border-amber-500 rounded-sm shadow-md z-40 cursor-nesw-resize transition-transform hover:scale-125"
                    title="تغییر اندازه از بالا-راست"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown('bl', e)}
                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white hover:bg-amber-300 border-2 border-amber-500 rounded-sm shadow-md z-40 cursor-nesw-resize transition-transform hover:scale-125"
                    title="تغییر اندازه از پایین-چپ"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown('br', e)}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white hover:bg-amber-300 border-2 border-amber-500 rounded-sm shadow-md z-40 cursor-nwse-resize transition-transform hover:scale-125"
                    title="تغییر اندازه از پایین-راست"
                  />

                  {/* 4 Middle Edge Resize Handles */}
                  <div
                    onPointerDown={(e) => handleResizePointerDown('t', e)}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-2 bg-white hover:bg-amber-300 border border-amber-500 rounded-sm shadow z-40 cursor-ns-resize"
                    title="تغییر اندازه عمودی بالا"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown('b', e)}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-2 bg-white hover:bg-amber-300 border border-amber-500 rounded-sm shadow z-40 cursor-ns-resize"
                    title="تغییر اندازه عمودی پایین"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown('l', e)}
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-3 bg-white hover:bg-amber-300 border border-amber-500 rounded-sm shadow z-40 cursor-ew-resize"
                    title="تغییر اندازه افقی چپ"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown('r', e)}
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-3 bg-white hover:bg-amber-300 border border-amber-500 rounded-sm shadow z-40 cursor-ew-resize"
                    title="تغییر اندازه افقی راست"
                  />
                </>
              )}
            </>
          )}

          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default DynamicLayerRenderer;
