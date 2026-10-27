import React, { useState } from 'react';
import {
  Shield,
  Save,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  AlertCircle,
  FileText,
  Layers,
  ArrowRight,
  Eye,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { Volume } from '../types';
import { fetchArchiveItemInfo, extractArchiveId } from '../utils/archiveHelper';
import { savePdfToStorage } from '../utils/pdfStorage';
import { loadPdfDocument, generateFirstPageThumbnail } from '../utils/pdfRenderer';

interface AdminPanelProps {
  volumes: Volume[];
  onSaveVolumes: (updatedVolumes: Volume[]) => void;
  onResetToDefaults: () => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  volumes,
  onSaveVolumes,
  onResetToDefaults,
  onClose,
}) => {
  // Passcode gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // start unlocked for convenience
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Active volume selection (1 to 12)
  const [selectedVolId, setSelectedVolId] = useState<number>(1);
  const [activeVolumes, setActiveVolumes] = useState<Volume[]>(volumes);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchSuccessMsg, setFetchSuccessMsg] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const currentVolume =
    activeVolumes.find((v) => v.id === selectedVolId) || activeVolumes[0];

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === 'admin') {
      setIsAuthenticated(true);
      setPinError(null);
    } else {
      setPinError('غلط پاس کوڈ! ڈیفالٹ پن 1234 ہے');
    }
  };

  const updateCurrentVolume = (fields: Partial<Volume>) => {
    setActiveVolumes((prev) =>
      prev.map((vol) => (vol.id === selectedVolId ? { ...vol, ...fields } : vol))
    );
  };

  // Auto-Fetch from Archive.org
  const handleAutoFetch = async () => {
    if (!currentVolume.archiveUrl && !currentVolume.archiveId) {
      alert('براہ کرم پہلے آرکائیو لنک یا آئی ڈی درج کریں!');
      return;
    }

    const input = currentVolume.archiveUrl || currentVolume.archiveId;
    setIsFetching(true);
    setFetchSuccessMsg(null);

    try {
      const info = await fetchArchiveItemInfo(input);

      updateCurrentVolume({
        archiveId: info.identifier,
        archiveUrl: info.detailsUrl,
        pdfUrl: info.pdfUrl || currentVolume.pdfUrl,
        coverImage: info.coverImage || currentVolume.coverImage,
        fileSize: info.itemSize || currentVolume.fileSize,
      });

      setFetchSuccessMsg(`آرکائیو سے ڈیٹا اور سرورق کامیابی سے فیچ ہو گیا! (آئی ڈی: ${info.identifier})`);
      setTimeout(() => setFetchSuccessMsg(null), 4000);
    } catch {
      alert('آرکائیو سے ڈیٹا حاصل کرنے میں دشواری پیش آئی۔ لنک کی تصدیق کریں۔');
    } finally {
      setIsFetching(false);
    }
  };

  // Upload PDF directly from device
  const handleDirectPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsFetching(true);
    setFetchSuccessMsg(null);

    try {
      await savePdfToStorage(selectedVolId, file);
      const doc = await loadPdfDocument(file);
      const thumb = await generateFirstPageThumbnail(doc);
      const mb = (file.size / (1024 * 1024)).toFixed(1);

      updateCurrentVolume({
        totalPages: doc.numPages,
        coverImage: thumb || currentVolume.coverImage,
        fileSize: `${mb} MB`,
        hasLocalPdf: true,
        isDownloaded: true,
      });

      setFetchSuccessMsg(`پی ڈی ایف فائل (${file.name}) کامیابی سے منسلک ہو گئی! کل صفحات: ${doc.numPages}`);
      setTimeout(() => setFetchSuccessMsg(null), 5000);
    } catch {
      alert('پی ڈی ایف فائل پڑھنے میں خرابی پیش آئی۔ براہ کرم درست فائل منتخب کریں۔');
    } finally {
      setIsFetching(false);
      e.target.value = '';
    }
  };

  // Save changes
  const handleSave = () => {
    onSaveVolumes(activeVolumes);
    setSaveSuccessMsg('تمام تبدیلیاں کامیابی سے محفوظ ہو گئیں اور ایپ پر نافذ ہو چکی ہیں!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Export JSON Backup
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeVolumes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'ihtisab-e-nasbiyat-volumes-backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveVolumes(parsed);
          onSaveVolumes(parsed);
          alert('بیک اپ فائل کامیابی سے امپورٹ ہو گئی!');
        } else {
          alert('فائل کا فارمیٹ درست نہیں ہے!');
        }
      } catch {
        alert('فائل پڑھنے میں غلطی ہوئی!');
      }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md text-white" dir="rtl">
        <form
          onSubmit={handlePinSubmit}
          className="w-full max-w-sm bg-[#092218] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mx-auto flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold font-nastaliq text-amber-300 mb-1">
            ایڈمن پینل لاگ ان
          </h2>
          <p className="text-xs text-gray-300 mb-6 font-arabic">
            جلدوں کی ترتیبات اور لنکس تبدیل کرنے کے لیے سیکیورٹی پاس کوڈ درج کریں:
          </p>

          <input
            type="password"
            placeholder="ڈیفالٹ پن: 1234"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full text-center text-xl font-mono py-2.5 px-4 rounded-xl bg-black/40 border border-amber-500/40 text-amber-300 focus:outline-none focus:border-amber-400 mb-3"
            autoFocus
          />

          {pinError && (
            <p className="text-xs text-rose-400 mb-4 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{pinError}</span>
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition"
            >
              داخل ہوں
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 text-gray-300 font-semibold text-sm hover:text-white"
            >
              واپس جائیں
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#05170f] text-white overflow-hidden select-none" dir="rtl">
      {/* Top Header */}
      <header className="shrink-0 h-16 px-4 sm:px-8 bg-[#082419] border-b border-amber-500/30 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-amber-400 border border-amber-500/20 transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowRight className="w-4 h-4" />
            <span>ایپ میں واپس</span>
          </button>

          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h1 className="text-base sm:text-lg font-bold font-nastaliq text-amber-300">
              بیک اینڈ ایڈمن پینل (۱۲ جلدیں مینیجر)
            </h1>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>تبدیلیاں محفوظ کریں</span>
          </button>
        </div>
      </header>

      {/* Notifications */}
      {saveSuccessMsg && (
        <div className="bg-emerald-600 text-white font-bold text-xs py-2 px-4 text-center shadow-md animate-fade-in flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Body Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left/Sidebar: 12 Volumes Selector */}
        <aside className="w-full md:w-64 bg-[#061e14] border-l border-amber-500/20 p-3 overflow-y-auto shrink-0 flex md:flex-col gap-2">
          <div className="text-xs text-amber-400/80 font-bold px-2 py-1 hidden md:block">
            جلد منتخب کریں:
          </div>
          {activeVolumes.map((vol) => {
            const isSelected = vol.id === selectedVolId;
            return (
              <button
                key={vol.id}
                onClick={() => setSelectedVolId(vol.id)}
                className={`w-full text-right p-2.5 rounded-xl border transition flex items-center justify-between text-xs font-medium shrink-0 md:shrink ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                    : 'bg-black/20 text-gray-300 hover:bg-black/40 border-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                      isSelected ? 'bg-slate-950 text-amber-400' : 'bg-black/40 text-amber-300'
                    }`}
                  >
                    {vol.id}
                  </span>
                  <span className="font-nastaliq line-clamp-1">{vol.volumeNumber}</span>
                </div>
                {vol.isDownloaded && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}

          {/* Backup & Restore Controls */}
          <div className="mt-auto pt-4 border-t border-white/10 space-y-2 hidden md:block">
            <button
              onClick={handleExportJson}
              className="w-full py-1.5 px-2 rounded-lg bg-black/40 text-gray-300 hover:text-white border border-white/10 text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ڈیٹا ایکسپورٹ (JSON)</span>
            </button>

            <label className="w-full py-1.5 px-2 rounded-lg bg-black/40 text-gray-300 hover:text-white border border-white/10 text-xs flex items-center justify-center gap-1.5 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>ڈیٹا امپورٹ (JSON)</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>

            <button
              onClick={() => {
                if (confirm('کیا آپ واقعی تمام ترتیبات کو اصل حالت پر بحال کرنا چاہتے ہیں؟')) {
                  onResetToDefaults();
                  alert('تمام جلدیں ڈیفالٹ حالت پر بحال ہو گئیں۔');
                }
              }}
              className="w-full py-1.5 px-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>اصل حالت پر بحال کریں</span>
            </button>
          </div>
        </aside>

        {/* Right Area: Form & Live Preview */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header of selected volume */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/30 p-4 rounded-2xl border border-amber-500/20">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs font-nastaliq">
                  {currentVolume.volumeNumber} (جلد {currentVolume.id})
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white font-nastaliq">
                  {currentVolume.title}
                </h2>
              </div>

              {currentVolume.archiveUrl && (
                <a
                  href={currentVolume.archiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>آرکائیو صفحہ ملاحظہ کریں</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* ================= AUTO-FETCH TOOL BOX ================= */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0a291d] to-[#061f15] border-2 border-emerald-500/40 shadow-xl">
              <div className="flex items-center gap-2 mb-2 text-emerald-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>آرکائیو لنک سے خودکار فیچر (Auto-Fetch Thumbnail & PDF)</span>
              </div>
              <p className="text-xs text-gray-300 mb-4 font-arabic">
                یہاں آرکائیو کا لنک (مثلاً: <code className="text-amber-300">https://archive.org/details/ihtisab-e-nasbiyat-vol-01</code>) یا صرف آئی ڈی درج کریں اور بٹن دبائیں۔ سسٹم خودکار طور پر سرورق کی تصویر، پی ڈی ایف لنک اور سائز حاصل کر کے فارم میں بھر دے گا۔
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <input
                    type="text"
                    placeholder="https://archive.org/details/... یا Archive Item ID"
                    value={currentVolume.archiveUrl || currentVolume.archiveId}
                    onChange={(e) =>
                      updateCurrentVolume({
                        archiveUrl: e.target.value,
                        archiveId: extractArchiveId(e.target.value),
                      })
                    }
                    className="w-full bg-black/60 border border-emerald-500/40 rounded-xl pr-10 pl-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAutoFetch}
                  disabled={isFetching}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isFetching ? 'فیچ ہو رہا ہے...' : 'خودکار فیچ کریں'}</span>
                </button>
              </div>

              {fetchSuccessMsg && (
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-600/30 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{fetchSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* ================= DIRECT PDF UPLOAD BOX ================= */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0a202d] to-[#081822] border-2 border-blue-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white font-nastaliq">
                    موبائل یا کمپیوٹر سے اصل پی ڈی ایف (PDF) اپلوڈ کریں
                  </h4>
                  <p className="text-xs text-blue-200/70 font-arabic mt-0.5">
                    فائل منتخب کرنے پر پہلا صفحہ خودکار سرورق بن جائے گا اور کل صفحات کا شمار خودکار اپ ڈیٹ ہو جائے گا۔
                  </p>
                </div>
              </div>

              <label className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0">
                <Upload className="w-4 h-4" />
                <span>پی ڈی ایف فائل منتخب کریں</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleDirectPdfUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* ================= EDITING FORM ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Volume Title */}
              <div>
                <label className="block text-xs text-amber-300 font-semibold mb-1">
                  جلد کا مکمل عنوان:
                </label>
                <input
                  type="text"
                  value={currentVolume.title}
                  onChange={(e) => updateCurrentVolume({ title: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-nastaliq text-base"
                />
              </div>

              {/* Volume Subtitle */}
              <div>
                <label className="block text-xs text-amber-300 font-semibold mb-1">
                  ذیلی عنوان / خلاصہ:
                </label>
                <input
                  type="text"
                  value={currentVolume.subtitle}
                  onChange={(e) => updateCurrentVolume({ subtitle: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-arabic"
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs text-amber-300 font-semibold mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>سرورق تصویر کا لنک (Cover Image URL):</span>
                </label>
                <input
                  type="text"
                  value={currentVolume.coverImage}
                  onChange={(e) => updateCurrentVolume({ coverImage: e.target.value })}
                  placeholder="/logo.png یا https://archive.org/services/img/..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              {/* Direct PDF Link */}
              <div>
                <label className="block text-xs text-amber-300 font-semibold mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>پی ڈی ایف ڈائریکٹ ڈاؤن لوڈ لنک (PDF URL):</span>
                </label>
                <input
                  type="text"
                  value={currentVolume.pdfUrl}
                  onChange={(e) => updateCurrentVolume({ pdfUrl: e.target.value })}
                  placeholder="https://archive.org/download/.../file.pdf"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              {/* Pages & Size */}
              <div>
                <label className="block text-xs text-amber-300 font-semibold mb-1">
                  کل صفحات (Total Pages):
                </label>
                <input
                  type="number"
                  value={currentVolume.totalPages}
                  onChange={(e) => updateCurrentVolume({ totalPages: parseInt(e.target.value, 10) || 100 })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-amber-300 font-semibold mb-1">
                  فائل سائز (File Size):
                </label>
                <input
                  type="text"
                  value={currentVolume.fileSize}
                  onChange={(e) => updateCurrentVolume({ fileSize: e.target.value })}
                  placeholder="مثال: 45.2 MB"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs text-amber-300 font-semibold mb-1">
                  تفصیلی تعارف (Description):
                </label>
                <textarea
                  rows={3}
                  value={currentVolume.description}
                  onChange={(e) => updateCurrentVolume({ description: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-amber-400 focus:outline-none leading-relaxed font-arabic"
                />
              </div>
            </div>

            {/* ================= LIVE CARD PREVIEW ================= */}
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>لائیو کارڈ پریویو (ایپ میں کیسا نظر آئے گا):</span>
              </h4>

              <div className="max-w-sm bg-gradient-to-b from-[#0b241b] to-[#071a13] rounded-2xl border-2 border-amber-500/40 p-4 shadow-xl flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={currentVolume.coverImage || '/logo.png'}
                    alt="سرورق"
                    className="w-20 h-24 object-contain rounded-xl border border-amber-500/40 shadow-lg bg-black/40"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px]">
                    {currentVolume.volumeNumberEn}
                  </span>
                </div>

                <div className="flex-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                    {currentVolume.volumeNumber}
                  </span>
                  <h5 className="text-sm font-bold text-white font-nastaliq line-clamp-1 mt-1">
                    {currentVolume.title}
                  </h5>
                  <p className="text-xs text-gray-300 line-clamp-1 mt-0.5 font-arabic">
                    {currentVolume.subtitle}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-2">
                    <span>{currentVolume.totalPages} صفحات</span>
                    <span>•</span>
                    <span>{currentVolume.fileSize}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-black/40 text-gray-300 hover:text-white border border-white/10 text-xs font-bold transition"
              >
                بند کریں
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>تبدیلیاں محفوظ کریں</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
