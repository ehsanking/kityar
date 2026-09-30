import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Layers, Eye, EyeOff, Lock, Unlock,
  Trash2, Plus, Copy,
  Smartphone, Tag, Type, Sparkles, Image as ImageIcon,
  Move, FlipHorizontal, FlipVertical,
  AlignCenter, AlignLeft, AlignRight,
  AlignHorizontalJustifyCenter, Sparkle, Palette,
  Edit2, Check, ArrowUpToLine, ArrowDownToLine, Zap,
  BarChart3, ShieldCheck, Percent, Star, DollarSign,
  Shapes, Grid, Flame, Award, Heart,
  Folder, FolderPlus, FolderOpen, ChevronDown, ChevronRight
} from 'lucide-react';
import { BlendMode, CanvasLayerItem, LayerType } from '../types/canvasLayers';
import { toPersianDigits } from '../utils/persianNumbers';

interface SortableLayerRowProps {
  layer: CanvasLayerItem;
  isSelected: boolean;
  groups: { id: string; name: string }[];
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRename: (newName: string) => void;
  onSetTagColor: (color: CanvasLayerItem['tagColor']) => void;
  onMoveToGroup: (groupId: string) => void;
}

const SortableLayerRow: React.FC<SortableLayerRowProps> = ({
  layer,
  isSelected,
  groups,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onDuplicate,
  onRename,
  onSetTagColor,
  onMoveToGroup,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(layer.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  const getLayerIcon = (type: LayerType) => {
    switch (type) {
      case 'mockup':
        return <Smartphone className="w-3.5 h-3.5 text-indigo-400" />;
      case 'sticker':
        return <Tag className="w-3.5 h-3.5 text-amber-400" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-emerald-400" />;
      case 'badge':
        return <Tag className="w-3.5 h-3.5 text-amber-300" />;
      case 'feature-pills':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'stat-card':
        return <BarChart3 className="w-3.5 h-3.5 text-purple-400" />;
      case 'trust-seal':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'icon-library':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
      case 'shape':
      case 'vector-shape':
        return <Shapes className="w-3.5 h-3.5 text-pink-400" />;
      case 'discount-ribbon':
        return <Percent className="w-3.5 h-3.5 text-rose-400" />;
      case 'rating-badge':
        return <Star className="w-3.5 h-3.5 text-amber-300" />;
      case 'price-tag':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      case 'ai-graphic':
        return <ImageIcon className="w-3.5 h-3.5 text-orange-400" />;
      case 'logo':
        return <Award className="w-3.5 h-3.5 text-blue-400" />;
      case 'background':
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getTagColorClass = (color?: CanvasLayerItem['tagColor']) => {
    switch (color) {
      case 'amber':
        return 'border-r-4 border-r-amber-500';
      case 'emerald':
        return 'border-r-4 border-r-emerald-500';
      case 'indigo':
        return 'border-r-4 border-r-indigo-500';
      case 'purple':
        return 'border-r-4 border-r-purple-500';
      case 'rose':
        return 'border-r-4 border-r-rose-500';
      case 'cyan':
        return 'border-r-4 border-r-cyan-500';
      default:
        return '';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group flex items-center justify-between p-2 rounded-xl transition-all border select-none cursor-pointer ${
        isSelected
          ? 'bg-slate-800/90 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
          : 'bg-slate-900/60 border-slate-800/60 hover:bg-slate-850 hover:border-slate-700'
      } ${getTagColorClass(layer.tagColor)}`}
    >
      {/* Drag handle & layer info */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-amber-400 transition-colors"
          title="جابجایی ترتیب لایه"
          onClick={(e) => e.stopPropagation()}
        >
          <Move className="w-3 h-3 opacity-60 group-hover:opacity-100" />
        </div>

        <div className="p-1 rounded bg-slate-950 border border-slate-800 flex-shrink-0">
          {getLayerIcon(layer.type)}
        </div>

        {/* Name / Inline Rename */}
        <div className="flex-1 min-w-0 text-right">
          {isEditingName ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onRename(nameInput.trim() || layer.name);
                    setIsEditingName(false);
                  } else if (e.key === 'Escape') {
                    setIsEditingName(false);
                  }
                }}
                autoFocus
                className="w-full bg-slate-950 border border-amber-500/50 rounded px-1.5 py-0.5 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  onRename(nameInput.trim() || layer.name);
                  setIsEditingName(false);
                }}
                className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span
                onDoubleClick={() => setIsEditingName(true)}
                className={`text-xs font-bold truncate block ${
                  isSelected ? 'text-amber-300' : 'text-slate-200'
                }`}
              >
                {layer.name}
              </span>
              {layer.locked && <Lock className="w-2.5 h-2.5 text-amber-500/80 flex-shrink-0" />}
            </div>
          )}
          <span className="text-[9px] text-slate-500 font-mono block">
            {layer.type} {layer.x !== undefined ? `(${toPersianDigits(layer.x)}, ${toPersianDigits(layer.y)})` : ''}
          </span>
        </div>
      </div>

      {/* Group selector dropdown */}
      {groups.length > 1 && (
        <div onClick={(e) => e.stopPropagation()} className="px-1">
          <select
            value={layer.groupId || 'default-group'}
            onChange={(e) => onMoveToGroup(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-[9px] text-amber-300 rounded px-1 py-0.5 outline-none font-bold opacity-0 group-hover:opacity-100 transition-opacity"
            title="انتقال به گروه دیگر"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Layer quick actions */}
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {/* Rename trigger */}
        {!isEditingName && (
          <button
            type="button"
            onClick={() => setIsEditingName(true)}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 transition-opacity"
            title="تغییر نام لایه"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        )}

        {/* Duplicate button */}
        {layer.type !== 'background' && (
          <button
            type="button"
            onClick={onDuplicate}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-amber-300 transition-opacity"
            title="ایجاد نسخه کپی (داپلیکیت)"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}

        {/* Visibility */}
        <button
          type="button"
          onClick={onToggleVisibility}
          className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
          title={layer.visible !== false ? 'پنهان کردن لایه' : 'نمایش لایه'}
        >
          {layer.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
        </button>

        {/* Lock */}
        <button
          type="button"
          onClick={onToggleLock}
          className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
          title={layer.locked ? 'باز کردن قفل' : 'قفل کردن لایه'}
        >
          {layer.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 opacity-50" />}
        </button>

        {/* Delete */}
        {layer.type !== 'background' && (
          <button
            type="button"
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
            title="حذف لایه"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

interface LayersSidebarProps {
  layers: CanvasLayerItem[];
  activeLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onMoveLayer?: (id: string, direction: 'up' | 'down') => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<CanvasLayerItem>) => void;
  onReorderLayers: (newLayers: CanvasLayerItem[]) => void;
  onQuickAdd: (type: LayerType) => void;
  onOpenIconModal?: () => void;
  canvasWidth?: number;
  canvasHeight?: number;
}

export const LayersSidebar: React.FC<LayersSidebarProps> = ({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onDeleteLayer,
  onDuplicateLayer,
  onUpdateLayer,
  onReorderLayers,
  onQuickAdd,
  onOpenIconModal,
  canvasWidth = 340,
  canvasHeight = 340,
}) => {
  const [activeTab, setActiveTab] = useState<'layers' | 'transform' | 'blend' | 'fx'>('layers');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [groups, setGroups] = useState<{ id: string; name: string; isExpanded: boolean }[]>([
    { id: 'default-group', name: 'گروه اصلی لایه‌ها (Main Group)', isExpanded: true },
  ]);

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  const handleCreateGroup = () => {
    const newGroupId = `group-${Date.now()}`;
    const newGroupName = `گروه لایه‌ها ${groups.length + 1}`;
    setGroups([...groups, { id: newGroupId, name: newGroupName, isExpanded: true }]);
  };

  const dndSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndLayers = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = layers.findIndex((l) => l.id === active.id);
      const newIndex = layers.findIndex((l) => l.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(layers, oldIndex, newIndex);
        onReorderLayers(reordered);
      }
    }
  };

  const handleDuplicate = (id: string) => {
    onDuplicateLayer(id);
  };

  const handleBringToFront = () => {
    if (!activeLayerId) return;
    const idx = layers.findIndex((l) => l.id === activeLayerId);
    if (idx !== -1 && idx < layers.length - 1) {
      const copy = [...layers];
      const [item] = copy.splice(idx, 1);
      copy.push(item);
      onReorderLayers(copy);
    }
  };

  const handleSendToBack = () => {
    if (!activeLayerId) return;
    const idx = layers.findIndex((l) => l.id === activeLayerId);
    if (idx > 0) {
      const copy = [...layers];
      const [item] = copy.splice(idx, 1);
      copy.unshift(item);
      onReorderLayers(copy);
    }
  };

  const handleAlign = (type: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom' | 'centerAll') => {
    if (!activeLayer) return;
    const elWidth = 100;
    const elHeight = 50;
    const updates: Partial<CanvasLayerItem> = {};

    switch (type) {
      case 'left':
        updates.x = 0;
        break;
      case 'centerX':
        updates.x = Math.round((canvasWidth - elWidth) / 2);
        break;
      case 'right':
        updates.x = canvasWidth - elWidth;
        break;
      case 'top':
        updates.y = 0;
        break;
      case 'centerY':
        updates.y = Math.round((canvasHeight - elHeight) / 2);
        break;
      case 'bottom':
        updates.y = canvasHeight - elHeight;
        break;
      case 'centerAll':
        updates.x = Math.round((canvasWidth - elWidth) / 2);
        updates.y = Math.round((canvasHeight - elHeight) / 2);
        break;
    }
    onUpdateLayer(activeLayer.id, updates);
  };

  return (
    <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-xl backdrop-blur-xl text-xs text-right">
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-xs">مدیریت لایه‌های بوم</h4>
            <p className="text-[10px] text-slate-400">فوتوشاپ لایه استک و گروه‌بندی پوشه‌ها</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 relative">
          <button
            type="button"
            onClick={onOpenIconModal}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs shadow-md transition-all cursor-pointer"
            title="کتابخانه جامع آیکون و اشکال"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">آیکون</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
            title="افزودن لایه جدید به بوم"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ لایه</span>
          </button>

          {/* Categorized Add Layer Dropdown Menu */}
          {showAddMenu && (
            <div className="absolute left-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-50 space-y-1.5 max-h-[380px] overflow-y-auto custom-scrollbar">
              <div className="px-2 py-1 bg-cyan-950/60 rounded-xl border border-cyan-800/50 mb-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    onOpenIconModal?.();
                  }}
                  className="w-full text-right p-1 rounded-lg text-cyan-300 hover:text-white font-black text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>کتابخانه ۱۰۰+ آیکون و اشکال</span>
                </button>
              </div>

              {[
                { type: 'text', label: 'متن و عنوان اختصاصی', icon: Type, color: 'text-emerald-400' },
                { type: 'badge', label: 'نشان دسته‌بندی و بج', icon: Tag, color: 'text-amber-400' },
                { type: 'discount-ribbon', label: 'برچسب تخفیف و آفر ویژه', icon: Percent, color: 'text-rose-400' },
                { type: 'rating-badge', label: 'ستاره و باکس امتیاز خریداران', icon: Star, color: 'text-amber-300' },
                { type: 'price-tag', label: 'برچسب قیمت و تخفیف', icon: DollarSign, color: 'text-emerald-400' },
                { type: 'shape', label: 'اشکال هندسی و وکتور نئونی', icon: Shapes, color: 'text-pink-400' },
                { type: 'feature-pills', label: 'کپسول‌های ۴ گانه ویژگی', icon: Zap, color: 'text-amber-300' },
                { type: 'stat-card', label: 'باکس مشخصات و آمار', icon: BarChart3, color: 'text-purple-400' },
                { type: 'trust-seal', label: 'تاییدیه و گارانتی ژاکت', icon: ShieldCheck, color: 'text-emerald-400' },
                { type: 'sticker', label: 'استیکر و نشان‌های گرافیکی', icon: Sparkle, color: 'text-orange-400' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      onQuickAdd(item.type as LayerType);
                      setShowAddMenu(false);
                    }}
                    className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sub-tabs for Layer Controls */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-[10px]">
        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`py-1 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'layers'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>لایه‌ها</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transform')}
          className={`py-1 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'transform'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Move className="w-3 h-3" />
          <span>تراز و مکان</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('blend')}
          className={`py-1 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'blend'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-3 h-3" />
          <span>آمیختگی</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fx')}
          className={`py-1 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'fx'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkle className="w-3 h-3" />
          <span>افکت‌ها</span>
        </button>
      </div>

      {/* TAB 1: LAYERS STACK LIST WITH GROUPS & FOLDERS */}
      {activeTab === 'layers' && (
        <div className="space-y-2">
          {/* Quick layer actions bar & New Group Folder button */}
          <div className="flex items-center justify-between px-1 text-[10px] text-slate-400 border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-300">گروه‌ها و چیدمان:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCreateGroup}
                className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="ایجاد گروه جدید (New Group)"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>گروه جدید (+ پوشه)</span>
              </button>
            </div>
          </div>

          <DndContext
            sensors={dndSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEndLayers}
          >
            <SortableContext
              items={layers.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                {layers.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-[11px]">
                    لایه‌ای روی این بوم موجود نیست. برای شروع دکمه «+ لایه جدید» را بزنید.
                  </div>
                ) : (
                  groups.map((group) => {
                    const groupLayers = [...layers].reverse().filter((l) => (l.groupId || 'default-group') === group.id);
                    return (
                      <div key={group.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 space-y-1.5 shadow-sm">
                        {/* Group Folder Header with Expand/Collapse Toggle */}
                        <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                          <div
                            className="flex items-center gap-1.5 cursor-pointer flex-1 min-w-0"
                            onClick={() =>
                              setGroups(
                                groups.map((g) =>
                                  g.id === group.id ? { ...g, isExpanded: !g.isExpanded } : g
                                )
                              )
                            }
                          >
                            {group.isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            {group.isExpanded ? (
                              <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : (
                              <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className="truncate">{group.name}</span>
                            <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded-full font-mono shrink-0">
                              {toPersianDigits(groupLayers.length)} لایه
                            </span>
                          </div>

                          {groups.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setGroups(groups.filter((g) => g.id !== group.id));
                                groupLayers.forEach((l) => onUpdateLayer(l.id, { groupId: 'default-group' }));
                              }}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                              title="حذف گروه"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Nested Layers inside Group Folder */}
                        {group.isExpanded && (
                          <div className="space-y-1.5 pr-3 border-r-2 border-amber-500/30 mr-1 pt-1">
                            {groupLayers.length === 0 ? (
                              <div className="text-[10px] text-slate-500 italic py-1 text-center">
                                این پوشه خالی است. لایه‌ها را به اینجا منتقل کنید.
                              </div>
                            ) : (
                              groupLayers.map((layer) => (
                                <SortableLayerRow
                                  key={layer.id}
                                  layer={layer}
                                  isSelected={layer.id === activeLayerId}
                                  groups={groups}
                                  onSelect={() => onSelectLayer(layer.id)}
                                  onToggleVisibility={() => onToggleVisibility(layer.id)}
                                  onToggleLock={() => onToggleLock(layer.id)}
                                  onDelete={() => onDeleteLayer(layer.id)}
                                  onDuplicate={() => handleDuplicate(layer.id)}
                                  onRename={(newName) => onUpdateLayer(layer.id, { name: newName })}
                                  onSetTagColor={(col) => onUpdateLayer(layer.id, { tagColor: col })}
                                  onMoveToGroup={(targetGroupId) => onUpdateLayer(layer.id, { groupId: targetGroupId })}
                                />
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* TAB 2: ALIGNMENT & GEOMETRY CONTROLS */}
      {activeTab === 'transform' && (
        <div className="space-y-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          {!activeLayer ? (
            <div className="text-center py-4 text-slate-400 text-[11px]">
              ابتدا یک لایه را از لیست انتخاب کنید.
            </div>
          ) : (
            <>
              {/* Alignment Tools Grid */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-amber-300 block">تراز خودکار روی بوم (Alignment):</span>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => handleAlign('left')}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 flex items-center justify-center gap-1 border border-slate-800"
                    title="تراز چپ"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAlign('centerX')}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 flex items-center justify-center gap-1 border border-slate-800"
                    title="مرکز افقی"
                  >
                    <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAlign('right')}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 flex items-center justify-center gap-1 border border-slate-800"
                    title="تراز راست"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAlign('centerAll')}
                    className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center gap-1 border border-amber-500/40 font-bold"
                    title="مرکز کامل بوم"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Position Coordinate Direct Inputs */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-emerald-300 block">موقعیت دقیق (X, Y):</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-500 font-mono font-bold">X:</span>
                    <input
                      type="number"
                      value={activeLayer.x ?? 0}
                      onChange={(e) => onUpdateLayer(activeLayer.id, { x: Number(e.target.value) })}
                      className="w-full bg-transparent text-xs text-white outline-none font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-500 font-mono font-bold">Y:</span>
                    <input
                      type="number"
                      value={activeLayer.y ?? 0}
                      onChange={(e) => onUpdateLayer(activeLayer.id, { y: Number(e.target.value) })}
                      className="w-full bg-transparent text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Flip Controls */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-indigo-300 block">قرینه‌سازی (Flip):</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateLayer(activeLayer.id, { flipHorizontal: !activeLayer.flipHorizontal })}
                    className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1.5 ${
                      activeLayer.flipHorizontal
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>افقی (Flip X)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateLayer(activeLayer.id, { flipVertical: !activeLayer.flipVertical })}
                    className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1.5 ${
                      activeLayer.flipVertical
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <FlipVertical className="w-3.5 h-3.5" />
                    <span>عمودی (Flip Y)</span>
                  </button>
                </div>
              </div>

              {/* Rotation Quick Snaps */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-300">
                  <span className="font-bold text-purple-300">زاویه چرخش:</span>
                  <span className="font-mono font-bold text-purple-300">{activeLayer.rotation}°</span>
                </div>
                <div className="flex items-center gap-1">
                  {[-90, 0, 45, 90, 180].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => onUpdateLayer(activeLayer.id, { rotation: deg })}
                      className={`flex-1 py-1 rounded-md text-[9px] font-mono border ${
                        activeLayer.rotation === deg
                          ? 'bg-purple-600 text-white border-purple-400 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: BLEND MODES */}
      {activeTab === 'blend' && (
        <div className="space-y-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          {!activeLayer ? (
            <div className="text-center py-4 text-slate-400 text-[11px]">ابتدا یک لایه را انتخاب کنید.</div>
          ) : (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-amber-300 block">حالت آمیختگی لایه (Blend Mode):</span>
              <select
                value={activeLayer.blendMode || 'normal'}
                onChange={(e) => onUpdateLayer(activeLayer.id, { blendMode: e.target.value as BlendMode })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs outline-none"
              >
                {[
                  { id: 'normal', name: 'Normal (عادی)' },
                  { id: 'multiply', name: 'Multiply (ضرب)' },
                  { id: 'screen', name: 'Screen (اسکرین)' },
                  { id: 'overlay', name: 'Overlay (روکش)' },
                  { id: 'color-dodge', name: 'Color Dodge (درخشش)' },
                  { id: 'darken', name: 'Darken (تیره‌ساز)' },
                  { id: 'lighten', name: 'Lighten (روشن‌ساز)' },
                ].map((bm) => (
                  <option key={bm.id} value={bm.id}>{bm.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FX & OPACITY */}
      {activeTab === 'fx' && (
        <div className="space-y-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          {!activeLayer ? (
            <div className="text-center py-4 text-slate-400 text-[11px]">ابتدا یک لایه را انتخاب کنید.</div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-amber-300">شفافیت لایه (Opacity):</span>
                <span className="font-mono text-amber-400">{activeLayer.opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeLayer.opacity}
                onChange={(e) => onUpdateLayer(activeLayer.id, { opacity: Number(e.target.value) })}
                className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded cursor-pointer"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LayersSidebar;
