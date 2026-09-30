import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertTriangle, Check, GripVertical, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';

export interface InfographicRowData {
  id: string;
  title: string;
  desc: string;
  items: string[];
  rowType?: 'content' | 'image-banner';
  imageUrl?: string;
  caption?: string;
  heightPx?: number;
}

interface SortableInfographicRowProps {
  row: InfographicRowData;
  index: number;
  totalRows: number;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onUpdateDesc: (id: string, newDesc: string) => void;
  onUpdateItem: (id: string, itemIdx: number, newItem: string) => void;
  onUpdateRow?: (id: string, updates: Partial<InfographicRowData>) => void;
  onDeleteRow: (id: string) => void;
}

export const SortableInfographicRow: React.FC<SortableInfographicRowProps> = ({
  row,
  index,
  totalRows,
  onUpdateTitle,
  onUpdateDesc,
  onUpdateItem,
  onUpdateRow,
  onDeleteRow,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const rawTransform = CSS.Transform.toString(transform);
  const style: React.CSSProperties = {
    transform: isDragging
      ? rawTransform
        ? `${rawTransform} scale(1.025)`
        : 'scale(1.025)'
      : rawTransform,
    transition,
    animationDelay: `${index * 0.1}s`,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.95 : 1,
  };

  const handleDeleteClick = () => {
    onDeleteRow(row.id);
    setIsConfirmingDelete(false);
  };

  // Render Image Banner / Visual Divider Row
  if (row.rowType === 'image-banner') {
    const bannerHeight = row.heightPx || 160;
    const bannerCaption = row.caption || 'پیش‌نمایش تصویری و اسکرین‌شات محصول';

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`animate-row-entrance bg-slate-950/85 p-3 rounded-2xl border ${
          isConfirmingDelete
            ? 'border-rose-500/60 ring-1 ring-rose-500/30 bg-rose-950/20'
            : isDragging
            ? 'border-amber-400 shadow-2xl ring-2 ring-amber-500/50'
            : 'border-emerald-500/30 hover:border-emerald-500/50'
        } backdrop-blur-md space-y-2 transition-all group relative`}
      >
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <button
              type="button"
              {...attributes}
              {...listeners}
              data-export-ignore="true"
              className="export-ignore cursor-grab active:cursor-grabbing p-1 rounded-md text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors shrink-0"
              title="جابجایی ردیف تصویری (Drag & Drop)"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>ردیف تصویر و فاصله‌انداز اینفوگرافی</span>
            </div>
          </div>

          <div data-export-ignore="true" className="export-ignore shrink-0 flex items-center">
            {isConfirmingDelete ? (
              <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-500/50 p-1 rounded-lg text-[10px]">
                <span className="text-rose-300 font-medium px-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse shrink-0" />
                  <span>حذف؟</span>
                </span>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5"
                >
                  <Check className="w-3 h-3" />
                  <span>بله</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="bg-slate-800 text-slate-300 font-medium px-1.5 py-0.5 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition-all"
                title="حذف این ردیف تصویری"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Image Preview / Container */}
        <div
          style={{ height: `${bannerHeight}px` }}
          className="w-full rounded-xl bg-slate-900 border border-slate-800 overflow-hidden relative flex items-center justify-center group/img shadow-inner"
        >
          {row.imageUrl ? (
            <img src={row.imageUrl} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center space-y-2 text-slate-400">
              <ImageIcon className="w-8 h-8 text-emerald-400/80" />
              <span className="text-xs font-bold text-slate-300">تصویر یا بنر فاصله‌انداز اینفوگرافی</span>
              <span className="text-[10px] text-slate-500">برای بارگذاری عکس دلخواه از کامپیوتر کلیک کنید</span>
            </div>
          )}

          {/* Floating Upload Overlay */}
          <div data-export-ignore="true" className="export-ignore absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e: any) => {
                  const file = e.target?.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                      onUpdateRow?.(row.id, { imageUrl: re.target?.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>آپلود تصویر</span>
            </button>
            {row.imageUrl && (
              <button
                type="button"
                onClick={() => onUpdateRow?.(row.id, { imageUrl: undefined })}
                className="p-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-xl"
                title="حذف تصویر"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Caption Input */}
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateRow?.(row.id, { caption: e.currentTarget.textContent || bannerCaption })}
          className="text-[10px] text-slate-400 text-center italic outline-none focus:bg-slate-900 px-1 rounded"
        >
          {bannerCaption}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`animate-row-entrance bg-slate-950/80 p-3.5 rounded-xl border ${
        isConfirmingDelete
          ? 'border-rose-500/60 ring-1 ring-rose-500/30 bg-rose-950/20 shadow-lg shadow-rose-950/40'
          : isDragging
          ? 'border-amber-400/90 shadow-xl shadow-amber-500/25 bg-slate-900/95 ring-2 ring-amber-500/50 cursor-grabbing relative z-50'
          : 'border-white/10 hover:border-white/20'
      } backdrop-blur-md space-y-2 transition-all group relative`}
    >
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {/* DnD Grip Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            data-export-ignore="true"
            className="export-ignore cursor-grab active:cursor-grabbing p-1 rounded-md text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors shrink-0"
            title="برای تغییر ترتیب ردیف بکشید و رها کنید (Drag & Drop)"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>

          <h6
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdateTitle(row.id, e.currentTarget.textContent || row.title)}
            className="text-xs font-bold text-amber-300 outline-none focus:bg-slate-900 px-1 rounded truncate flex-1"
          >
            {row.title}
          </h6>
        </div>

        {totalRows > 1 && (
          <div data-export-ignore="true" className="export-ignore shrink-0 flex items-center">
            {isConfirmingDelete ? (
              <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-500/50 p-1 rounded-lg text-[10px] shadow-md animate-fade-in">
                <span className="text-rose-300 font-medium px-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse shrink-0" />
                  <span>حذف؟</span>
                </span>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded transition-all flex items-center gap-0.5 shadow-sm active:scale-95"
                  title="تایید و حذف ردیف"
                >
                  <Check className="w-3 h-3" />
                  <span>بله</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-1.5 py-0.5 rounded transition-all flex items-center gap-0.5 active:scale-95"
                  title="انصراف"
                >
                  <X className="w-3 h-3" />
                  <span>انصراف</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition-all shrink-0"
                title="حذف این ردیف"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      <p
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onUpdateDesc(row.id, e.currentTarget.textContent || row.desc)}
        className="text-[11px] text-slate-200 leading-relaxed outline-none focus:bg-slate-900 px-1 rounded"
      >
        {row.desc}
      </p>

      {row.items && row.items.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-0.5">
          {row.items.map((item, itemIdx) => (
            <div
              key={itemIdx}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdateItem(row.id, itemIdx, e.currentTarget.textContent || item)}
              className="bg-slate-900/90 px-2 py-1 rounded text-emerald-300 border border-slate-800 outline-none focus:bg-slate-800 truncate"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortableInfographicRow;
