import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Download,
  Share2,
  Clock,
  Layers,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  Shield,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Volume } from '../types';

interface HomeViewProps {
  volumes: Volume[];
  onSelectVolume: (volume: Volume, page?: number) => void;
  onDownloadVolume: (volume: Volume) => void;
  lastReadVolumeId: number | null;
  lastReadPage: number | null;
  onOpenAdmin: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  volumes,
  onSelectVolume,
  onDownloadVolume,
  lastReadVolumeId,
  lastReadPage,
  onOpenAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<'all' | '1-6' | '7-12' | 'downloaded'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedVolumeId, setExpandedVolumeId] = useState<number | null>(null);

  // Filter volumes
  const filteredVolumes = useMemo(() => {
    return volumes.filter((vol) => {
      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        vol.title.toLowerCase().includes(query) ||
        vol.subtitle.toLowerCase().includes(query) ||
        vol.volumeNumber.toLowerCase().includes(query) ||
        vol.volumeNumberEn.toLowerCase().includes(query) ||
        vol.description.toLowerCase().includes(query) ||
        vol.chapters.some((c) => c.title.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Group filter
      if (filterGroup === '1-6') return vol.id >= 1 && vol.id <= 6;
      if (filterGroup === '7-12') return vol.id >= 7 && vol.id <= 12;
      if (filterGroup === 'downloaded') return vol.isDownloaded;
      return true;
    });
  }, [volumes, searchQuery, filterGroup]);

  // Last read volume object
  const lastReadVolume = useMemo(() => {
    if (!lastReadVolumeId) return null;
    return volumes.find((v) => v.id === lastReadVolumeId) || null;
  }, [volumes, lastReadVolumeId]);

  const handleShare = async (vol: Volume) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `احتساب ناصبیت — ${vol.volumeNumber}`,
          text: `${vol.title}\n${vol.subtitle}`,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(
        `کتاب: احتساب ناصبیت (${vol.volumeNumber}: ${vol.title})\nمطالعہ کریں: ${vol.archiveUrl}`
      );
      alert('کتاب کا لنک اور تفصیل کاپی ہو گئی ہے!');
    }
  };

  return (
    <div className="min-h-screen pb-24 text-white" dir="rtl">
      {/* ================= HERO HEADER ================= */}
      <header className="relative bg-gradient-to-b from-[#041a11] via-[#08291c] to-[#0b1f16] pt-6 pb-8 px-4 sm:px-8 border-b border-amber-500/20 overflow-hidden">
        {/* Islamic Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4 text-center sm:text-right">
              <div className="relative group shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-0.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-xl overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="احتساب ناصبیت لوگو"
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                </div>
                <span className="absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded-full bg-emerald-600 text-[10px] font-bold text-white border border-emerald-400">
                  ۱۲ جلدیں
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 font-nastaliq leading-relaxed">
                  احتساب ناصبیت
                </h1>
                <p className="text-xs sm:text-sm text-amber-200/90 font-arabic font-medium mt-0.5">
                  دفاع صحابہ کرامؓ و دفاع اہل بیت اطہارؑ — مکمل بارہ جلدیں
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    انٹرنل اردو ریڈر مع سوائپ و سکرول
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Admin & Stats */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAdmin}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="ایڈمن پینل کھولیں"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>ایڈمن پینل</span>
              </button>
            </div>
          </div>

          {/* ================= SEARCH & CONTROLS ================= */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 items-stretch">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80 pointer-events-none" />
              <input
                type="text"
                placeholder="جلد نمبر یا کسی بھی عنوان سے تلاش کریں..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#03150d]/80 border border-amber-500/30 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-amber-200/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition font-arabic"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs px-1.5 py-0.5 rounded-full bg-white/10"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 self-end sm:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs transition ${
                  viewMode === 'grid'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="گرڈ ویو"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs transition ${
                  viewMode === 'list'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="لسٹ ویو"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterGroup('all')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition border ${
                filterGroup === 'all'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                  : 'bg-black/30 text-gray-300 border-white/10 hover:border-amber-500/30'
              }`}
            >
              تمام ۱۲ جلدیں ({volumes.length})
            </button>
            <button
              onClick={() => setFilterGroup('1-6')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition border ${
                filterGroup === '1-6'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                  : 'bg-black/30 text-gray-300 border-white/10 hover:border-amber-500/30'
              }`}
            >
              جلد ۱ تا ۶
            </button>
            <button
              onClick={() => setFilterGroup('7-12')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition border ${
                filterGroup === '7-12'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                  : 'bg-black/30 text-gray-300 border-white/10 hover:border-amber-500/30'
              }`}
            >
              جلد ۷ تا ۱۲
            </button>
            <button
              onClick={() => setFilterGroup('downloaded')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition border flex items-center gap-1 ${
                filterGroup === 'downloaded'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                  : 'bg-black/30 text-gray-300 border-white/10 hover:border-amber-500/30'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ڈاؤن لوڈ شدہ ({volumes.filter((v) => v.isDownloaded).length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= BODY WRAPPER ================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-6">
        {/* ================= CONTINUE READING BANNER ================= */}
        {lastReadVolume && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-900/60 via-[#0d3123] to-[#082218] border border-amber-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-amber-300 font-bold tracking-wide uppercase">
                  مطالعہ جاری رکھیں
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                  {lastReadVolume.volumeNumber}: {lastReadVolume.title}
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  آخری مطالعہ شدہ صفحہ: {lastReadPage || 1} از {lastReadVolume.totalPages}
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectVolume(lastReadVolume, lastReadPage || 1)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>پڑھنا شروع کریں</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search Results Count */}
        {searchQuery && (
          <div className="mb-4 text-xs text-amber-300/80 flex items-center justify-between">
            <span>
              &quot;{searchQuery}&quot; کے نتائج: {filteredVolumes.length} جلدیں ملیں
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="underline text-gray-400 hover:text-white"
            >
              تلاش ختم کریں
            </button>
          </div>
        )}

        {/* Empty Search State */}
        {filteredVolumes.length === 0 && (
          <div className="text-center py-16 px-4 bg-black/20 rounded-2xl border border-white/5 my-6">
            <Layers className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
            <h3 className="text-base font-bold text-amber-300 font-nastaliq mb-1">
              کوئی جلد نہیں ملی
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              تلاش کردہ لفظ کے مطابق کوئی جلد دستیاب نہیں ہے۔ براہ کرم الفاظ تبدیل کر کے کوشش کریں۔
            </p>
          </div>
        )}

        {/* ================= VOLUMES LIST / GRID ================= */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVolumes.map((vol) => {
              const isExpanded = expandedVolumeId === vol.id;

              return (
                <div
                  key={vol.id}
                  className="group relative bg-gradient-to-b from-[#0b241b] to-[#071a13] rounded-2xl border border-amber-500/20 hover:border-amber-400/50 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Cover Banner */}
                  <div className="relative h-44 bg-[#03130c] overflow-hidden p-3 flex items-center justify-center border-b border-white/5">
                    {/* Background Soft Glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10" />

                    {/* Book Thumbnail */}
                    <img
                      src={vol.coverImage || '/logo.png'}
                      alt={vol.title}
                      className="w-28 h-36 object-contain rounded-xl shadow-2xl z-10 border border-amber-500/30 group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Volume Number Ribbon Badge */}
                    <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-md border border-amber-300/50">
                      {vol.volumeNumber}
                    </div>

                    {/* Downloaded Badge */}
                    {vol.isDownloaded && (
                      <div className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white font-bold text-[10px] flex items-center gap-1 shadow">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>محفوظ</span>
                      </div>
                    )}
                  </div>

                  {/* Volume Meta & Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-amber-300 font-nastaliq leading-relaxed line-clamp-1 mb-1">
                        {vol.title}
                      </h3>
                      <p className="text-xs text-amber-100/70 line-clamp-2 leading-relaxed mb-3">
                        {vol.subtitle}
                      </p>

                      {/* Info badges */}
                      <div className="flex items-center gap-2 text-[11px] text-gray-300 mb-3">
                        <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10">
                          {vol.totalPages} صفحات
                        </span>
                        <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10">
                          {vol.fileSize}
                        </span>
                      </div>
                    </div>

                    {/* Chapter Topics Accordion */}
                    <div className="border-t border-white/10 pt-3">
                      <button
                        onClick={() => setExpandedVolumeId(isExpanded ? null : vol.id)}
                        className="w-full flex items-center justify-between text-xs text-amber-400/80 hover:text-amber-300 font-medium py-1"
                      >
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          <span>فہرست مضامین ({vol.chapters.length})</span>
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {vol.chapters.map((ch) => (
                            <button
                              key={ch.id}
                              onClick={() => onSelectVolume(vol, ch.pageNumber)}
                              className="w-full text-right p-1.5 rounded-lg bg-black/30 hover:bg-amber-500/20 text-xs text-gray-300 hover:text-amber-300 flex items-center justify-between transition"
                            >
                              <span className="font-nastaliq line-clamp-1">{ch.title}</span>
                              <span className="text-[10px] text-amber-400 font-mono">
                                ص {ch.pageNumber}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                      <button
                        onClick={() => onSelectVolume(vol, 1)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>مطالعہ کریں</span>
                      </button>

                      <button
                        onClick={() => onDownloadVolume(vol)}
                        className="p-2.5 rounded-xl bg-black/30 hover:bg-black/50 text-emerald-400 border border-emerald-500/20 transition"
                        title="پی ڈی ایف ڈاؤن لوڈ کریں"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleShare(vol)}
                        className="p-2.5 rounded-xl bg-black/30 hover:bg-black/50 text-gray-300 hover:text-amber-300 border border-white/10 transition"
                        title="شیئر کریں"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= LIST VIEW ================= */
          <div className="space-y-4">
            {filteredVolumes.map((vol) => (
              <div
                key={vol.id}
                className="bg-gradient-to-r from-[#0b241b] to-[#071a13] p-4 rounded-2xl border border-amber-500/20 hover:border-amber-400/50 transition shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative shrink-0">
                    <img
                      src={vol.coverImage || '/logo.png'}
                      alt={vol.title}
                      className="w-16 h-20 object-contain rounded-lg shadow-md border border-amber-500/30"
                    />
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[9px]">
                      {vol.id}
                    </span>
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
                    <p className="text-xs text-gray-300 line-clamp-1 mt-1 font-arabic">
                      {vol.subtitle}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2">
                      <span>{vol.totalPages} صفحات</span>
                      <span>•</span>
                      <span>سائز: {vol.fileSize}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                  <button
                    onClick={() => onSelectVolume(vol, 1)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>مطالعہ</span>
                  </button>
                  <button
                    onClick={() => onDownloadVolume(vol)}
                    className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-emerald-400 border border-emerald-500/20 transition"
                    title="ڈاؤن لوڈ"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
