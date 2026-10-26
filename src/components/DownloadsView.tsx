import React from 'react';
import {
  Download,
  Trash2,
  BookOpen,
  HardDrive,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowDownToLine,
  Layers,
} from 'lucide-react';
import { Volume } from '../types';

interface DownloadsViewProps {
  volumes: Volume[];
  onSelectVolume: (volume: Volume) => void;
  onDownloadVolume: (volume: Volume) => void;
  onDeleteDownload: (volumeId: number) => void;
  onDownloadAll: () => void;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  volumes,
  onSelectVolume,
  onDownloadVolume,
  onDeleteDownload,
  onDownloadAll,
}) => {
  const downloadedVolumes = volumes.filter((v) => v.isDownloaded);

  return (
    <div className="min-h-screen pb-24 text-white" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-b from-[#041a11] to-[#08291c] pt-6 pb-6 px-4 sm:px-8 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Download className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold font-nastaliq text-amber-300">
                  ڈاؤن لوڈز و آف لائن محفوظ کتب
                </h1>
              </div>
              <p className="text-xs text-amber-200/70 font-arabic mt-1">
                ڈاؤن لوڈ کی گئی جلدیں انٹرنیٹ کے بغیر بھی مکمل طور پر پڑھی جا سکتی ہیں۔
              </p>
            </div>

            <button
              onClick={onDownloadAll}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>تمام ۱۲ جلدیں ڈاؤن لوڈ کریں</span>
            </button>
          </div>

          {/* Storage Bar Card */}
          <div className="mt-5 bg-black/40 p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <HardDrive className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-gray-300 font-medium mb-1">
                  <span>محفوظ شدہ جلدیں: {downloadedVolumes.length} از ۱۲</span>
                  <span className="text-amber-400 font-bold">
                    ~{(downloadedVolumes.length * 44).toFixed(0)} MB
                  </span>
                </div>
                <div className="w-full sm:w-64 h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${(downloadedVolumes.length / 12) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              آف لائن ریڈر فعال ہے
            </span>
          </div>
        </div>
      </header>

      {/* Main List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-6">
        {downloadedVolumes.length === 0 ? (
          <div className="text-center py-16 px-4 bg-black/20 rounded-2xl border border-white/5 my-4">
            <Download className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
            <h3 className="text-base font-bold text-amber-300 font-nastaliq mb-1">
              ابھی تک کوئی جلد ڈاؤن لوڈ نہیں کی گئی
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
              ہوم پیج سے کسی بھی جلد پر موجود ڈاؤن لوڈ کے بٹن پر کلک کریں یا اوپر دیے گئے بٹن سے تمام جلدیں یکجا محفوظ کریں۔
            </p>
            <button
              onClick={onDownloadAll}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
            >
              پہلی جلد ڈاؤن لوڈ کریں
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {downloadedVolumes.map((vol) => (
              <div
                key={vol.id}
                className="bg-gradient-to-r from-[#0b241b] to-[#071a13] p-4 rounded-2xl border border-amber-500/20 hover:border-amber-400/50 transition flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
              >
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div className="relative shrink-0">
                    <img
                      src={vol.coverImage || '/logo.png'}
                      alt={vol.title}
                      className="w-14 h-18 object-contain rounded-lg border border-amber-500/30 shadow"
                    />
                    <div className="absolute -bottom-1 -left-1 p-0.5 rounded bg-emerald-500 text-slate-950">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {vol.volumeNumber}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white font-nastaliq line-clamp-1">
                        {vol.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span>{vol.totalPages} صفحات</span>
                      <span>•</span>
                      <span>سائز: {vol.fileSize}</span>
                      <span>•</span>
                      <span className="text-emerald-400">آف لائن محفوظ</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                  <button
                    onClick={() => onSelectVolume(vol)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>پڑھیں</span>
                  </button>

                  <button
                    onClick={() => onDeleteDownload(vol.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                    title="آف لائن کیش سے حذف کریں"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Remaining Volumes section */}
        {volumes.some((v) => !v.isDownloaded) && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <h4 className="text-sm font-bold text-amber-300 font-nastaliq mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>دیگر دستیاب جلدیں (ڈاؤن لوڈ کے لیے تیار):</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {volumes
                .filter((v) => !v.isDownloaded)
                .map((vol) => (
                  <div
                    key={vol.id}
                    className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-amber-400">{vol.volumeNumberEn}</span>
                      <div>
                        <h5 className="text-xs font-bold text-gray-200 line-clamp-1">
                          {vol.title}
                        </h5>
                        <span className="text-[10px] text-gray-400">{vol.fileSize}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDownloadVolume(vol)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1 shrink-0"
                    >
                      <Download className="w-3 h-3" />
                      <span>ڈاؤن لوڈ</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
