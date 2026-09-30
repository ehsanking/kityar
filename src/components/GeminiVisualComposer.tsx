import React, { useState } from 'react';
import { 
  Sparkles, Wand2, Plus, RefreshCw, Layers, ShieldCheck, 
  Tag, Award, Cpu, Eye, Check, AlertCircle, Key, Settings,
  Image as ImageIcon
} from 'lucide-react';
import { CanvasLayerItem } from '../types/canvasLayers';
import { sanitizeSvg } from '../utils/sanitizeSvg';

interface GeminiVisualComposerProps {
  onAddVectorLayer: (layerConfig: Partial<CanvasLayerItem>) => void;
  productName?: string;
}

export const QUICK_PROMPTS = [
  { label: 'بج طلایی لایسنس اورجینال ژاکت', prompt: 'Gold glossy hexagonal badge with 3D crystal ribbon and verification star for verified digital license', style: '3D Gold Badge' },
  { label: 'آیکون انتزاعی سرعت و بهینه‌سازی', prompt: 'Futuristic speed rocket with neon cyan trails and glowing speed meter icon for fast performance plugin', style: 'Neon Cyber Icon' },
  { label: 'نمودار رشد فروش ووکامرس', prompt: 'Isometric 3D financial growth chart bar with ascending green arrow and coin sparkles', style: 'Isometric 3D' },
  { label: 'نشان گارانتی بازگشت وجه', prompt: 'Modern shield vector with circular return arrow and 100% money back guarantee seal', style: 'Vector Seal' },
  { label: 'پترن وب ۳ و هوش مصنوعی', prompt: 'Abstract neural network node graph with golden gradient glow for AI automation asset', style: 'Abstract Mesh' },
  { label: 'لیبل پیشنهاد شگفت‌انگیز', prompt: 'Dynamic diagonal ribbon badge with flash lightning bolt and hot sale fire gradient', style: 'Hot Sale Ribbon' },
];

