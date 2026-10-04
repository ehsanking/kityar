import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import ColorField from './components/ColorField';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { 
  Sparkles, Download, CheckCircle2, Layers, Layout, RefreshCw, Check, 
  ShieldCheck, Palette, Cpu, Maximize2, Smartphone, ShoppingBag, Zap,
  Type, Sliders, Eye, FileDown, Dices, Play, Plus, Upload, Trash2, Edit3,
  Box, FileCode, Tag, Image as ImageIcon, ChevronDown, ChevronUp, GripVertical,
  Save, FolderOpen, RotateCcw, FileText, BarChart3, Shapes, Percent, Star, DollarSign,
  Undo2, Redo2, Square, Circle, MousePointer, Flame, Crosshair, Grid, Ruler
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ZhaketLogo, { DEFAULT_LOGO_CONFIG, ZhaketLogoConfig } from './components/ZhaketLogo';
import LogoControls from './components/LogoControls';
import RenderPlacedLogo from './components/RenderPlacedLogo';
import SemanticStickerLibraryModal, { CanvasStickerInstance, SemanticSticker, SEMANTIC_STICKERS_DATA, getBadgeStyleClass } from './components/SemanticStickerLibrary';
import CanvasStickersOverlay from './components/CanvasStickersOverlay';
import CanvasContextMenu from './components/CanvasContextMenu';
import CanvasEmptyState from './components/CanvasEmptyState';
import CanvasRulers, { DraggingGuideInfo, RulerUnit } from './components/CanvasRulers';
import WizardStepBar from './components/WizardStepBar';
import LayersSidebar from './components/LayersSidebar';
import CustomGradientStudio, { PRESET_GRADIENTS } from './components/CustomGradientStudio';
import MockupComposer from './components/MockupComposer';
import CustomImageComposer from './components/CustomImageComposer';
import FontSelector, { PERSIAN_FONTS } from './components/FontSelector';
import { toPersianDigits } from './utils/persianNumbers';
import DynamicLayerRenderer from './components/DynamicLayerRenderer';
import SortableInfographicRow, { InfographicRowData } from './components/SortableInfographicRow';
import PWAControls from './components/PWAControls';
import LiveMiniPreviewModal from './components/LiveMiniPreviewModal';
import PhotoshopLayerInspector from './components/PhotoshopLayerInspector';
import { CanvasLayerItem, CustomGradientConfig, LayerType, ZhaketProjectData } from './types/canvasLayers';
// Heavy export libraries (html-to-image, jsPDF, JSZip, ag-psd) load on first export only.
const loadExportUtils = () => import('./utils/exportUtils');
const IconShapeLibraryModal = lazy(() => import('./components/IconShapeLibraryModal'));
const GeminiVisualComposer = lazy(() => import('./components/GeminiVisualComposer'));
const KonvaCanvasStudio = lazy(() => import('./components/KonvaCanvasStudio'));
const ProductAnalyticsChart = lazy(() => import('./components/ProductAnalyticsChart'));

import { getInitialTemplateLayers, getBlankCanvasLayers, DEFAULT_INFOGRAPHIC_ROWS } from './data/studioTemplates';
import { useStudioStore, onPersistError } from './store';
import { parseProjectFile, MAX_PROJECT_FILE_BYTES } from './store/projectFile';
import { getAssetSpec, MARKETPLACES, type AssetId } from './features/marketplace/specs';
import { checkCompliance, type ComplianceReport } from './features/marketplace/compliance';
import { measureLayers } from './features/marketplace/measure';
import { getInfographicDisplayHeight } from './utils/infographicHeight';
import { getExportAssetKey, type ExportDimensions, type ExportTarget } from './utils/exportDimensions';
import { parseCsv } from './features/batch/csv';
import { useTemplateVars } from './features/batch/template';
import { BrandKit, DEFAULT_BRAND_KIT, applyBrandToLayers, brandGradient, loadBrandKit, saveBrandKit } from './features/brand/brandKit';
import {
  patchLayer, patchLayerData, toggleLayerFlag, setFlagForZIndex, layersAtZIndex,
  moveLayer, removeLayer, appendLayer, replaceAssetLayers,
} from './features/layers/layerOps';

const safeLocalStorage = (): Storage | undefined => {
  try {
    return localStorage;
  } catch {
    return undefined;
  }
};

const readStoredString = (key: string, fallback: string): string => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const readStoredJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
};

