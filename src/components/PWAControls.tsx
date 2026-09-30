import React, { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { WifiOff, Download, X, HelpCircle, Laptop } from 'lucide-react';

export const PWAControls: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <>
      {/* 1. Offline Mode Connectivity Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 bg-rose-500 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-rose-400 animate-bounce text-xs font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <WifiOff className="w-4 h-4 text-white" />
          <span>حالت آفلاین فعال شد — در حال استفاده از اطلاعات ذخیره‌شده محلی (Workbox SW)</span>
        </div>
      )}

      {/* 2. Custom PWA In-App Install Button */}
      {!isInstalled && (
        <div className="inline-flex items-center gap-2">
          {/* Chromium / Android installable */}
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/10"
              title="نصب نسخه وب اپلیکیشن (PWA) روی سیستم یا گوشی"
            >
              <Download className="w-3.5 h-3.5" />
              <span>نصب برنامه (PWA)</span>
            </button>
          )}

          {/* iOS Safari manual install instructions */}
          {isIOS && (
            <>
              <button
                onClick={() => setShowIOSGuide(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>نصب روی iOS</span>
              </button>

              {showIOSGuide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                  <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-right text-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="font-extrabold text-sm text-white">راهنمای نصب در آیفون / آیپد</span>
                      <button
                        onClick={() => setShowIOSGuide(false)}
                        className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3 text-xs leading-relaxed">
                      <p>۱. در پایین مرورگر سافاری روی دکمه <strong className="text-amber-400">Share (اشتراک‌گذاری)</strong> کلیک کنید.</p>
                      <p>۲. در منوی باز شده به پایین اسکرول کرده و گزینه <strong className="text-amber-400">Add to Home Screen (افزودن به صفحه اصلی)</strong> را انتخاب کنید.</p>
                      <p>۳. در بالای صفحه گزینه <strong className="text-amber-400">Add</strong> را بزنید تا آیکون کیت یار در لیست برنامه‌های شما قرار بگیرد.</p>
                    </div>
                    <button
                      onClick={() => setShowIOSGuide(false)}
                      className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-white/10 text-white font-bold text-xs transition-all"
                    >
                      بستن راهنما
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default PWAControls;