export const GeminiVisualComposer: React.FC<GeminiVisualComposerProps> = ({
  onAddVectorLayer,
  productName = 'محصول ووکامرس',
}) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'vector-svg' | 'ai-image'>('vector-svg');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Custom API keys state with localStorage sync
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('zhakit_gemini_key') || '');
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem('zhakit_openai_key') || '');
  const [claudeKey, setClaudeKey] = useState(() => localStorage.getItem('zhakit_claude_key') || '');
  const [showKeysPanel, setShowKeysPanel] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveKeys = () => {
    localStorage.setItem('zhakit_gemini_key', geminiKey.trim());
    localStorage.setItem('zhakit_openai_key', openaiKey.trim());
    localStorage.setItem('zhakit_claude_key', claudeKey.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleGenerate = async (customPrompt?: string) => {
    const textPrompt = customPrompt || prompt;
    if (!textPrompt.trim()) {
      setError('لطفا دستور یا توصیف المان مد نظر خود را وارد کنید.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build headers with custom API keys if present
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (geminiKey.trim()) headers['x-gemini-key'] = geminiKey.trim();
      if (openaiKey.trim()) headers['x-openai-key'] = openaiKey.trim();
      if (claudeKey.trim()) headers['x-claude-key'] = claudeKey.trim();

      if (mode === 'vector-svg') {
        const res = await fetch('/api/generate-vector-svg', {
          method: 'POST',
          headers,
          body: JSON.stringify({ prompt: textPrompt }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'خطا در ارتباط با سرور تولید برداری');
        }

        setGeneratedSvg(data.svg);
        setGeneratedImage(null);
      } else {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers,
          body: JSON.stringify({ prompt: textPrompt, aspectRatio: '1:1' }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'خطا در تولید تصویر با سرور تصویرساز');
        }

        setGeneratedImage(data.imageUrl);
        setGeneratedSvg(null);
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'خطایی در ساخت المان رخ داد.';
      if (
        msg.includes('resource_exhausted') || 
        msg.includes('Quota exceeded') || 
        msg.includes('429') ||
        msg.includes('quota')
      ) {
        msg = 'سهمیه مجاز درخواست‌های مدل Gemini موقتاً به پایان رسیده است. شما می‌توانید با وارد کردن کلید اختصاصی خود در بخش تنظیمات بالا بدون محدودیت از هوش مصنوعی استفاده کنید.';
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCanvas = () => {
    if (generatedSvg) {
      onAddVectorLayer({
        name: `وکتور AI: ${prompt.slice(0, 20) || 'المان جمینای'}`,
        type: 'vector-shape',
        scale: 1.0,
        rotation: 0,
        opacity: 100,
        visible: true,
        locked: false,
        data: {
          svgCode: generatedSvg,
          aiPrompt: prompt,
        },
      });
      setGeneratedSvg(null);
    } else if (generatedImage) {
      onAddVectorLayer({
        name: `تصویر AI: ${prompt.slice(0, 20) || 'المان جمینای'}`,
        type: 'ai-graphic',
        scale: 1.0,
        rotation: 0,
        opacity: 100,
        visible: true,
        locked: false,
        data: {
          imageUrl: generatedImage,
          aiPrompt: prompt,
        },
      });
      setGeneratedImage(null);
    }
  };

  // Determine active service based on keys entered
  const getActiveServiceLabel = () => {
    if (claudeKey.trim() && mode === 'vector-svg') return 'Claude 3.5 Sonnet';
    if (openaiKey.trim()) return mode === 'vector-svg' ? 'OpenAI GPT-4o-Mini' : 'OpenAI DALL-E-3';
    return geminiKey.trim() ? 'Gemini 3.8 Flash (Custom Key)' : 'Gemini 3.8 Flash (Project Key)';
  };

  return (
    <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-4 shadow-xl text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">کامپوزر هوش مصنوعی چندگانه (Zhakit AI Hub)</h4>
            <p className="text-[10px] text-slate-400">تولید مستقیم با کلید اختصاصی شما (Gemini, Claude, OpenAI)</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowKeysPanel(!showKeysPanel)}
          className={`p-1.5 rounded-lg border flex items-center gap-1 transition-all ${
            showKeysPanel 
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' 
              : 'bg-slate-900 text-slate-300 border-white/5 hover:bg-slate-800'
          }`}
          title="تنظیم کلیدهای API شخصی شما"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="text-[10px] hidden sm:inline">تنظیم کلیدها</span>
        </button>
      </div>

      {/* Active Service Badge */}
      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-white/5 text-[10px]">
        <span className="text-slate-400">سرویس فعال تولید:</span>
        <span className="font-mono text-amber-300 font-extrabold">{getActiveServiceLabel()}</span>
      </div>

      {/* Custom API Keys Config Panel */}
      {showKeysPanel && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 animate-in slide-in-from-top-1 duration-150">
          <h5 className="font-bold text-white flex items-center gap-1 text-[10px] border-b border-white/5 pb-1.5">
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>تنظیم کلیدهای اختصاصی شما (ذخیره محلی در مرورگر)</span>
          </h5>

          <div className="space-y-2">
            {/* Gemini Key */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block font-bold">Google Gemini API Key:</label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white font-mono text-[10px] focus:border-amber-400 outline-none text-left"
                placeholder="AIzaSy..."
              />
            </div>

            {/* OpenAI Key */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block font-bold">OpenAI API Key:</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white font-mono text-[10px] focus:border-amber-400 outline-none text-left"
                placeholder="sk-proj-..."
              />
            </div>

            {/* Claude Key */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block font-bold">Anthropic Claude API Key:</label>
              <input
                type="password"
                value={claudeKey}
                onChange={(e) => setClaudeKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white font-mono text-[10px] focus:border-amber-400 outline-none text-left"
                placeholder="sk-ant-..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <span className="text-[9px] text-slate-400 italic">کلیدها در فضای ابری ذخیره نمی‌شوند.</span>
            <button
              type="button"
              onClick={handleSaveKeys}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] flex items-center gap-1 transition-all"
            >
              {saveSuccess ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              <span>{saveSuccess ? 'ذخیره شد' : 'ثبت و ذخیره کلیدها'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => setMode('vector-svg')}
          className={`p-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
            mode === 'vector-svg'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>تولید وکتور برداری (SVG لایه‌ای)</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('ai-image')}
          className={`p-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
            mode === 'ai-image'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>تولید تصویر خلاقانه (Image Generator)</span>
        </button>
      </div>

      {/* Prompt Input Box */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-slate-300 font-medium block">
          دستور خلق المان یا وکتور مورد نظر شما:
        </label>
        <div className="relative">
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="مثال: نشان لایسنس طلایی اورجینال با هاله نئونی و ستاره تایید ژاکت..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-amber-500/60 leading-relaxed resize-none"
          />
          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="absolute bottom-2.5 left-2.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow transition-all"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            <span>{isLoading ? 'در حال خلق...' : 'تولید با AI'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Prompts Suggestions */}
      <div>
        <label className="text-[10px] text-slate-400 mb-1.5 block">ایده‌های آماده برای درج روی کاور:</label>
        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(qp.prompt);
                handleGenerate(qp.prompt);
              }}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-right text-[10px] text-slate-300 transition-all flex items-center gap-1.5 truncate"
            >
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{qp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Result Preview & Add Button */}
      {(generatedSvg || generatedImage) && (
        <div className="p-3 bg-slate-900 rounded-2xl border border-emerald-500/40 space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>المان با موفقیت توسط هوش مصنوعی خلق شد</span>
            </span>
          </div>

          <div className="h-32 bg-slate-950/80 rounded-xl border border-white/10 p-2 flex items-center justify-center overflow-hidden">
            {generatedSvg ? (
              <div 
                className="max-h-full max-w-full flex items-center justify-center [&>svg]:max-h-28 [&>svg]:max-w-full"
                dangerouslySetInnerHTML={{ __html: sanitizeSvg(generatedSvg) }} 
              />
            ) : generatedImage ? (
              <img src={generatedImage} alt="AI Generated" className="max-h-full object-contain rounded" />
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleAddToCanvas}
            className="w-full py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن این المان به لایه‌های بوم</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default GeminiVisualComposer;