export function App() {
  // Main Navigation & Studio Tabs
  const [activeTab, setActiveTab] = useState<'studio' | 'compliance'>('studio');
  const [isWizardMode, setIsWizardMode] = useState<boolean>(false);
  const [activeAsset, setActiveAsset] = useState<'logo80' | 'cover400' | 'cover700_1' | 'cover700_2' | 'infographic'>('cover400');
  const [targetPlatform, setTargetPlatform] = useState<'zhaket' | 'rastchin' | 'bazaar' | 'myket' | 'custom'>('zhaket');
  const [customWidth, setCustomWidth] = useState<number>(800);
  const [customHeight, setCustomHeight] = useState<number>(800);

  const getAssetDimensions = (platform: string, assetId: string) => {
    const { width, height, label } = getAssetSpec(platform, assetId, { width: customWidth, height: customHeight });
    return { width, height, label };
  };

  const getAssetExportDimensions = (assetId: AssetId): ExportDimensions => {
    const { width, height } = getAssetDimensions(targetPlatform, assetId);
    return { width, height };
  };

  // Real compliance check of the active asset against the target marketplace spec.
  // Measured from the live canvas, so it must run while the studio canvas is mounted.
  const [complianceReport, setComplianceReport] = useState<(ComplianceReport & { assetLabel: string; platform: string }) | null>(null);
  const runComplianceCheck = () => {
    const canvas = activeLiveCanvasRef.current;
    const spec = getAssetSpec(targetPlatform, activeAsset, { width: customWidth, height: customHeight });
    const measures = canvas ? measureLayers(canvas, spec.width, canvasLayers[activeAsset] || []) : [];
    setComplianceReport({ ...checkCompliance(spec, measures), assetLabel: spec.label, platform: targetPlatform });
  };

  const getWorkspaceDisplaySize = (platform: string, assetId: string, layers?: CanvasLayerItem[]) => {
    const { width: realW, height: realH } = getAssetDimensions(platform, assetId);
    
    // For infographic of zhaket, keep tall
    if (assetId === 'infographic' && platform === 'zhaket') {
      return { displayWidth: 350, displayHeight: getInfographicDisplayHeight(layers ?? canvasLayers.infographic, 430, Math.round(realH * 350 / realW)), scale: 350 / realW };
    }
    
    const maxW = 380;
    const maxH = 380;
    
    let scale = 1;
    if (realW > maxW || realH > maxH) {
      scale = Math.min(maxW / realW, maxH / realH);
    } else {
      scale = Math.min(maxW / realW, maxH / realH);
    }
    
    return {
      displayWidth: Math.round(realW * scale),
      displayHeight: Math.round(realH * scale),
      scale: scale
    };
  };
  
  // Logo Config State
  const [logoConfig, setLogoConfig] = useState<ZhaketLogoConfig>(DEFAULT_LOGO_CONFIG);

  // Sticker Modals State
  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);
  const [canvasStickers, setCanvasStickers] = useState<{ [key: string]: CanvasStickerInstance[] }>({});

  // Icon & Vector Shape Library Modal State
  const [isIconLibraryModalOpen, setIsIconLibraryModalOpen] = useState(false);

  // Active Layer selection
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);

  // Font Selection
  const [selectedFontId, setSelectedFontId] = useState<string>('vazirmatn');

  // Custom Gradient State
  const [customGradient, setCustomGradient] = useState<CustomGradientConfig>(() =>
    readStoredJson<CustomGradientConfig>('zhaket_studio_gradient', {
      type: 'linear',
      stop1: '#0f172a',
      stop2: '#1e1b4b',
      stop3: '#0f766e',
      angle: 135,
      opacity: 100,
    })
  );

  // Undoable design document (layers + infographic rows) lives in the studio store:
  // history, coalescing and autosave are handled there (see src/store).
  const canvasLayers = useStudioStore((s) => s.canvasLayers);
  const infographicRows = useStudioStore((s) => s.infographicRows);
  const canUndo = useStudioStore((s) => s.past.length > 0);
  const canRedo = useStudioStore((s) => s.future.length > 0);
  const { setCanvasLayers, setInfographicRows, transaction } = useStudioStore.getState();

  // Product Info
  const [productName, setProductName] = useState(() => readStoredString('zhaket_studio_productName', 'افزونه اپ پرمیوم ووکامرس پلاس'));
  const [productSubtitle, setProductSubtitle] = useState(() => readStoredString('zhaket_studio_productSubtitle', 'حرفه‌ای‌ترین اپلیکیشن ساز فروشگاهی وردپرس'));

  // Expose product info to text layers as {{name}} / {{subtitle}} (also Persian aliases).
  useEffect(() => {
    useTemplateVars.getState().setBase({ name: productName, subtitle: productSubtitle, 'نام': productName, 'زیرعنوان': productSubtitle });
  }, [productName, productSubtitle]);

  const handleUndo = () => {
    if (!useStudioStore.getState().undo()) return;
    setToastMessage('تغییرات لایه بازگردانی شد (Undo)');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleRedo = () => {
    if (!useStudioStore.getState().redo()) return;
    setToastMessage('تغییرات مجدداً اعمال شد (Redo)');
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Warn once when autosave fails (storage full / unavailable) instead of silently losing work.
  useEffect(
    () =>
      onPersistError((reason) => {
        setToastMessage(
          reason === 'quota'
            ? 'فضای ذخیره‌سازی مرورگر پر است؛ تغییرات اخیر ذخیره نشد. پروژه را خروجی بگیرید یا تصاویر حجیم را حذف کنید.'
            : 'ذخیره‌سازی خودکار در این مرورگر در دسترس نیست؛ پروژه را به‌صورت فایل ذخیره کنید.'
        );
        setTimeout(() => setToastMessage(null), 6000);
      }),
    []
  );

  // Keyboard Shortcuts: Undo/Redo, Delete & Duplicate (Ctrl+Z, Ctrl+Shift+Z / Ctrl+Y, Ctrl+D, Delete)
  // Handlers are read through a ref so the listener is registered once and never sees stale state.
  const shortcutHandlersRef = useRef<{ undo: () => void; redo: () => void; duplicate: () => void; remove: () => void }>(null!);
  shortcutHandlersRef.current = {
    undo: handleUndo,
    redo: handleRedo,
    duplicate: () => activeLayerId && handleDuplicateLayer(activeLayerId),
    remove: () => activeLayerId && handleDeleteLayer(activeLayerId),
  };
  const hasActiveLayerRef = useRef(false);
  hasActiveLayerRef.current = activeLayerId !== null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) {
        return;
      }
      const h = shortcutHandlersRef.current;
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (mod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) h.redo();
        else h.undo();
      } else if (mod && key === 'y') {
        e.preventDefault();
        h.redo();
      } else if (mod && key === 'd' && hasActiveLayerRef.current) {
        e.preventDefault();
        h.duplicate();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && hasActiveLayerRef.current) {
        e.preventDefault();
        h.remove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Figma Shortcuts Cheatsheet Modal State
  const [isFigmaCheatsheetOpen, setIsFigmaCheatsheetOpen] = useState(false);

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgressText, setExportProgressText] = useState<string>('');
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [sidebarActiveTab, setSidebarActiveTab] = useState<'layers' | 'mockup' | 'badges' | 'logo' | 'gradient' | 'typography' | 'image' | 'ai' | 'konva' | 'chart'>('layers');

  // Precision Dragging & Snapping Settings
  const [enableMagneticSnap, setEnableMagneticSnap] = useState(true);
  const [gridSnapSize, setGridSnapSize] = useState<number>(1);
  const [showRulers, setShowRulers] = useState(true);
  const [rulerUnit, setRulerUnit] = useState<RulerUnit>('px');
  const [showCrosshairLines, setShowCrosshairLines] = useState<boolean>(true);
  const [crosshairColor, setCrosshairColor] = useState<string>('#fbbf24');
  const [smartGuidesOpacity, setSmartGuidesOpacity] = useState<number>(90);
  const [smartGuidesThickness, setSmartGuidesThickness] = useState<number>(2);
  const [isGuidesSettingsOpen, setIsGuidesSettingsOpen] = useState<boolean>(false);
  const [draggingGuide, setDraggingGuide] = useState<DraggingGuideInfo | null>(null);

  // Right-Click Canvas Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
  } | null>(null);

  const handleOpenContextMenu = (e: React.MouseEvent, layerId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (layerId) {
      setActiveLayerId(layerId);
    }
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleOpenContextMenuAt = (x: number, y: number, layer?: CanvasLayerItem) => {
    if (layer) {
      setActiveLayerId(layer.id);
    }
    setContextMenu({
      isOpen: true,
      x,
      y,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Hidden File Input for Project Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active preview canvas ref
  const activeCanvasContainerRef = useRef<HTMLDivElement>(null);
  const activeLiveCanvasRef = useRef<HTMLDivElement>(null);

  // Dedicated off-screen export stage refs for all 5 assets
  const exportLogo80Ref = useRef<HTMLDivElement>(null);
  const exportCover400Ref = useRef<HTMLDivElement>(null);
  const exportCover700_1Ref = useRef<HTMLDivElement>(null);
  const exportCover700_2Ref = useRef<HTMLDivElement>(null);
  const exportInfographicRef = useRef<HTMLDivElement>(null);

  // Persist UI-level settings (the layers document is autosaved by the studio store)
  useEffect(() => {
    try {
      localStorage.setItem('zhaket_studio_gradient', JSON.stringify(customGradient));
      localStorage.setItem('zhaket_studio_productName', productName);
      localStorage.setItem('zhaket_studio_productSubtitle', productSubtitle);
    } catch (e) {}
  }, [customGradient, productName, productSubtitle]);

  // DND-Kit Sensors for drag and drop reordering of infographic table
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEndRows = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setInfographicRows((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setToastMessage('ترتیب ردیف‌های جدول اینفوگرافی به‌روزرسانی شد.');
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  const handleAddInfographicRow = () => {
    const nextIdx = infographicRows.length + 1;
    const newRow: InfographicRowData = {
      id: `row-${Date.now()}`,
      title: `${nextIdx}. بخش و ویژگی اختصاصی جدید`,
      desc: 'توضیحات تکمیلی پیرامون قابلیت‌های برجسته، کارایی و ارزش افزوده این محصول برای مشتریان.',
      items: ['✓ قابلیت سفارشی', '✓ سرعت و راندمان بالا', '✓ رابط کاربری مدرن', '✓ گارانتی بازگشت وجه']
    };
    setInfographicRows((prev) => [...prev, newRow]);
    setToastMessage('ردیف جدید با انیمیشن ورود به اینفوگرافی افزوده شد.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleResetInfographicRows = () => {
    setInfographicRows(DEFAULT_INFOGRAPHIC_ROWS);
    setToastMessage('تمامی ردیف‌های اینفوگرافی به قالب اولیه بازگردانی شدند.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpdateInfographicRowTitle = (id: string, newTitle: string) => {
    setInfographicRows((prev) => prev.map((r) => r.id === id ? { ...r, title: newTitle } : r), { coalesceKey: `row-title:${id}` });
  };

  const handleUpdateInfographicRowDesc = (id: string, newDesc: string) => {
    setInfographicRows((prev) => prev.map((r) => r.id === id ? { ...r, desc: newDesc } : r), { coalesceKey: `row-desc:${id}` });
  };

  const handleUpdateInfographicRowItem = (id: string, itemIdx: number, newItem: string) => {
    setInfographicRows((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const nextItems = [...r.items];
      nextItems[itemIdx] = newItem;
      return { ...r, items: nextItems };
    }), { coalesceKey: `row-item:${id}:${itemIdx}` });
  };

  const handleDeleteInfographicRow = (id: string) => {
    setInfographicRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Dynamic Background Generator
  const getDynamicBackgroundStyle = (): React.CSSProperties => {
    const { type, stop1, stop2, stop3, angle, opacity } = customGradient;
    const alpha = (opacity ?? 100) / 100;
    
    if (type === 'radial') {
      return {
        background: `radial-gradient(circle at 50% 50%, ${stop1}, ${stop2} 60%, ${stop3 || stop2} 100%)`,
        opacity: alpha,
      };
    }
    if (type === 'conic') {
      return {
        background: `conic-gradient(from ${angle}deg at 50% 50%, ${stop1}, ${stop2}, ${stop3 || stop1}, ${stop1})`,
        opacity: alpha,
      };
    }
    return {
      background: `linear-gradient(${angle}deg, ${stop1} 0%, ${stop2} 55%, ${stop3 || stop2} 100%)`,
      opacity: alpha,
    };
  };

  const currentFontCss = PERSIAN_FONTS.find((f) => f.id === selectedFontId)?.cssClass || 'font-vazirmatn';

  const handleRandomizeGradient = () => {
    const p = PRESET_GRADIENTS[Math.floor(Math.random() * PRESET_GRADIENTS.length)];
    const randomAngle = Math.floor(Math.random() * 8) * 45;
    setCustomGradient({
      type: 'linear',
      stop1: p.stop1,
      stop2: p.stop2,
      stop3: p.stop3,
      angle: randomAngle,
      opacity: 100,
    });
    setToastMessage(`گرادیانت «${p.name}» با زاویه ${randomAngle}° اعمال شد.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Layer Management Handlers
  const currentLayers = canvasLayers[activeAsset] || [];
  const hasActiveLayers = currentLayers.filter((l) => l.type !== 'background').length > 0 || (canvasStickers[activeAsset] || []).length > 0;

  const handleSelectLayer = (id: string) => {
    setActiveLayerId(id === activeLayerId ? null : id);
    if (id !== activeLayerId) {
      setSidebarActiveTab('layers');
    }
  };

  const handleToggleVisibility = (id: string) => {
    setCanvasLayers((prev) => toggleLayerFlag(prev, activeAsset, id, 'visible'));
  };

  const handleToggleLock = (id: string) => {
    setCanvasLayers((prev) => toggleLayerFlag(prev, activeAsset, id, 'locked'));
  };

  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    setCanvasLayers((prev) => moveLayer(prev, activeAsset, id, direction));
  };

  const handleDeleteLayer = (id: string) => {
    setCanvasLayers((prev) => removeLayer(prev, activeAsset, id));
    if (activeLayerId === id) setActiveLayerId(null);
  };

  const handleDuplicateLayer = (id: string) => {
    const target = currentLayers.find((l) => l.id === id);
    if (!target) return;
    const newId = `layer-dup-${Date.now()}`;
    const clone: CanvasLayerItem = {
      ...target,
      id: newId,
      name: `${target.name} (کپی)`,
      x: (target.x || 0) + 15,
      y: (target.y || 0) + 15,
    };
    setCanvasLayers((prev) => appendLayer(prev, activeAsset, clone));
    setActiveLayerId(newId);
    setToastMessage(`لایه «${target.name}» کپی شد.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleReorderLayers = (newLayers: CanvasLayerItem[]) => {
    setCanvasLayers((prev) => replaceAssetLayers(prev, activeAsset, newLayers));
  };

  const handleToggleSameZIndexFlag = (zIndex: number, flag: 'visible' | 'locked') => {
    const targetLayers = layersAtZIndex(canvasLayers, activeAsset, zIndex);
    if (targetLayers.length === 0) return null;
    const allOn = flag === 'visible'
      ? targetLayers.every((l) => l.visible !== false)
      : targetLayers.every((l) => l.locked === true);
    const value = !allOn;
    setCanvasLayers((prev) => setFlagForZIndex(prev, activeAsset, zIndex, flag, value));
    return { value, count: targetLayers.length };
  };

  const handleToggleSameZIndexVisibility = (zIndex: number) => {
    const result = handleToggleSameZIndexFlag(zIndex, 'visible');
    if (!result) return;
    setToastMessage(
      result.value
        ? `تمامی لایه‌های سطح Z:${zIndex} نمایان شدند (${result.count} لایه)`
        : `تمامی لایه‌های سطح Z:${zIndex} مخفی شدند (${result.count} لایه)`
    );
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleSameZIndexLock = (zIndex: number) => {
    const result = handleToggleSameZIndexFlag(zIndex, 'locked');
    if (!result) return;
    setToastMessage(
      result.value
        ? `تمامی لایه‌های سطح Z:${zIndex} قفل شدند (${result.count} لایه)`
        : `قفل تمامی لایه‌های سطح Z:${zIndex} باز شد (${result.count} لایه)`
    );
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Continuous edits (sliders, typing, drags) on the same layer + fields collapse into one undo step.
  const editKey = (kind: string, id: string, fields: object) =>
    `${kind}:${activeAsset}:${id}:${Object.keys(fields).sort().join(',')}`;

  const handleUpdateLayer = (id: string, updates: Partial<CanvasLayerItem>) => {
    setCanvasLayers((prev) => patchLayer(prev, activeAsset, id, updates), { coalesceKey: editKey('layer', id, updates) });
  };

  const handleUpdateLayerPosition = (id: string, x: number, y: number) => {
    setCanvasLayers((prev) => patchLayer(prev, activeAsset, id, { x, y }), { coalesceKey: editKey('layer', id, { x, y }) });
  };

  const handleUpdateLayerData = (id: string, newData: any) => {
    setCanvasLayers((prev) => patchLayerData(prev, activeAsset, id, newData), { coalesceKey: editKey('data', id, newData) });
  };

  // Add custom layer from Icon & Shape Library Modal
  const handleAddCustomLayer = (layerConfig: Partial<CanvasLayerItem>) => {
    const newId = `layer-${Date.now()}`;
    const newLayer: CanvasLayerItem = {
      id: newId,
      name: layerConfig.name || 'المان جدید',
      type: layerConfig.type || 'icon-library',
      visible: true,
      locked: false,
      zIndex: (currentLayers.length + 1) * 10,
      scale: layerConfig.scale || 1,
      rotation: layerConfig.rotation || 0,
      opacity: layerConfig.opacity || 100,
      x: layerConfig.x ?? 80,
      y: layerConfig.y ?? 80,
      data: layerConfig.data || {},
    };

    setCanvasLayers((prev) => appendLayer(prev, activeAsset, newLayer));
    setActiveLayerId(newId);
    setToastMessage(`المان «${newLayer.name}» به بوم افزوده شد.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddMockupLayer = (mockupConfig: Partial<CanvasLayerItem>) => {
    const newId = `mockup-${Date.now()}`;
    const mockupType = mockupConfig.data?.mockupType || 'mobile';
    const mockupSize = {
      mobile: { width: 128, height: 256 },
      tablet: { width: 192, height: 256 },
      laptop: { width: 256, height: 154 },
      desktop: { width: 256, height: 216 },
      browser: { width: 240, height: 176 },
      box3d: { width: 144, height: 192 },
    }[mockupType];
    const { displayWidth, displayHeight } = getWorkspaceDisplaySize(targetPlatform, activeAsset);
    const newLayer: CanvasLayerItem = {
      id: newId,
      name: mockupConfig.name || 'موکاپ جدید',
      type: 'mockup',
      visible: true,
      locked: false,
      zIndex: (currentLayers.length + 1) * 10,
      scale: mockupConfig.scale || 0.9,
      rotation: mockupConfig.rotation || 0,
      opacity: mockupConfig.opacity || 100,
      x: Math.max(0, Math.round((displayWidth - mockupSize.width) / 2)),
      y: Math.max(0, Math.round((displayHeight - mockupSize.height) / 2)),
      data: mockupConfig.data || {},
    };

    setCanvasLayers((prev) => appendLayer(prev, activeAsset, newLayer));
    setActiveLayerId(newId);
    setToastMessage('موکاپ سه‌بعدی به بوم افزوده شد.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddChartLayer = (chartConfig: Partial<CanvasLayerItem>) => {
    const newId = `chart-${Date.now()}`;
    const { displayWidth, displayHeight } = getWorkspaceDisplaySize(targetPlatform, activeAsset);
    const fitScale = Math.min(1, displayWidth / 340, displayHeight / 230);
    const width = Math.round(340 * fitScale);
    const height = Math.round(230 * fitScale);
    const newLayer: CanvasLayerItem = {
      id: newId,
      name: chartConfig.name || 'نمودار تحلیل محصول',
      type: 'chart',
      visible: true,
      locked: false,
      zIndex: (currentLayers.length + 1) * 10,
      scale: 1,
      rotation: 0,
      opacity: 100,
      x: Math.max(0, Math.round((displayWidth - width) / 2)),
      y: Math.max(0, Math.round((displayHeight - height) / 2)),
      data: {
        ...chartConfig.data,
        width,
        height,
      },
    };

    setCanvasLayers((prev) => appendLayer(prev, activeAsset, newLayer));
    setActiveLayerId(newId);
    setToastMessage('نمودار تحلیل محصول به بوم افزوده شد.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddImageLayer = (imageConfig: Partial<CanvasLayerItem>) => {
    const newId = `img-${Date.now()}`;
    const newLayer: CanvasLayerItem = {
      id: newId,
      name: imageConfig.name || 'تصویر آپلود شده',
      type: 'ai-graphic',
      visible: true,
      locked: false,
      zIndex: (currentLayers.length + 1) * 10,
      scale: imageConfig.scale || 1.0,
      rotation: 0,
      opacity: 100,
      x: 100,
      y: 70,
      data: imageConfig.data || {},
    };

    setCanvasLayers((prev) => appendLayer(prev, activeAsset, newLayer));
    setActiveLayerId(newId);
    setToastMessage('عکس دلخواه شما روی بوم قرار گرفت!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddVectorLayer = (layerConfig: Partial<CanvasLayerItem>) => {
    const newId = `vector-${Date.now()}`;
    const newLayer: CanvasLayerItem = {
      id: newId,
      name: layerConfig.name || 'وکتور AI',
      type: layerConfig.type || 'vector-shape',
      visible: true,
      locked: false,
      zIndex: (currentLayers.length + 1) * 10,
      scale: layerConfig.scale || 1.0,
      rotation: layerConfig.rotation || 0,
      opacity: layerConfig.opacity || 100,
      x: 100,
      y: 60,
      data: layerConfig.data || {},
    };

    setCanvasLayers((prev) => appendLayer(prev, activeAsset, newLayer));
    setActiveLayerId(newId);
    setToastMessage('المان هوش مصنوعی به بوم اضافه شد!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Comprehensive Quick Add Handler for All Layer Types
  const handleQuickAdd = (type: LayerType) => {
    if (type === 'icon-library') {
      setIsIconLibraryModalOpen(true);
      return;
    }
    if (type === 'sticker') {
      setIsStickerModalOpen(true);
      return;
    }

    const newId = `layer-${Date.now()}`;
    let newLayer: CanvasLayerItem;

    switch (type) {
      case 'discount-ribbon':
        newLayer = {
          id: newId,
          name: 'برچسب تخفیف ویژه',
          type: 'discount-ribbon',
          visible: true,
          locked: false,
          zIndex: (currentLayers.length + 1) * 10,
          scale: 1,
          rotation: -4,
          opacity: 100,
          x: 20,
          y: 20,
          data: {
            discountPercent: 50,
            badgeText: 'تخفیف شگفت‌انگیز',
          },
        };
        break;

      case 'rating-badge':
        newLayer = {
          id: newId,
          name: 'ستاره و امتیاز خریداران',
          type: 'rating-badge',
          visible: true,
          locked: false,
          zIndex: (currentLayers.length + 1) * 10,
          scale: 1,
          rotation: 0,
          opacity: 100,
          x: 20,
          y: 200,
          data: {
            rating: 5.0,
            reviewsCount: 148,
          },
        };
        break;

      case 'price-tag':
        newLayer = {
          id: newId,
          name: 'برچسب قیمت و آفر',
          type: 'price-tag',
          visible: true,
          locked: false,
          zIndex: (currentLayers.length + 1) * 10,
          scale: 1,
          rotation: 0,
          opacity: 100,
          x: 180,
          y: 20,
          data: {
            price: '۱۹۹,۰۰۰',
            currency: 'تومان',
            oldPrice: '۳۹۹,۰۰۰',
          },
        };
        break;

      case 'shape':
        newLayer = {
          id: newId,
          name: 'ستاره نئونی وکتور',
          type: 'shape',
          visible: true,
          locked: false,
          zIndex: (currentLayers.length + 1) * 10,
          scale: 1,
          rotation: 0,
          opacity: 100,
          x: 120,
          y: 60,
          data: {
            shapeVariant: 'star-badge',
            badgeText: 'ویژه',
            fillColor: '#f59e0b',
          },
        };
        break;

      case 'text':
        newLayer = {
          id: newId,
          name: 'متن و عنوان جدید',
          type: 'text',
          visible: true,
          locked: false,
          zIndex: (currentLayers.length + 1) * 10,
          scale: 1,
          rotation: 0,
          opacity: 100,
          x: 20,
          y: 80,
          data: {
            text: 'عنوان دلخواه محصول',
            subtitle: 'توضیحات کوتاه و ویژگی‌های شاخص',
            fontSize: 18,
            textColor: '#ffffff',
          },
        };
        break;

      case 'badge':
        newLayer = {
          id: newId,
          name: 'نشان دسته‌بندی جدید',
          type: 'badge',
          visible: true,
          locked: false,
          zIndex: (currentLayers.length + 1) * 10,
          scale: 1,
          rotation: 0,
          opacity: 100,
          x: 15,
          y: 15,
          data: {
            badgeText: 'نشان اختصاصی محصول',
          },
        };
        break;

      case 'feature-pills':
        newLayer = {
          id: newId,
          name: 'کپسول‌های ویژگی',
          type: 'feature-pills',
          visible: true,
          locked: false,
          zIndex: (currentLayers.length + 1) * 10,
          scale: 1,
          rotation: 0,
          opacity: 100,
          x: 10,
          y: 140,
          data: {
            features: ['ویژگی اول', 'ویژگی دوم', 'ویژگی سوم', 'ویژگی چهارم'],
          },
        };
        break;

      case 'stat-card':
        newLayer = {
          id: newId,
          name: 'باکس مشخصات و آمار',
          type: 'stat-card',
          visible: true,
          locked: false,
          zIndex: (currentLayers.length + 1) * 10,
          scale: 1,
          rotation: 0,
          opacity: 100,
          x: 10,
          y: 220,
          data: {
            stats: [
              { title: 'سرعت توربو', subtitle: 'بهینه و سبک', color: 'text-amber-400' },
              { title: 'پشتیبانی', subtitle: 'پاسخگویی سریع', color: 'text-emerald-400' },
              { title: 'آپدیت', subtitle: 'مادام‌العمر', color: 'text-purple-400' },
            ],
          },
        };
        break;

      case 'trust-seal':
        newLayer = {
          id: newId,
          name: 'تاییدیه و گارانتی ژاکت',
          type: 'trust-seal',
          visible: true,
          locked: false,
          zIndex: (currentLayers.length + 1) * 10,
          scale: 1,
          rotation: 0,
          opacity: 100,
          x: 10,
          y: 275,
          data: {
            trustTitle: 'تاییدیه رسمی مارکت ژاکت',
            trustSubtitle: '۶ ماه پشتیبانی رایگان و آپدیت مادام‌العمر',
          },
        };
        break;

      default:
        return;
    }

    setCanvasLayers((prev) => appendLayer(prev, activeAsset, newLayer));
    setActiveLayerId(newId);
    setToastMessage(`لایه «${newLayer.name}» به بوم افزوده شد.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddStickerToActiveAsset = (sticker: SemanticSticker) => {
    const newId = `badge-${Date.now()}`;
    const newLayer: CanvasLayerItem = {
      id: newId,
      name: `بج ${sticker.title}`,
      type: 'zhaket-badge',
      visible: true,
      locked: false,
      zIndex: (currentLayers.length + 1) * 10,
      scale: 1,
      rotation: 0,
      opacity: 100,
      x: 25,
      y: 50,
      data: {
        badgeTitle: sticker.title,
        badgeText: sticker.title,
        badgeTagline: sticker.tagline,
        badgeIcon: sticker.iconValue,
        badgeStyle: sticker.badgeStyle,
        textColor: sticker.textColor || '#ffffff',
        borderColor: sticker.borderColor || '#f59e0b',
      },
    };

    setCanvasLayers((prev) => appendLayer(prev, activeAsset, newLayer));
    setActiveLayerId(newId);
    setToastMessage(`بج رسمی ژاکت «${sticker.title}» با کنترل کامل استاندارد به لایه‌ها افزوده شد.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddLogoLayerToActiveAsset = (logoUrl?: string) => {
    const newId = `layer-logo-${Date.now()}`;
    const newLayer: CanvasLayerItem = {
      id: newId,
      name: 'لوگوی رسمی ژاکت (قابل کلیک و حذف)',
      type: 'logo',
      visible: true,
      locked: false,
      zIndex: (currentLayers.length + 1) * 10,
      scale: 1,
      rotation: 0,
      opacity: 100,
      x: 20,
      y: 20,
      data: {
        customLogoUrl: logoUrl || logoConfig.customLogoUrl || undefined,
        logoSize: logoConfig.customSizePx || 48,
        boxPadding: logoConfig.boxPaddingPx || 8,
        boxRadiusPx: logoConfig.boxRadiusPx || 12,
        boxBgColor: logoConfig.boxBgColor || 'rgba(15, 23, 42, 0.85)',
        boxBorderColor: logoConfig.boxBorderColor || 'rgba(245, 158, 11, 0.5)',
      },
    };

    setCanvasLayers((prev) => appendLayer(prev, activeAsset, newLayer));
    setActiveLayerId(newId);
    setToastMessage('لایه‌ی لوگوی ژاکت با قابلیت کلیک، آپلود و حذف به بوم اضافه شد.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleRemoveStickerFromActiveAsset = (instanceId: string) => {
    setCanvasStickers((prev) => ({
      ...prev,
      [activeAsset]: (prev[activeAsset] || []).filter((s) => s.instanceId !== instanceId),
    }));
  };

  const handleUpdateStickerPosition = (instanceId: string, x: number, y: number) => {
    setCanvasStickers((prev) => ({
      ...prev,
      [activeAsset]: (prev[activeAsset] || []).map((s) =>
        s.instanceId === instanceId ? { ...s, x, y } : s
      ),
    }));
  };

  const handleCenterActiveLayer = (axis: 'x' | 'y' | 'both') => {
    if (!activeLayerId) return;
    const target = currentLayers.find((l) => l.id === activeLayerId);
    if (!target) return;
    const { displayWidth, displayHeight } = getWorkspaceDisplaySize(targetPlatform, activeAsset);
    const curX = target.x || 0;
    const curY = target.y || 0;
    const nextX = axis === 'x' || axis === 'both' ? Math.round(displayWidth / 2 - 50) : curX;
    const nextY = axis === 'y' || axis === 'both' ? Math.round(displayHeight / 2 - 25) : curY;
    handleUpdateLayerPosition(activeLayerId, nextX, nextY);
    setToastMessage(`لایه ${axis === 'both' ? 'در مرکز کامل بوم' : axis === 'x' ? 'در مرکز افقی' : 'در مرکز عمودی'} تراز شد.`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Resets run as one transaction so a single Ctrl+Z restores both layers and rows.
  const handleResetToBlank = () => {
    transaction(() => {
      setCanvasLayers(getBlankCanvasLayers());
      setInfographicRows([]);
    });
    setCanvasStickers({});
    setActiveLayerId(null);
    setToastMessage('تمامی بوم‌ها کاملاً خالی شدند. در صورت تمایل با کلیدهای Ctrl+Z بازگردانی کنید.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetToTemplate = () => {
    transaction(() => {
      setCanvasLayers(getInitialTemplateLayers());
      setInfographicRows(DEFAULT_INFOGRAPHIC_ROWS);
    });
    setCanvasStickers({});
    setActiveLayerId(null);
    setToastMessage('قالب استاندارد ژاکت با تمامی لایه‌ها و دارایی‌ها بارگذاری شد.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetActiveAssetToTemplate = () => {
    transaction(() => {
      setCanvasLayers((prev) => replaceAssetLayers(prev, activeAsset, getInitialTemplateLayers()[activeAsset] || []));
      if (activeAsset === 'infographic') setInfographicRows(DEFAULT_INFOGRAPHIC_ROWS);
    });
    setCanvasStickers((prev) => ({ ...prev, [activeAsset]: [] }));
    setActiveLayerId(null);
    setToastMessage(`قالب استاندارد برای «${activeAsset}» با موفقیت بازیابی گردید.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetActiveAssetToBlank = () => {
    transaction(() => {
      setCanvasLayers((prev) => replaceAssetLayers(prev, activeAsset, getBlankCanvasLayers()[activeAsset] || []));
      if (activeAsset === 'infographic') setInfographicRows([]);
    });
    setCanvasStickers((prev) => ({ ...prev, [activeAsset]: [] }));
    setActiveLayerId(null);
    setToastMessage(`بوم «${activeAsset}» کاملاً خالی شد.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Add Vector Shape directly to the active canvas (Unified Vector Canvas integration)
  const handleAddVectorShape = (
    type: 'rect' | 'circle' | 'star' | 'text' | 'badge' | 'discount-ribbon' | 'stat-card' | 'feature-pills'
  ) => {
    const newId = `vector-${Date.now()}`;
    let newLayer: CanvasLayerItem;

    if (type === 'rect') {
      newLayer = {
        id: newId,
        name: 'مستطیل برداری / کارت شیشه‌ای',
        type: 'shape',
        visible: true,
        locked: false,
        zIndex: (currentLayers.length + 1) * 10,
        scale: 1,
        rotation: 0,
        opacity: 100,
        x: 90,
        y: 80,
        data: {
          shapeType: 'vector-rect',
          shapeText: 'کارت شیشه‌ای مدرن',
          fillColor: 'rgba(79, 70, 229, 0.5)',
          strokeColor: '#818cf8',
          width: 140,
          height: 75,
        },
      };
    } else if (type === 'circle') {
      newLayer = {
        id: newId,
        name: 'دایره برداری / حلقه نوری',
        type: 'shape',
        visible: true,
        locked: false,
        zIndex: (currentLayers.length + 1) * 10,
        scale: 1,
        rotation: 0,
        opacity: 100,
        x: 110,
        y: 100,
        data: {
          shapeType: 'vector-circle',
          shapeText: 'دایره برداری',
          fillColor: 'rgba(16, 185, 129, 0.5)',
          strokeColor: '#34d399',
          radius: 38,
        },
      };
    } else if (type === 'star') {
      newLayer = {
        id: newId,
        name: 'ستاره و نشان طلایی',
        type: 'shape',
        visible: true,
        locked: false,
        zIndex: (currentLayers.length + 1) * 10,
        scale: 1,
        rotation: 0,
        opacity: 100,
        x: 120,
        y: 110,
        data: {
          shapeType: 'vector-star',
          shapeText: 'ویژه',
          fillColor: '#f59e0b',
          strokeColor: '#fbbf24',
        },
      };
    } else if (type === 'text') {
      newLayer = {
        id: newId,
        name: 'تیتر برداری اختصاصی',
        type: 'text',
        visible: true,
        locked: false,
        zIndex: (currentLayers.length + 1) * 10,
        scale: 1,
        rotation: 0,
        opacity: 100,
        x: 50,
        y: 80,
        data: {
          text: 'تیتر اختصاصی و جذاب محصول',
          subtitle: 'توضیحات تکمیلی پیرامون امکانات شاخص',
          fontSize: 18,
          textColor: '#ffffff',
          textAlign: 'center',
        },
      };
    } else if (type === 'discount-ribbon') {
      newLayer = {
        id: newId,
        name: 'روبان آفر شگفت‌انگیز',
        type: 'discount-ribbon',
        visible: true,
        locked: false,
        zIndex: (currentLayers.length + 1) * 10,
        scale: 1,
        rotation: -4,
        opacity: 100,
        x: 30,
        y: 30,
        data: {
          discountPercent: '۵۰٪ تخفیف ویژه',
        },
      };
    } else if (type === 'badge') {
      newLayer = {
        id: newId,
        name: 'نشان اصالت محصول',
        type: 'badge',
        visible: true,
        locked: false,
        zIndex: (currentLayers.length + 1) * 10,
        scale: 1,
        rotation: 0,
        opacity: 100,
        x: 20,
        y: 20,
        data: {
          badgeText: 'اورجینال و تایید شده ژاکت',
        },
      };
    } else if (type === 'stat-card') {
      newLayer = {
        id: newId,
        name: 'باکس مشخصات فنی',
        type: 'stat-card',
        visible: true,
        locked: false,
        zIndex: (currentLayers.length + 1) * 10,
        scale: 1,
        rotation: 0,
        opacity: 100,
        x: 20,
        y: 180,
        data: {
          stats: [
            { title: 'سرعت لود', subtitle: 'کمتر از ۱ ثانیه', color: 'text-amber-400' },
            { title: 'پشتیبانی', subtitle: 'پاسخگویی سریع', color: 'text-emerald-400' },
            { title: 'آپدیت', subtitle: 'مادام‌العمر', color: 'text-cyan-400' },
          ],
        },
      };
    } else {
      newLayer = {
        id: newId,
        name: 'کپسول‌های ویژگی',
        type: 'feature-pills',
        visible: true,
        locked: false,
        zIndex: (currentLayers.length + 1) * 10,
        scale: 1,
        rotation: 0,
        opacity: 100,
        x: 20,
        y: 110,
        data: {
          features: ['سازگاری با درگاه‌های شاپرک', 'همگام‌سازی ابری', 'پنل تنظیمات فارسی', 'پشتیبانی VIP'],
        },
      };
    }

    setCanvasLayers((prev) => appendLayer(prev, activeAsset, newLayer));
    setActiveLayerId(newId);
    setToastMessage(`لایه برداری «${newLayer.name}» به بوم افزوده شد.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Bridge Konva canvas shapes to native main canvas layers
  const handleSendKonvaShapeToMainCanvas = (shape: any) => {
    const newId = `konva-layer-${Date.now()}`;
    let newLayer: CanvasLayerItem;

    if (shape.type === 'rect') {
      newLayer = {
        id: newId,
        name: 'مستطیل Konva',
        type: 'shape',
        visible: true,
        locked: false,
        zIndex: (currentLayers.length + 1) * 10,
        scale: 1,
        rotation: shape.rotation || 0,
        opacity: 100,
        x: shape.x || 80,
        y: shape.y || 80,
        data: {
          shapeType: 'vector-rect',
          shapeText: 'مستطیل برداری',
          fillColor: shape.fill || 'rgba(99, 102, 241, 0.5)',
          strokeColor: '#818cf8',
          width: shape.width || 100,
          height: shape.height || 60,
        },
      };
    } else if (shape.type === 'circle') {
      newLayer = {
        id: newId,
        name: 'دایره Konva',
        type: 'shape',
        visible: true,
        locked: false,
        zIndex: (currentLayers.length + 1) * 10,
        scale: 1,
        rotation: shape.rotation || 0,
        opacity: 100,
        x: shape.x || 80,
        y: shape.y || 80,
        data: {
          shapeType: 'vector-circle',
          shapeText: 'دایره برداری',
          fillColor: shape.fill || 'rgba(16, 185, 129, 0.5)',
          strokeColor: '#34d399',
          radius: shape.radius || 35,
        },
      };
    } else if (shape.type === 'star') {
      newLayer = {
        id: newId,
        name: 'ستاره Konva',
        type: 'shape',
        visible: true,
        locked: false,
        zIndex: (currentLayers.length + 1) * 10,
        scale: 1,
        rotation: shape.rotation || 0,
        opacity: 100,
        x: shape.x || 80,
        y: shape.y || 80,
        data: {
          shapeType: 'vector-star',
          shapeText: 'ویژه',
          fillColor: shape.fill || '#f59e0b',
          strokeColor: '#fbbf24',
        },
      };
    } else {
      newLayer = {
        id: newId,
        name: 'متن Konva',
        type: 'text',
        visible: true,
        locked: false,
        zIndex: (currentLayers.length + 1) * 10,
        scale: 1,
        rotation: shape.rotation || 0,
        opacity: 100,
        x: shape.x || 60,
        y: shape.y || 80,
        data: {
          text: shape.text || 'متن برداری Konva',
          fontSize: shape.fontSize || 18,
          textColor: shape.fill || '#ffffff',
          textAlign: 'center',
        },
      };
    }

    setCanvasLayers((prev) => appendLayer(prev, activeAsset, newLayer));
    setActiveLayerId(newId);
    setToastMessage(`شکل برداری Konva به بوم اصلی منتقل شد.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleBringLayerForward = () => {
    if (!activeLayerId) return;
    handleMoveLayer(activeLayerId, 'up');
  };

  const handleSendLayerBackward = () => {
    if (!activeLayerId) return;
    handleMoveLayer(activeLayerId, 'down');
  };

  // SAVE PROJECT TO FILE (.json)
  const handleSaveProjectFile = () => {
    const projectData: ZhaketProjectData = {
      version: '2.0.0',
      savedAt: new Date().toISOString(),
      productName,
      productSubtitle,
      selectedFontId,
      activeAsset,
      customGradient,
      logoConfig,
      canvasLayers,
      canvasStickers,
      infographicRows,
      cover400Features: [],
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `zhaket-project-${productName.replace(/\s+/g, '_')}-${Date.now()}.zhaket.json`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    setToastMessage('فایل پروژه با تمام لایه‌ها و آخرین تغییرات با موفقیت ذخیره گردید.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // LOAD PROJECT FROM FILE (.json)
  const handleLoadProjectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PROJECT_FILE_BYTES) {
      setToastMessage('خطا: حجم فایل پروژه بیش از حد مجاز است.');
      setTimeout(() => setToastMessage(null), 4000);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = parseProjectFile(String(event.target?.result ?? ''));
        if (!result.ok) {
          setToastMessage(`خطا: ${result.error}`);
          setTimeout(() => setToastMessage(null), 4000);
          return;
        }
        const parsed = result.data;
        // One undo step restores the pre-import design.
        transaction(() => {
          if (parsed.canvasLayers) setCanvasLayers(parsed.canvasLayers);
          if (parsed.infographicRows) setInfographicRows(parsed.infographicRows);
        });
        if (parsed.customGradient) setCustomGradient(parsed.customGradient);
        if (parsed.productName !== undefined) setProductName(parsed.productName);
        if (parsed.productSubtitle !== undefined) setProductSubtitle(parsed.productSubtitle);
        if (parsed.selectedFontId) setSelectedFontId(parsed.selectedFontId);
        if (parsed.logoConfig) setLogoConfig(parsed.logoConfig);
        if (parsed.canvasStickers) setCanvasStickers(parsed.canvasStickers);

        setToastMessage('پروژه با موفقیت بارگذاری و تمامی لایه‌ها بازیابی شدند.');
      } catch (err) {
        setToastMessage('خطا: فایل انتخاب شده معتبر نیست.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Safe Export Target Resolver: ALWAYS prefers the real live canvas card that is visible on screen,
  // EXCEPT for infographic, where the complete full-length clean export stage (exportInfographicRef)
  // must be used to ensure the entire canvas is captured without scrollbar cutting or settings controls!
  const getTargetExportElement = (): HTMLElement | null => {
    if (activeAsset === 'infographic') {
      if (exportInfographicRef.current) return exportInfographicRef.current;
    }
    if (activeLiveCanvasRef.current) {
      return activeLiveCanvasRef.current;
    }
    if (activeAsset === 'logo80' && exportLogo80Ref.current) return exportLogo80Ref.current;
    if (activeAsset === 'cover400' && exportCover400Ref.current) return exportCover400Ref.current;
    if (activeAsset === 'cover700_1' && exportCover700_1Ref.current) return exportCover700_1Ref.current;
    if (activeAsset === 'cover700_2' && exportCover700_2Ref.current) return exportCover700_2Ref.current;
    if (activeAsset === 'infographic' && exportInfographicRef.current) return exportInfographicRef.current;
    return activeCanvasContainerRef.current;
  };

  const handleExportPng = async () => {
    const el = getTargetExportElement();
    if (!el) {
      setToastMessage('المان تصویر برای خروجی در دسترس نیست.');
      return;
    }

    // 1. Temporarily deselect any active layer to remove selection ring, handles and coordinates HUD
    const prevSelectedId = activeLayerId;
    setActiveLayerId(null);

    setIsExporting(true);
    setExportProgressText('در حال آماده‌سازی تصویر باکیفیت PNG دقیقاً مطابق چیدمان زنده بوم...');

    try {
      // 2. Allow React to re-render without selection ring
      await new Promise((resolve) => setTimeout(resolve, 80));

      await (await loadExportUtils()).exportToPng(
        el,
        `zhaket-${activeAsset}-${Date.now()}.png`,
        getAssetExportDimensions(activeAsset),
      );
      setToastMessage('فایل PNG دقیقاً عینا مطابق بوم طراحی با کیفیت عالی دانلود شد.');
    } catch (err: any) {
      console.error(err);
      setToastMessage('خطا در خروجی PNG: ' + (err.message || ''));
    } finally {
      if (prevSelectedId) setActiveLayerId(prevSelectedId);
      setIsExporting(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleExportPdf = async () => {
    const el = getTargetExportElement();
    if (!el) {
      setToastMessage('المان تصویر در دسترس نیست.');
      return;
    }

    const prevSelectedId = activeLayerId;
    setActiveLayerId(null);

    setIsExporting(true);
    setExportProgressText('در حال تولید فایل استاندارد PDF دقیقاً مطابق بوم طراحی...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 80));
      await (await loadExportUtils()).exportToPdf(
        el,
        `zhaket-${activeAsset}-${Date.now()}.pdf`,
        undefined,
        getAssetExportDimensions(activeAsset),
      );
      setToastMessage('فایل PDF با آخرین تغییرات بوم دانلود شد.');
    } catch (err: any) {
      console.error(err);
      setToastMessage('خطا در خروجی PDF: ' + (err.message || ''));
    } finally {
      if (prevSelectedId) setActiveLayerId(prevSelectedId);
      setIsExporting(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleExportPsd = async () => {
    const el = getTargetExportElement();
    if (!el) {
      setToastMessage('المان تصویر در دسترس نیست.');
      return;
    }

    const prevSelectedId = activeLayerId;
    setActiveLayerId(null);

    setIsExporting(true);
    setExportProgressText('در حال ساخت فایل لایه‌باز PSD فتوشاپ...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 80));
      await (await loadExportUtils()).exportToPsd(
        el,
        `zhaket-${activeAsset}-${Date.now()}.psd`,
        getAssetExportDimensions(activeAsset),
      );
      setToastMessage('فایل لایه‌باز PSD فتوشاپ با موفقیت دانلود شد.');
    } catch (err: any) {
      console.error(err);
      setToastMessage('خطا در خروجی PSD: ' + (err.message || ''));
    } finally {
      if (prevSelectedId) setActiveLayerId(prevSelectedId);
      setIsExporting(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const collectExportMap = () => {
    const map: { [key: string]: ExportTarget } = {};
    const add = (prefix: string, assetId: AssetId, element: HTMLElement | null) => {
      if (!element) return;
      const dimensions = getAssetExportDimensions(assetId);
      const key = getExportAssetKey(prefix, dimensions);
      map[key] = { element, dimensions };
    };

    if (activeAsset === 'logo80' && activeLiveCanvasRef.current) {
      add('1_logo', 'logo80', activeLiveCanvasRef.current);
    } else {
      add('1_logo', 'logo80', exportLogo80Ref.current);
    }

    if (activeAsset === 'cover400' && activeLiveCanvasRef.current) {
      add('2_cover400', 'cover400', activeLiveCanvasRef.current);
    } else {
      add('2_cover400', 'cover400', exportCover400Ref.current);
    }

    if (activeAsset === 'cover700_1' && activeLiveCanvasRef.current) {
      add('3_cover700_feature1', 'cover700_1', activeLiveCanvasRef.current);
    } else {
      add('3_cover700_feature1', 'cover700_1', exportCover700_1Ref.current);
    }

    if (activeAsset === 'cover700_2' && activeLiveCanvasRef.current) {
      add('4_cover700_feature2', 'cover700_2', activeLiveCanvasRef.current);
    } else {
      add('4_cover700_feature2', 'cover700_2', exportCover700_2Ref.current);
    }

    if (exportInfographicRef.current) {
      add('5_infographic', 'infographic', exportInfographicRef.current);
    } else if (activeAsset === 'infographic' && activeLiveCanvasRef.current) {
      add('5_infographic', 'infographic', activeLiveCanvasRef.current);
    }

    return map;
  };

  const handleExportAllZip = async () => {
    const prevSelectedId = activeLayerId;
    setActiveLayerId(null);
    const map = collectExportMap();

    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 80));
      await (await loadExportUtils()).exportFullPackageZip(map, productName, (prog, text) => {
        setExportProgressText(`${text} (${prog}%)`);
      });
      setToastMessage('پکیج جامع ZIP با تمام لایه‌ها و آخرین تغییرات دانلود گردید.');
    } catch (err: any) {
      console.error(err);
      setToastMessage('خطا در ایجاد پکیج کامل: ' + (err.message || ''));
    } finally {
      if (prevSelectedId) setActiveLayerId(prevSelectedId);
      setIsExporting(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // ---- Batch generation from CSV: one PNG set per row, text layers use {{column}} tokens ----
  const batchInputRef = useRef<HTMLInputElement>(null);
  const handleBatchCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const flash = (msg: string, ms = 4000) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), ms);
    };
    if (file.size > 2 * 1024 * 1024) return flash('خطا: حجم فایل CSV بیش از ۲ مگابایت است.');

    const parsed = parseCsv(await file.text());
    if (!parsed.ok) return flash(`خطا: ${parsed.error}`);

    const prevSelectedId = activeLayerId;
    setActiveLayerId(null);
    setIsExporting(true);
    const { setOverride } = useTemplateVars.getState();
    const nameColumn = parsed.headers.find((h) => /^(name|نام)$/i.test(h)) ?? parsed.headers[0];
    try {
      const count = await (await loadExportUtils()).exportBatchZip(
        parsed.rows,
        (row, i) => row[nameColumn] || `row_${i + 1}`,
        async (row) => {
          setOverride(row);
          // Let React commit and the browser lay out/paint the new text before capturing.
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          await document.fonts?.ready;
          return collectExportMap();
        },
        (done, total) => setExportProgressText(`تولید دسته‌ای: ${toPersianDigits(String(done))} از ${toPersianDigits(String(total))}`),
      );
      flash(`${toPersianDigits(String(count))} مجموعه تصویر در یک فایل ZIP دانلود شد.`);
    } catch (err: any) {
      console.error(err);
      flash('خطا در تولید دسته‌ای: ' + (err?.message || ''));
    } finally {
      setOverride(null);
      if (prevSelectedId) setActiveLayerId(prevSelectedId);
      setIsExporting(false);
    }
  };

  // ---- Brand Kit ----
  const [brandKit, setBrandKit] = useState<BrandKit>(() => loadBrandKit(safeLocalStorage()) ?? { ...DEFAULT_BRAND_KIT, fontId: selectedFontId });
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const handleApplyBrandKit = () => {
    if (!saveBrandKit(safeLocalStorage(), brandKit)) console.warn('Brand kit could not be persisted');
    setCustomGradient((g) => brandGradient(brandKit, g));
    setSelectedFontId(brandKit.fontId);
    setCanvasLayers((prev) => applyBrandToLayers(prev, brandKit));
    setIsBrandKitOpen(false);
    setToastMessage('کیت برند ذخیره و روی همهٔ بوم‌ها اعمال شد.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const { displayWidth: activeDispW, displayHeight: activeDispH, scale: activeScale } = getWorkspaceDisplaySize(targetPlatform, activeAsset);
  const { width: activeRealW, height: activeRealH, label: activeRealLabel } = getAssetDimensions(targetPlatform, activeAsset);
  const exportInfographicDisplay = getWorkspaceDisplaySize(targetPlatform, 'infographic', canvasLayers.infographic);
  const exportLogoDisplay = getWorkspaceDisplaySize(targetPlatform, 'logo80');
  const exportCover400Display = getWorkspaceDisplaySize(targetPlatform, 'cover400');
  const exportCover700_1Display = getWorkspaceDisplaySize(targetPlatform, 'cover700_1');
  const exportCover700_2Display = getWorkspaceDisplaySize(targetPlatform, 'cover700_2');

  // UI always uses Vazirmatn; the user-selected/uploaded font applies only to canvases and exports.
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-vazirmatn selection:bg-amber-500 selection:text-slate-950">
      
      {/* Hidden File Input for Loading Saved Projects */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLoadProjectFile}
        accept=".json"
        className="hidden"
      />

      {/* DYNAMIC 5-ASSET EXPORT STAGE (Rendered with 100% exact canvas dimensions and live layers for guaranteed 1:1 identical exports) */}
      <div 
        style={{ 
          position: 'fixed', 
          left: '-9999px', 
          top: '0', 
          pointerEvents: 'none', 
          opacity: 1, 
          visibility: 'visible', 
          zIndex: -999 
        }}
      >
        {/* 1. Logo 80 */}
        <div 
          ref={exportLogo80Ref}
          className={`rounded-xl flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden shrink-0 select-none ${currentFontCss}`}
          style={{ ...getDynamicBackgroundStyle(), width: exportLogoDisplay.displayWidth, height: exportLogoDisplay.displayHeight }}
        >
          <RenderPlacedLogo config={logoConfig} isDraggable={false} />
          {canvasLayers.logo80?.filter(l => l.type !== 'background').map(l => (
            <DynamicLayerRenderer key={l.id} layer={l} isInteractive={false} canvasWidth={exportLogoDisplay.displayWidth} canvasHeight={exportLogoDisplay.displayHeight} />
          ))}
          <CanvasStickersOverlay stickers={canvasStickers.logo80 || []} isEditable={false} />
        </div>

        {/* 2. Cover 400 */}
        <div 
          ref={exportCover400Ref}
          className={`rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden ${currentFontCss}`}
          style={{ ...getDynamicBackgroundStyle(), width: exportCover400Display.displayWidth, height: exportCover400Display.displayHeight }}
        >
          <RenderPlacedLogo config={logoConfig} isDraggable={false} />
          {canvasLayers.cover400?.filter(l => l.type !== 'background').map(l => (
            <DynamicLayerRenderer key={l.id} layer={l} isInteractive={false} canvasWidth={exportCover400Display.displayWidth} canvasHeight={exportCover400Display.displayHeight} />
          ))}
          <CanvasStickersOverlay stickers={canvasStickers.cover400 || []} isEditable={false} />
        </div>

        {/* 3. Cover 700_1 */}
        <div 
          ref={exportCover700_1Ref}
          className={`rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden ${currentFontCss}`}
          style={{ ...getDynamicBackgroundStyle(), width: exportCover700_1Display.displayWidth, height: exportCover700_1Display.displayHeight }}
        >
          <RenderPlacedLogo config={logoConfig} isDraggable={false} />
          {canvasLayers.cover700_1?.filter(l => l.type !== 'background').map(l => (
            <DynamicLayerRenderer key={l.id} layer={l} isInteractive={false} canvasWidth={exportCover700_1Display.displayWidth} canvasHeight={exportCover700_1Display.displayHeight} />
          ))}
          <CanvasStickersOverlay stickers={canvasStickers.cover700_1 || []} isEditable={false} />
        </div>

        {/* 4. Cover 700_2 */}
        <div 
          ref={exportCover700_2Ref}
          className={`rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden ${currentFontCss}`}
          style={{ ...getDynamicBackgroundStyle(), width: exportCover700_2Display.displayWidth, height: exportCover700_2Display.displayHeight }}
        >
          <RenderPlacedLogo config={logoConfig} isDraggable={false} />
          {canvasLayers.cover700_2?.filter(l => l.type !== 'background').map(l => (
            <DynamicLayerRenderer key={l.id} layer={l} isInteractive={false} canvasWidth={exportCover700_2Display.displayWidth} canvasHeight={exportCover700_2Display.displayHeight} />
          ))}
          <CanvasStickersOverlay stickers={canvasStickers.cover700_2 || []} isEditable={false} />
        </div>

        {/* 5. Infographic export stage adapts to the selected marketplace dimensions. */}
        <div 
          ref={exportInfographicRef}
          className={`rounded-2xl p-6 space-y-4 shadow-2xl relative ${currentFontCss}`}
          style={{ ...getDynamicBackgroundStyle(), width: getAssetDimensions(targetPlatform, 'infographic').width }}
        >
          <RenderPlacedLogo config={logoConfig} isDraggable={false} />
          <CanvasStickersOverlay stickers={canvasStickers.infographic || []} isEditable={false} />
          <div className="pointer-events-none absolute left-0 top-0 z-20" style={{ width: 350, transform: `scale()`, transformOrigin: 'top left' }}>
            {canvasLayers.infographic.filter(l => l.type !== 'background').map(l => (
              <DynamicLayerRenderer
                key={l.id}
                layer={l}
                otherLayers={canvasLayers.infographic}
                isSelected={false}
                onSelect={() => {}}
                onUpdateLayer={() => {}}
                onUpdateLayerData={() => {}}
                onUpdatePosition={() => {}}
                isInteractive={false}
                canvasWidth={350}
                canvasHeight={exportInfographicDisplay.displayHeight}
              />
            ))}
          </div>
          <div className="text-center bg-slate-950/85 p-5 rounded-2xl border border-emerald-500/30 space-y-2 backdrop-blur-md">
            <span className="text-xs text-emerald-400 font-extrabold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">اینفوگرافی رسمی محصول</span>
            <h3 className="text-xl font-black text-white">{productName}</h3>
            {productSubtitle && <p className="text-xs text-slate-300 font-medium">{productSubtitle}</p>}
            <p className="text-[11px] text-amber-300 font-bold">طراحی اختصاصی برای مارکت ژاکت (تضمین کیفیت و اصالت)</p>
          </div>
          <div className="space-y-3.5">
            {infographicRows.map((row, idx) => (
              <div key={row.id || idx} className="bg-slate-950/85 p-4 rounded-xl border border-white/10 backdrop-blur-md space-y-2">
                <div className="flex items-center gap-2 border-b border-white/5 pb-1.5">
                  <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <h5 className="text-sm font-black text-amber-300">{row.title}</h5>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{row.desc}</p>
                {row.items && row.items.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    {row.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="bg-slate-900/90 p-2.5 rounded-lg text-emerald-300 border border-slate-800 font-medium flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Main Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 p-1 flex items-center justify-center shadow-lg shadow-amber-500/10 text-amber-400">
            {logoConfig.customLogoUrl ? (
              <img src={logoConfig.customLogoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base text-white tracking-tight">کیت یار</h1>
              <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                استودیو طراحی جامع
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              تمام المان‌ها به عنوان لایه‌های قابل ویرایش و ذخیره بلادرنگ در دسترس هستند
            </p>
          </div>
        </div>

        {/* Global Action & Export Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          
          {/* PWA INSTALLATION AND OFFLINE INDICATOR */}
          <PWAControls />
          
          {/* UNDO BUTTON */}
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all active:scale-95"
            title="بازگردانی تغییر قبلی (Ctrl+Z / Cmd+Z)"
          >
            <Undo2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          {/* REDO BUTTON */}
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all active:scale-95"
            title="اعمال مجدد تغییر (Ctrl+Y / Cmd+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Redo</span>
          </button>

          {/* LIVE PIP MINI PREVIEW TOGGLE BUTTON */}
          <button
            onClick={() => setIsLivePreviewOpen(!isLivePreviewOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isLivePreviewOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="پنجره شناور پیش‌نمایش بلادرنگ"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">پیش‌نمایش شناور</span>
          </button>

          {/* SAVE PROJECT BUTTON */}
          <button
            onClick={handleSaveProjectFile}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/20 transition-all"
            title="ذخیره تمام لایه‌ها، متن‌ها و پروژه"
          >
            <Save className="w-3.5 h-3.5" />
            <span>ذخیره پروژه</span>
          </button>

          {/* LOAD PROJECT BUTTON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            title="بارگذاری پروژه از فایل قبلی"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">بارگذاری</span>
          </button>

          {/* BLANK CANVAS BUTTON */}
          <button
            onClick={handleResetToBlank}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all"
            title="ایجاد بوم کاملاً خالی و تمیز"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">بوم خالی</span>
          </button>

          {/* TEMPLATE RESET BUTTON */}
          <button
            onClick={handleResetToTemplate}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all"
            title="بارگذاری قالب استاندارد ژاکت"
          >
            <Layout className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">قالب استاندارد</span>
          </button>

          <button
            onClick={handleRandomizeGradient}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all"
            title="تغییر تصادفی پالت و زاویه گرادیانت"
          >
            <Dices className="w-3.5 h-3.5 text-purple-400" />
          </button>

          {/* Export PNG */}
          <button
            onClick={handleExportPng}
            disabled={isExporting}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all disabled:opacity-50"
            title="دانلود خروجی باکیفیت PNG"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>PNG</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all disabled:opacity-50"
            title="دانلود خروجی سند PDF استاندارد"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>PDF</span>
          </button>

          {/* Export PSD */}
          <button
            onClick={handleExportPsd}
            disabled={isExporting}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all disabled:opacity-50"
            title="دانلود خروجی لایه‌باز PSD فتوشاپ"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>PSD</span>
          </button>

          {/* Brand Kit */}
          <button
            type="button"
            onClick={() => setIsBrandKitOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span>کیت برند</span>
          </button>

          {/* Batch generation from CSV */}
          <input ref={batchInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleBatchCsv} aria-label="فایل CSV تولید دسته‌ای" />
          <button
            type="button"
            onClick={() => batchInputRef.current?.click()}
            disabled={isExporting}
            title="ستون‌های CSV را با {{نام_ستون}} در متن لایه‌ها استفاده کنید"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>تولید دسته‌ای (CSV)</span>
          </button>

          {/* Export Full ZIP Package */}
          <button
            onClick={handleExportAllZip}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>پکیج کامل (ZIP)</span>
          </button>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-4 sm:px-8 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { id: 'studio', label: 'استودیو طراحی جامع و کامپوزرها', icon: Layout },
            { id: 'compliance', label: 'بررسی استاندارد مارکت‌پلیس', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'compliance' && activeTab === 'studio') runComplianceCheck();
                  setActiveTab(tab.id as any);
                }}
                className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Wizard Mode Quick Switcher */}
        <button
          onClick={() => setIsWizardMode(!isWizardMode)}
          className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all ${
            isWizardMode
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>حالت گام‌به‌گام ویزارد ({isWizardMode ? 'روشن' : 'خاموش'})</span>
        </button>
      </div>

      {/* Main Studio Body */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-4">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-amber-500/50 text-amber-300 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold backdrop-blur-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Progress Overlay */}
        {isExporting && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <div>
                <h4 className="font-bold text-white text-sm">در حال تولید خروجی باکیفیت بالا...</h4>
                <p className="text-xs text-slate-400 mt-1">{exportProgressText || 'لطفاً کمی صبر کنید'}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: STUDIO WORKSPACE */}
        {activeTab === 'studio' && (
          <div className="space-y-4">
            
            {/* Platform Selection Hub */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-white text-xs">
                  <Grid className="w-4 h-4 text-amber-500" />
                  <span>پلتفرم و ابعاد هدف خروجی:</span>
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  کیت چند پلتفرمی هوشمند
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'zhaket', label: 'مارکت ژاکت', desc: 'استاندارد ۴۰۰×۴۰۰', logo: 'ژ' },
                  { id: 'rastchin', label: 'راست چین', desc: 'استاندارد ۴۵۰×۳۳۰', logo: 'ر' },
                  { id: 'bazaar', label: 'کافه بازار', desc: 'استاندارد موبایل/مارکت', logo: 'ب' },
                  { id: 'myket', label: 'مایکت', desc: 'استاندارد اندروید', logo: 'م' },
                  { id: 'custom', label: 'ابعاد سفارشی', desc: 'وارد کردن طول و عرض', logo: '⚙️' },
                ].map((plat) => {
                  const isSel = targetPlatform === plat.id;
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => setTargetPlatform(plat.id as any)}
                      className={`p-2.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                        isSel
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/10'
                          : 'bg-slate-950 text-slate-300 border-slate-800/80 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-extrabold">{plat.label}</span>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${isSel ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-amber-400'}`}>
                          {plat.logo}
                        </span>
                      </div>
                      <span className={`text-[9px] ${isSel ? 'text-slate-900 opacity-90' : 'text-slate-500'}`}>
                        {plat.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Size Fields */}
              {targetPlatform === 'custom' && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-2 gap-4 animate-in slide-in-from-top-1 duration-150">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">عرض بوم سفارشی (Width - پیکسل):</span>
                    <input
                      type="number"
                      min="50"
                      max="4000"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Math.max(50, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-amber-400 outline-none text-center animate-pulse-once"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">ارتفاع بوم سفارشی (Height - پیکسل):</span>
                    <input
                      type="number"
                      min="50"
                      max="4000"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Math.max(50, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-amber-400 outline-none text-center"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* 5-Asset Selector Bar */}
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-2xl flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'logo80', icon: Box },
                  { id: 'cover400', icon: Layout },
                  { id: 'cover700_1', icon: Maximize2 },
                  { id: 'cover700_2', icon: Maximize2 },
                  { id: 'infographic', icon: Layers },
                ].map((assetItem) => {
                  const Icon = assetItem.icon;
                  const isCur = activeAsset === assetItem.id;
                  const assetDims = getAssetDimensions(targetPlatform, assetItem.id);
                  return (
                    <button
                      key={assetItem.id}
                      onClick={() => setActiveAsset(assetItem.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        isCur
                          ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                          : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isCur ? 'text-slate-950' : 'text-slate-400'}`} />
                      <span>{assetDims.label}</span>
                      <span className={`text-[10px] font-mono ${isCur ? 'text-slate-900 opacity-80' : 'text-slate-500'}`}>
                        {toPersianDigits(assetDims.width)}×{toPersianDigits(assetDims.height)} px
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Fullscreen Preview Toggle */}
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                title="مشاهده پیش‌نمایش بزرگ"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>تمام صفحه</span>
              </button>
            </div>

            {/* Optional Wizard Step Bar */}
            {isWizardMode && (
              <WizardStepBar
                activeStep={activeAsset}
                onSelectStep={(s) => setActiveAsset(s as any)}
                productName={productName}
                onUpdateProductName={setProductName}
              />
            )}

            {/* Main Studio Grid: 2-Column Layout (Interactive Canvas + Right Tools Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* 1. LEFT / CENTER: INTERACTIVE CANVAS WITH LIVE LAYERS */}
              <div 
                ref={activeCanvasContainerRef}
                className="lg:col-span-2 min-w-0 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[540px] relative overflow-hidden shadow-2xl"
                onClick={() => setActiveLayerId(null)}
                onContextMenu={(e) => handleOpenContextMenu(e)}
              >
                {/* Dynamic Gradient Background */}
                <div className="absolute inset-0 transition-all duration-300" style={getDynamicBackgroundStyle()} />
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Unified Vector Canvas Quick Tools Bar */}
                <div 
                  className="relative z-30 w-full max-w-xl mb-4 bg-slate-950/90 border border-indigo-500/40 rounded-2xl p-2 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1 pl-1">
                      <Shapes className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="hidden sm:inline">ابزار برداری:</span>
                    </span>

                    {/* Vector Rect */}
                    <button
                      type="button"
                      onClick={() => handleAddVectorShape('rect')}
                      className="px-2 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-200 border border-indigo-500/30 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                      title="افزودن مستطیل برداری / کارت شیشه‌ای"
                    >
                      <Square className="w-3.5 h-3.5 text-indigo-400" />
                      <span>مستطیل</span>
                    </button>

                    {/* Vector Circle */}
                    <button
                      type="button"
                      onClick={() => handleAddVectorShape('circle')}
                      className="px-2 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-200 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                      title="افزودن دایره برداری"
                    >
                      <Circle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>دایره</span>
                    </button>

                    {/* Vector Star */}
                    <button
                      type="button"
                      onClick={() => handleAddVectorShape('star')}
                      className="px-2 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-200 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                      title="افزودن ستاره و نشان طلایی"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span>ستاره</span>
                    </button>

                    {/* Vector Text */}
                    <button
                      type="button"
                      onClick={() => handleAddVectorShape('text')}
                      className="px-2 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-200 border border-sky-500/30 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                      title="افزودن متن و تیتر برداری"
                    >
                      <Type className="w-3.5 h-3.5 text-sky-400" />
                      <span>متن</span>
                    </button>

                    {/* Discount Ribbon */}
                    <button
                      type="button"
                      onClick={() => handleAddVectorShape('discount-ribbon')}
                      className="px-2 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-200 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                      title="روبان آفر ویژه"
                    >
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>آفر</span>
                    </button>

                    {/* Official Zhaket Badge Button */}
                    <button
                      type="button"
                      onClick={() => setIsStickerModalOpen(true)}
                      className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                      title="افزودن بج رسمی، تاییدیه یا گارانتی ژاکت به لایه‌ها"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>بج ژاکت</span>
                    </button>

                    {/* 3D Model Modal */}
                    <button
                      type="button"
                      onClick={() => setIsIconLibraryModalOpen(true)}
                      className="px-2 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                      title="کتابخانه مدل‌های ۳D و آیکون‌ها"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>مدل ۳D</span>
                    </button>
                  </div>

                  {/* Precision & Snapping Controls */}
                  <div className="flex items-center gap-1.5 border-r border-slate-800 pr-2 mr-1 flex-wrap">
                    {/* Magnetic Snap Toggle */}
                    <button
                      type="button"
                      onClick={() => setEnableMagneticSnap(!enableMagneticSnap)}
                      className={`px-2 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 border ${
                        enableMagneticSnap
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                      title={enableMagneticSnap ? 'چسبندگی مغناطیسی هوشمند به مرکز فعال است' : 'فعال‌سازی چسبندگی مغناطیسی'}
                    >
                      <Crosshair className={`w-3.5 h-3.5 ${enableMagneticSnap ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className="hidden sm:inline">تراز مغناطیسی</span>
                    </button>

                    {/* Grid Snap Toggle */}
                    <button
                      type="button"
                      onClick={() => setGridSnapSize(gridSnapSize === 5 ? 1 : 5)}
                      className={`px-2 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 border ${
                        gridSnapSize > 1
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                      title={gridSnapSize > 1 ? 'گام ۵ پیکسلی فعال است' : 'فعال‌سازی گام گرید ۵px'}
                    >
                      <Grid className={`w-3.5 h-3.5 ${gridSnapSize > 1 ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="hidden sm:inline">گرید ۵px</span>
                    </button>

                    {/* Ruler Toggle & Smart Guides Settings Popover */}
                    <div className="relative">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowRulers(!showRulers)}
                          className={`px-2 py-1 rounded-r-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95 border ${
                            showRulers
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                          }`}
                          title={showRulers ? 'خط‌کش‌ها و خطوط راهنمای افقی و عمودی فعال هستند' : 'نمایش خط‌کش‌ها (Rulers)'}
                        >
                          <Ruler className={`w-3.5 h-3.5 ${showRulers ? 'text-emerald-400' : 'text-slate-500'}`} />
                          <span className="hidden sm:inline">خط‌کش</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsGuidesSettingsOpen(!isGuidesSettingsOpen)}
                          className={`px-1.5 py-1 rounded-l-xl text-xs font-bold flex items-center transition-all border-y border-l ${
                            isGuidesSettingsOpen
                              ? 'bg-amber-500/30 text-amber-300 border-amber-500/50'
                              : showRulers
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20'
                              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                          }`}
                          title="تنظیمات ضخامت و شفافیت خطوط راهنمای هوشمند (Smart Guides Settings)"
                        >
                          <Sliders className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Floating Settings Popover for Smart Guides */}
                      <AnimatePresence>
                        {isGuidesSettingsOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.95 }}
                            className="absolute top-9 right-0 w-64 bg-slate-950/95 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl z-50 backdrop-blur-xl space-y-3 font-sans text-right text-xs"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                                <Sliders className="w-3.5 h-3.5" />
                                <span>تنظیمات خطوط راهنما (Smart Guides)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsGuidesSettingsOpen(false)}
                                className="text-slate-400 hover:text-white p-0.5"
                              >
                                ✕
                              </button>
                            </div>

                            {/* Unit Selection: Pixels (px) vs Percent (%) */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-slate-300 font-medium">واحد اندازه‌گیری خط‌کش (Unit):</span>
                                <span className="text-amber-400 font-mono font-bold uppercase">{rulerUnit === 'percent' ? 'درصد (%)' : 'پیکسل (px)'}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                                <button
                                  type="button"
                                  onClick={() => setRulerUnit('px')}
                                  className={`py-1 rounded-lg text-xs font-bold transition-all ${
                                    rulerUnit === 'px'
                                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  پیکسل (px)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRulerUnit('percent')}
                                  className={`py-1 rounded-lg text-xs font-bold transition-all ${
                                    rulerUnit === 'percent'
                                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  درصد (%)
                                </button>
                              </div>
                            </div>

                            {/* Crosshair & Smart Guides Color Picker */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-slate-300 font-medium">رنگ خطوط نشانه‌گیر (Crosshair Color):</span>
                                <div className="flex items-center gap-1.5">
                                  <div 
                                    className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm shrink-0"
                                    style={{ backgroundColor: crosshairColor }} 
                                  />
                                  <span className="text-amber-400 font-mono font-bold text-[10px] uppercase">{crosshairColor}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                  { id: '#fbbf24', name: 'کهربایی (پیش‌فرض)', bg: '#fbbf24' },
                                  { id: '#10b981', name: 'زمردی', bg: '#10b981' },
                                  { id: '#06b6d4', name: 'فیروزه‌ای', bg: '#06b6d4' },
                                  { id: '#ec4899', name: 'صورتی نئون', bg: '#ec4899' },
                                  { id: '#6366f1', name: 'نیلی', bg: '#6366f1' },
                                  { id: '#a855f7', name: 'بنفش', bg: '#a855f7' },
                                  { id: '#f43f5e', name: 'قرمز', bg: '#f43f5e' },
                                  { id: '#ffffff', name: 'سفید', bg: '#ffffff' },
                                ].map((swatch) => (
                                  <button
                                    key={swatch.id}
                                    type="button"
                                    onClick={() => setCrosshairColor(swatch.id)}
                                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                                      crosshairColor.toLowerCase() === swatch.id.toLowerCase()
                                        ? 'scale-125 border-white shadow-lg'
                                        : 'border-transparent hover:scale-110 opacity-75 hover:opacity-100'
                                    }`}
                                    style={{ backgroundColor: swatch.bg }}
                                    title={swatch.name}
                                  />
                                ))}

                                <label 
                                  className="relative cursor-pointer w-5 h-5 rounded-full border border-slate-600 bg-slate-800 flex items-center justify-center text-[9px] text-slate-300 hover:border-amber-400 hover:text-white transition-all overflow-hidden shrink-0"
                                  title="انتخاب رنگ دلخواه"
                                >
                                  <ColorField label="انتخاب رنگ" value={crosshairColor} onChange={(v) => setCrosshairColor(v)} />
                                  <span>+</span>
                                </label>
                              </div>
                            </div>

                            {/* Toggle Crosshair Lines Visibility Checkbox */}
                            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                              <div className="flex flex-col text-right">
                                <span className="text-slate-200 font-bold text-[11px]">نمایش خطوط متقاطع (Crosshairs)</span>
                                <span className="text-slate-500 text-[9px]">رسم نشانه‌گیر روی بوم (تراز مغناطیسی فعال می‌ماند)</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer shrink-0 mr-2">
                                <input
                                  type="checkbox"
                                  checked={showCrosshairLines}
                                  onChange={(e) => setShowCrosshairLines(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-8 h-4.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-500"></div>
                              </label>
                            </div>

                            {/* Thickness Setting */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-slate-300 font-medium">ضخامت خطوط نشانه‌گیر:</span>
                                <span className="text-amber-400 font-mono font-bold">{smartGuidesThickness}px</span>
                              </div>
                              <div className="grid grid-cols-4 gap-1">
                                {[1, 2, 3, 4].map((th) => (
                                  <button
                                    key={th}
                                    type="button"
                                    onClick={() => setSmartGuidesThickness(th)}
                                    className={`py-1 rounded-lg border font-mono text-xs font-bold transition-all ${
                                      smartGuidesThickness === th
                                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                    }`}
                                  >
                                    {th}px
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Opacity Setting */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-slate-300 font-medium">شفافیت / وضوح (Opacity):</span>
                                <span className="text-amber-400 font-mono font-bold">{smartGuidesOpacity}%</span>
                              </div>
                              <input
                                type="range"
                                min="20"
                                max="100"
                                step="5"
                                value={smartGuidesOpacity}
                                onChange={(e) => setSmartGuidesOpacity(Number(e.target.value))}
                                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                              />
                              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                                <span>20% (محو)</span>
                                <span>60%</span>
                                <span>100% (روشن)</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Active Layer Quick Centering */}
                    {activeLayerId && (
                      <div className="flex items-center gap-1 bg-slate-900/90 px-1.5 py-0.5 rounded-lg border border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleCenterActiveLayer('x')}
                          className="px-1.5 py-0.5 text-[10px] font-bold text-amber-300 hover:bg-slate-800 rounded transition-colors"
                          title="تراز کردن لایه انتخاب شده در مرکز افقی بوم"
                        >
                          ⬌ افقی
                        </button>
                        <span className="text-slate-700">|</span>
                        <button
                          type="button"
                          onClick={() => handleCenterActiveLayer('y')}
                          className="px-1.5 py-0.5 text-[10px] font-bold text-amber-300 hover:bg-slate-800 rounded transition-colors"
                          title="تراز کردن لایه انتخاب شده در مرکز عمودی بوم"
                        >
                          ⬍ عمودی
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <button
                      type="button"
                      onClick={() => setIsFigmaCheatsheetOpen(true)}
                      className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95"
                      title="راهنمای کلیدهای میانبر و قابلیت‌های حرفه‌ای بوم فیگما"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>کلیدهای میانبر فیگما ⌘</span>
                    </button>
                    <span className="hidden sm:inline opacity-60">| کلیک راست روی بوم = منو</span>
                  </div>
                </div>

                {/* Edit & Precision Nudge Hint */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-center gap-1.5 max-w-[calc(100%-1.5rem)] bg-slate-950/85 border border-emerald-500/40 px-3 py-1 rounded-full text-[10px] text-emerald-300 backdrop-blur-md shadow-lg pointer-events-none">
                  <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">درگ با تراز مغناطیسی · کلیدهای جهت‌نما: ۱ پیکسل · با Shift: ۱۰ پیکسل</span>
                </div>

                {/* 1. UNIFIED DYNAMIC ASSET CANVAS (LOGO, COVER, SLIDERS, CUSTOM SIZES) */}
                {activeAsset !== 'infographic' && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-500/40 px-3.5 py-1 rounded-full text-xs font-bold text-amber-300 backdrop-blur-md shadow-lg">
                      <span>اندازه هدف: {activeRealLabel}</span>
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        {toPersianDigits(activeRealW)}×{toPersianDigits(activeRealH)} px
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-center shadow-2xl overflow-visible">
                      <CanvasRulers 
                        width={activeDispW} 
                        height={activeDispH} 
                        unit={rulerUnit}
                        showRulers={showRulers} 
                        showCrosshairLines={showCrosshairLines}
                        crosshairColor={crosshairColor}
                        smartGuidesOpacity={smartGuidesOpacity}
                        smartGuidesThickness={smartGuidesThickness}
                        draggingGuide={draggingGuide}
                      >
                        <div 
                          ref={activeLiveCanvasRef}
                          style={{
                            width: activeDispW,
                            height: activeDispH,
                            ...getDynamicBackgroundStyle()
                          }}
                          className={`rounded-xl border-2 border-amber-500/70 flex flex-col items-center justify-center text-center shadow-2xl relative isolate overflow-visible group transition-all shrink-0 select-none ring-1 ring-amber-400/40 ${currentFontCss}`}
                        >
                          {currentLayers.filter(l => l.type !== 'background').map(l => (
                            <DynamicLayerRenderer
                              key={l.id}
                              layer={l}
                              otherLayers={currentLayers}
                              isSelected={activeLayerId === l.id}
                              onSelect={() => setActiveLayerId(l.id)}
                              onUpdateLayer={handleUpdateLayer}
                              onUpdateLayerData={handleUpdateLayerData}
                              onUpdatePosition={handleUpdateLayerPosition}
                              onOpenContextMenu={handleOpenContextMenuAt}
                              isInteractive={true}
                              canvasWidth={activeDispW}
                              canvasHeight={activeDispH}
                              enableMagneticSnap={enableMagneticSnap}
                              gridSnapSize={gridSnapSize}
                              onDragStateChange={setDraggingGuide}
                            />
                          ))}
                          <CanvasStickersOverlay
                            stickers={canvasStickers[activeAsset] || []}
                            onRemoveSticker={handleRemoveStickerFromActiveAsset}
                            onUpdateStickerPosition={handleUpdateStickerPosition}
                          />

                          {/* Empty State */}
                          {!hasActiveLayers && (
                            <CanvasEmptyState
                              activeAsset={activeAsset}
                              isCompact={activeAsset === 'logo80'}
                              onRestoreTemplate={handleResetActiveAssetToTemplate}
                              onOpen3DModal={() => setIsIconLibraryModalOpen(true)}
                              onAddVectorShape={handleAddVectorShape}
                            />
                          )}
                        </div>
                      </CanvasRulers>
                    </div>

                    <p className="text-[11px] text-slate-400 text-center max-w-xs leading-relaxed">
                      برای ویرایش هر لایه، مستقیماً روی آن کلیک کنید یا از پنل بازرس سمت راست استفاده نمایید.
                    </p>
                  </div>
                )}

                {/* 5. ASSET: INFOGRAPHIC 594x4000 (Fully Layered & Sortable) */}
                {activeAsset === 'infographic' && (
                  <CanvasRulers 
                    width={350} 
                    height={activeDispH} 
                    unit={rulerUnit}
                    showRulers={showRulers} 
                    showCrosshairLines={showCrosshairLines}
                    crosshairColor={crosshairColor}
                    smartGuidesOpacity={smartGuidesOpacity}
                    smartGuidesThickness={smartGuidesThickness}
                    draggingGuide={draggingGuide}
                  >
                    <div 
                      ref={activeAsset === 'infographic' ? activeLiveCanvasRef : undefined}
                      className="relative isolate z-10 space-y-4 p-4 border-2 border-emerald-500/40 rounded-2xl w-[350px] shadow-2xl" 
                      style={{ ...getDynamicBackgroundStyle(), minHeight: activeDispH }}
                    >
                      <RenderPlacedLogo config={logoConfig} />

                      <CanvasStickersOverlay
                        stickers={canvasStickers.infographic || []}
                        onRemoveSticker={handleRemoveStickerFromActiveAsset}
                        onUpdateStickerPosition={handleUpdateStickerPosition}
                      />

                      <div className="text-center bg-slate-950/85 p-4 rounded-xl border border-emerald-500/30 space-y-1.5 backdrop-blur-md">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">اینفوگرافی رسمی محصول</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handleResetInfographicRows}
                              className="text-[9px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-md font-bold transition-all flex items-center gap-1"
                              title="پاکسازی تمامی ردیف‌ها و بازگردانی به قالب اولیه"
                            >
                              <RotateCcw className="w-3 h-3 text-rose-400" />
                              <span>بازنشانی ردیف‌ها</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleAddInfographicRow}
                              className="text-[9px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md font-bold transition-all flex items-center gap-1"
                              title="افزودن ردیف جدید با انیمیشن ورود"
                            >
                              <Plus className="w-3 h-3" />
                              <span>ردیف جدید</span>
                            </button>
                          </div>
                        </div>
                        <h4 
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => setProductName(e.currentTarget.textContent || productName)}
                          className="text-sm font-black text-white outline-none focus:bg-slate-900 rounded cursor-text"
                        >
                          {productName}
                        </h4>
                        <p className="text-[10px] text-slate-300">طراحی اختصاصی برای مارکت ژاکت (ردیف‌ها را با ماوس جابجا کنید)</p>
                      </div>

                      {/* DND-KIT SORTABLE COMPARISON TABLE ROWS */}
                      <DndContext
                        sensors={dndSensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEndRows}
                      >
                        <SortableContext
                          items={infographicRows.map((r) => r.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3">
                            {infographicRows.length === 0 ? (
                              <div className="p-6 text-center bg-slate-900/80 rounded-2xl border border-dashed border-emerald-500/30 space-y-3 backdrop-blur-md">
                                <p className="text-xs text-slate-300 font-medium">هیچ ردیفی در جدول وجود ندارد.</p>
                                <button
                                  type="button"
                                  onClick={handleResetInfographicRows}
                                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl transition-all shadow-lg flex items-center gap-1.5 mx-auto"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>بازگردانی قالب اولیه ردیف‌ها</span>
                                </button>
                              </div>
                            ) : (
                              <AnimatePresence initial={false}>
                                {infographicRows.map((row, idx) => (
                                  <motion.div
                                    key={row.id}
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                                    className="animate-row-entrance"
                                  >
                                    <SortableInfographicRow
                                      row={row}
                                      index={idx}
                                      totalRows={infographicRows.length}
                                      onUpdateTitle={handleUpdateInfographicRowTitle}
                                      onUpdateDesc={handleUpdateInfographicRowDesc}
                                      onUpdateItem={handleUpdateInfographicRowItem}
                                      onDeleteRow={handleDeleteInfographicRow}
                                    />
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            )}
                          </div>
                        </SortableContext>
                      </DndContext>
                      <div className="pointer-events-none absolute inset-0 z-20" data-testid="infographic-layers">
                        {currentLayers.filter(l => l.type !== 'background').map(l => (
                          <div key={l.id} className="pointer-events-auto">
                            <DynamicLayerRenderer
                              layer={l}
                              otherLayers={currentLayers}
                              isSelected={activeLayerId === l.id}
                              onSelect={() => setActiveLayerId(l.id)}
                              onUpdateLayer={handleUpdateLayer}
                              onUpdateLayerData={handleUpdateLayerData}
                              onUpdatePosition={handleUpdateLayerPosition}
                              onOpenContextMenu={handleOpenContextMenuAt}
                              isInteractive={true}
                              canvasWidth={activeDispW}
                              canvasHeight={activeDispH}
                              enableMagneticSnap={enableMagneticSnap}
                              gridSnapSize={gridSnapSize}
                              onDragStateChange={setDraggingGuide}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CanvasRulers>
                )}

              </div>

              {/* 2. RIGHT SIDEBAR: UNIFIED PHOTOSHOP STUDIO DOCK */}
              <div className="space-y-3 min-w-0">
                
                {/* Photoshop Studio Dock Tab Navigation Bar */}
                <div className="w-full min-w-0 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex flex-wrap items-center gap-1 shadow-xl" role="group" aria-label="پنل‌های استودیو">
                  {[
                    { id: 'layers', label: 'لایه‌ها', icon: Layers, color: 'text-amber-400' },
                    { id: 'mockup', label: 'موکاپ‌ها', icon: Smartphone, color: 'text-indigo-400' },
                    { id: 'badges', label: 'بج‌های ژاکت', icon: ShieldCheck, color: 'text-emerald-400' },
                    { id: 'logo', label: 'لوگو و کادر', icon: ShoppingBag, color: 'text-orange-400' },
                    { id: 'gradient', label: 'گرادیانت', icon: Palette, color: 'text-purple-400' },
                    { id: 'typography', label: 'فونت', icon: Type, color: 'text-sky-400' },
                    { id: 'image', label: 'تصاویر', icon: ImageIcon, color: 'text-cyan-400' },
                    { id: 'ai', label: 'هوش مصنوعی', icon: Sparkles, color: 'text-fuchsia-400' },
                    { id: 'konva', label: 'طراحی آزاد', icon: Shapes, color: 'text-rose-400' },
                    { id: 'chart', label: 'نمودار', icon: BarChart3, color: 'text-emerald-400' },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = sidebarActiveTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSidebarActiveTab(tab.id as any)}
                        aria-pressed={isActive}
                        className={`min-h-10 px-3 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : tab.color}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: LAYERS & PHOTOSHOP INSPECTOR */}
                {sidebarActiveTab === 'layers' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Contextual Photoshop-Style Inspector for Selected Active Layer */}
                    <AnimatePresence mode="wait">
                      {activeLayerId && currentLayers.find((l) => l.id === activeLayerId) ? (
                        <motion.div
                          key="active-inspector"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="animate-fade-in"
                        >
                          <PhotoshopLayerInspector
                            layer={currentLayers.find((l) => l.id === activeLayerId)!}
                            allLayers={currentLayers}
                            canvasWidth={getWorkspaceDisplaySize(targetPlatform, activeAsset).displayWidth}
                            canvasHeight={getWorkspaceDisplaySize(targetPlatform, activeAsset).displayHeight}
                            onUpdateLayer={(updates) => handleUpdateLayer(activeLayerId, updates)}
                            onUpdateLayerData={(newData) => handleUpdateLayerData(activeLayerId, newData)}
                            onDeleteLayer={() => handleDeleteLayer(activeLayerId)}
                            onDuplicateLayer={() => handleDuplicateLayer(activeLayerId)}
                            onToggleSameZIndexVisibility={handleToggleSameZIndexVisibility}
                            onToggleSameZIndexLock={handleToggleSameZIndexLock}
                            onUpdateLayerById={handleUpdateLayer}
                          />
                        </motion.div>
                      ) : (
                        <div key="no-inspector" className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-xs text-slate-400 font-medium">
                          یک لایه را روی بوم یا در درخت لایه‌ها انتخاب کنید تا مشخصات و رنگ‌های آن نمایش داده شود.
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Layer Management Tree Sidebar */}
                    <LayersSidebar
                      layers={currentLayers}
                      activeLayerId={activeLayerId}
                      onSelectLayer={handleSelectLayer}
                      onToggleVisibility={handleToggleVisibility}
                      onToggleLock={handleToggleLock}
                      onMoveLayer={handleMoveLayer}
                      onDeleteLayer={handleDeleteLayer}
                      onUpdateLayer={handleUpdateLayer}
                      onQuickAdd={handleQuickAdd}
                      onDuplicateLayer={handleDuplicateLayer}
                      onReorderLayers={handleReorderLayers}
                      onOpenIconModal={() => setIsIconLibraryModalOpen(true)}
                    />
                  </div>
                )}

                {sidebarActiveTab === 'mockup' && (
                  <div className="animate-in fade-in duration-150">
                    <MockupComposer onAddMockup={handleAddMockupLayer} />
                  </div>
                )}

                {/* TAB 2: ZHAKET OFFICIAL BADGES DIRECT CATALOG */}
                {sidebarActiveTab === 'badges' && (
                  <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-3xl space-y-3.5 shadow-xl animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h4 className="font-black text-white text-xs">بج‌های رسمی و ضمانت ژاکت</h4>
                          <p className="text-[10px] text-slate-400">کلیک روی هر بج = افزودن مستقیم به لایه‌ها با کنترل کامل</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                        {SEMANTIC_STICKERS_DATA.length} بج استاندارد
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
                      {SEMANTIC_STICKERS_DATA.map((stk) => {
                        const badgeStyleClass = getBadgeStyleClass(stk.badgeStyle);
                        return (
                          <div
                            key={stk.id}
                            onClick={() => handleAddStickerToActiveAsset(stk)}
                            className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xl leading-none drop-shadow shrink-0">{stk.iconValue}</span>
                              <div className="flex flex-col text-right truncate">
                                <span className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors truncate">
                                  {stk.title}
                                </span>
                                {stk.tagline && (
                                  <span className="text-[10px] text-slate-400 truncate">{stk.tagline}</span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="px-2.5 py-1 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500 text-emerald-300 group-hover:text-slate-950 font-black text-[10px] transition-all shrink-0 border border-emerald-500/30"
                            >
                              + افزودن
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 3: ZHAKET LOGO & NUMERICAL SIZING */}
                {sidebarActiveTab === 'logo' && (
                  <div className="animate-in fade-in duration-150">
                    <LogoControls
                      config={logoConfig}
                      onChange={setLogoConfig}
                      onAddLogoLayer={handleAddLogoLayerToActiveAsset}
                    />
                  </div>
                )}

                {/* TAB 4: CUSTOM GRADIENT & BACKGROUND */}
                {sidebarActiveTab === 'gradient' && (
                  <div className="p-4 bg-slate-900 border border-amber-500/30 rounded-3xl space-y-3 shadow-xl animate-in fade-in duration-150">
                    <CustomGradientStudio config={customGradient} onChange={setCustomGradient} onRandomize={handleRandomizeGradient} />
                  </div>
                )}

                {/* TAB 5: TYPOGRAPHY & PERSIAN FONTS */}
                {sidebarActiveTab === 'typography' && (
                  <div className="p-4 bg-slate-900 border border-indigo-500/30 rounded-3xl space-y-3 shadow-xl animate-in fade-in duration-150">
                    <FontSelector selectedFontId={selectedFontId} onSelectFont={setSelectedFontId} />
                  </div>
                )}

                {/* TAB 6: CUSTOM MEDIA & SCREENSHOT UPLOAD */}
                {sidebarActiveTab === 'image' && (
                  <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-3xl space-y-3 shadow-xl animate-in fade-in duration-150">
                    <CustomImageComposer onAddImageLayer={handleAddImageLayer} />
                  </div>
                )}

                {/* TAB 8: FREE-FORM KONVA SKETCHPAD — shapes can be sent to the main canvas as layers */}
                {sidebarActiveTab === 'konva' && (
                  <div className="p-4 bg-slate-900 border border-rose-500/30 rounded-3xl space-y-3 shadow-xl animate-in fade-in duration-150">
                    <Suspense fallback={<p className="text-xs text-slate-400">در حال بارگذاری بوم طراحی آزاد…</p>}>
                      <KonvaCanvasStudio onSendShapeToMainCanvas={handleSendKonvaShapeToMainCanvas} />
                    </Suspense>
                  </div>
                )}

                {/* TAB 9: PRODUCT ANALYTICS CHART BUILDER */}
                {sidebarActiveTab === 'chart' && (
                  <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-3xl space-y-3 shadow-xl animate-in fade-in duration-150">
                    <Suspense fallback={<p className="text-xs text-slate-400">در حال بارگذاری نمودارساز…</p>}>
                      <ProductAnalyticsChart onAddToCanvas={handleAddChartLayer} />
                    </Suspense>
                  </div>
                )}

                {/* TAB 7: AI VISUAL COMPOSER (Gemini / OpenAI / Claude), loaded on first open */}
                {sidebarActiveTab === 'ai' && (
                  <div className="p-4 bg-slate-900 border border-fuchsia-500/30 rounded-3xl space-y-3 shadow-xl animate-in fade-in duration-150">
                    <Suspense fallback={<p className="text-xs text-slate-400">در حال بارگذاری ابزار هوش مصنوعی…</p>}>
                      <GeminiVisualComposer onAddVectorLayer={handleAddVectorLayer} productName={productName} />
                    </Suspense>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ZHAKET COMPLIANCE AUDIT */}
        {activeTab === 'compliance' && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    بررسی استاندارد {complianceReport ? (MARKETPLACES[complianceReport.platform as keyof typeof MARKETPLACES]?.name ?? 'سفارشی') : ''}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {complianceReport ? `دارایی: ${complianceReport.assetLabel}` : 'برای بررسی، از استودیو به این تب بیایید.'}
                  </p>
                </div>
              </div>
              {complianceReport && (
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold border ${
                    complianceReport.passed
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  امتیاز {toPersianDigits(String(complianceReport.score))} از ۱۰۰
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs" role="list" aria-label="نتایج بررسی استاندارد">
              {complianceReport && complianceReport.issues.length === 0 && (
                <div role="listitem" className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> هیچ مشکلی پیدا نشد؛ این دارایی آمادهٔ خروجی است.
                </div>
              )}
              {complianceReport?.issues.map((issue, idx) => (
                <div
                  key={idx}
                  role="listitem"
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                    issue.severity === 'error' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <p className="text-slate-200 leading-6">{issue.message}</p>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg ${issue.severity === 'error' ? 'text-rose-300 bg-rose-500/20' : 'text-amber-300 bg-amber-500/20'}`}>
                    {issue.severity === 'error' ? 'خطا' : 'هشدار'}
                  </span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setActiveTab('studio')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
              >
                بازگشت به استودیو برای اصلاح
              </button>
            </div>
          </div>
        )}

      </main>

      <footer className="py-6 text-center text-xs text-slate-400" dir="ltr">
        Designed with <span className="inline-block animate-pulse text-rose-500" role="img" aria-label="love">❤</span> by <span className="font-black text-slate-200">EHSANKiNG</span>
      </footer>

      {isBrandKitOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="brand-kit-title" onClick={() => setIsBrandKitOpen(false)}>
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 id="brand-kit-title" className="text-base font-black text-white">کیت برند</h3>
            {([
              ['primary', 'رنگ اصلی'],
              ['secondary', 'رنگ دوم'],
              ['accent', 'رنگ تأکیدی'],
              ['textColor', 'رنگ متن'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between text-xs text-slate-300">
                <span>{label}</span>
                <ColorField label={label} showText value={brandKit[key]} onChange={(v) => setBrandKit((k) => ({ ...k, [key]: v }))} />
              </label>
            ))}
            <label className="flex items-center justify-between text-xs text-slate-300">
              <span>فونت</span>
              <select value={brandKit.fontId} onChange={(e) => setBrandKit((k) => ({ ...k, fontId: e.target.value }))} className="bg-slate-800 text-slate-100 rounded-lg px-2 py-1">
                {PERSIAN_FONTS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </label>
            <p className="text-[11px] text-slate-500 leading-5">رنگ‌ها روی گرادیانت پس‌زمینه و رنگ متن همهٔ لایه‌های متنی اعمال می‌شوند. تغییر لایه‌ها با Ctrl+Z قابل بازگشت است.</p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setIsBrandKitOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold">انصراف</button>
              <button type="button" onClick={handleApplyBrandKit} className="px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-black">ذخیره و اعمال</button>
            </div>
          </div>
        </div>
      )}

      {/* Semantic Sticker Library Modal */}
      <SemanticStickerLibraryModal
        isOpen={isStickerModalOpen}
        onClose={() => setIsStickerModalOpen(false)}
        onAddStickerToCanvas={handleAddStickerToActiveAsset}
      />

      {/* 100+ Icons, Shapes & Badges Library Modal */}
      {isIconLibraryModalOpen && (
        <Suspense fallback={null}>
        <IconShapeLibraryModal
          isOpen={isIconLibraryModalOpen}
          onClose={() => setIsIconLibraryModalOpen(false)}
          onAddLayer={handleAddCustomLayer}
        />
        </Suspense>
      )}

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {isFullscreenPreview && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-sm font-bold text-white">پیش‌نمایش زنده در ابعاد بزرگ</span>
              <button
                onClick={() => setIsFullscreenPreview(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
              >
                بستن
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <div 
                className="max-w-2xl max-h-[80vh] aspect-square rounded-3xl p-8 flex items-center justify-center shadow-2xl relative overflow-hidden" 
                style={getDynamicBackgroundStyle()}
              >
                <RenderPlacedLogo config={logoConfig} />
                <div className="text-center space-y-2 z-10">
                  <h3 className="text-3xl font-black text-white">{productName}</h3>
                  <p className="text-sm text-slate-200">{productSubtitle}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Figma Keyboard Shortcuts Cheatsheet Modal */}
      <AnimatePresence>
        {isFigmaCheatsheetOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-slate-950 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl text-right text-slate-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">راهنمای کلیدهای میانبر بوم فیگما (Figma Shortcuts)</h3>
                    <p className="text-xs text-slate-400">میانبرهای صفحه کلید جهت سرعت در ویرایش بوم و لایه‌ها</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFigmaCheatsheetOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'Right Click (کلیک راست)', desc: 'باز کردن منوی سریع ویرایش، تکثیر و عملیات لایه' },
                  { key: 'Corners Drag (دستگیره گوشه‌ها)', desc: 'کشیدن از ۴ گوشه برای کوچک/بزرگ کردن متناسب' },
                  { key: 'Top Stem Drag (دستگیره بالای لایه)', desc: 'چرخش ۳۶۰ درجه آزاد با انطباق زوایای ۴۵ و ۹۰ درجه' },
                  { key: 'Delete / Backspace', desc: 'حذف فوری لایه انتخاب شده از بوم' },
                  { key: 'Ctrl + D / Cmd + D', desc: 'تکثیر و کپی سریع لایه انتخاب شده (Duplicate)' },
                  { key: 'Ctrl + Z / Cmd + Z', desc: 'بازگردانی آخرین تغییرات (Undo)' },
                  { key: 'Ctrl + Y / Shift + Cmd + Z', desc: 'اعمال مجدد تغییرات بازگردانی شده (Redo)' },
                  { key: 'Arrow Keys (کلیدهای جهت‌نما)', desc: 'جابه‌جایی دقیق لایه به میزان ۱ پیکسل' },
                  { key: 'Shift + Arrow Keys', desc: 'جابه‌جایی سریع لایه به میزان ۱۰ پیکسل' },
                  { key: 'Tراز مغناطیسی (Smart Snapping)', desc: 'انطباق خودکار خطوط هوشمند با مرکز و لبه‌ها' },
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-mono text-amber-300 font-extrabold text-[11px] block bg-slate-950 px-2 py-0.5 rounded border border-amber-500/20 w-fit dir-ltr">
                      {item.key}
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsFigmaCheatsheetOpen(false)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20"
              >
                متوجه شدم - بازگشت به بوم
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Picture-in-Picture Live Mini Preview Window */}
      <LiveMiniPreviewModal
        isOpen={isLivePreviewOpen}
        onClose={() => setIsLivePreviewOpen(false)}
        activeAsset={activeAsset}
        onSelectAsset={(asset) => setActiveAsset(asset)}
        productName={productName}
        productSubtitle={productSubtitle}
        getDynamicBackgroundStyle={getDynamicBackgroundStyle}
        currentFontCss={currentFontCss}
        logoConfig={logoConfig}
        canvasLayers={canvasLayers}
        canvasStickers={canvasStickers}
        infographicRows={infographicRows}
      />

      {/* Right-Click Canvas Context Menu */}
      <CanvasContextMenu
        isOpen={contextMenu?.isOpen || false}
        x={contextMenu?.x || 0}
        y={contextMenu?.y || 0}
        onClose={handleCloseContextMenu}
        activeAsset={activeAsset}
        selectedLayer={currentLayers.find((l) => l.id === activeLayerId) || null}
        onAddVectorShape={handleAddVectorShape}
        onOpen3DModal={() => setIsIconLibraryModalOpen(true)}
        onOpenStickerModal={() => setIsStickerModalOpen(true)}
        onResetToBlank={handleResetActiveAssetToBlank}
        onResetToTemplate={handleResetActiveAssetToTemplate}
        onResetInfographicRows={handleResetInfographicRows}
        onRandomizeGradient={handleRandomizeGradient}
        onDuplicateLayer={activeLayerId ? () => handleDuplicateLayer(activeLayerId) : undefined}
        onToggleLockLayer={activeLayerId ? () => handleToggleLock(activeLayerId) : undefined}
        onDeleteLayer={activeLayerId ? () => handleDeleteLayer(activeLayerId) : undefined}
        onBringForward={activeLayerId ? handleBringLayerForward : undefined}
        onSendBackward={activeLayerId ? handleSendLayerBackward : undefined}
        onExportPng={handleExportPng}
        onToggleFullscreenPreview={() => setIsFullscreenPreview(true)}
      />

    </div>
  );
}

export default App;
