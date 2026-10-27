import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  Bookmark as BookmarkIcon,
  Download,
  Maximize2,
  Minimize2,
  List,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Moon,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Sliders,
  Upload,
  AlertCircle,
  Loader2,
  FileText,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Volume, Bookmark } from '../types';
import {
  loadPdfDocument,
  renderPageToCanvas,
  generateFirstPageThumbnail,
  PDFDocumentProxy,
} from '../utils/pdfRenderer';
import { getPdfFromStorage, savePdfToStorage } from '../utils/pdfStorage';

interface InternalReaderProps {
  volume: Volume;
  initialPage?: number;
  onClose: () => void;
  onBookmarkAdd: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  isBookmarked: boolean;
  onDownload: (volume: Volume) => void;
  onUpdateLastPage?: (volumeId: number, page: number) => void;
  onVolumePdfUpdated?: (volumeId: number, newTotalPages: number, coverImage?: string) => void;
}

export const InternalReader: React.FC<InternalReaderProps> = ({
  volume,
  initialPage = 1,
  onClose,
  onBookmarkAdd,
  isBookmarked,
  onDownload,
  onUpdateLastPage,
  onVolumePdfUpdated,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage || 1);
  const [totalPages, setTotalPages] = useState<number>(volume.totalPages || 450);
  const [mode, setMode] = useState<'swipe' | 'scroll'>('swipe');
  const [theme, setTheme] = useState<'emerald' | 'sepia' | 'dark' | 'light'>('emerald');
  const [zoom, setZoom] = useState<number>(1);
  const [showToc, setShowToc] = useState<boolean>(false);
  const [showPageJump, setShowPageJump] = useState<boolean>(false);
  const [jumpPageInput, setJumpPageInput] = useState<string>(String(initialPage || 1));
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pageTurnAnim, setPageTurnAnim] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // PDF Engine State
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(true);
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);
  const [useFallbackText, setUseFallbackText] = useState<boolean>(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync last read page safely
  const onUpdateLastPageRef = useRef(onUpdateLastPage);
  onUpdateLastPageRef.current = onUpdateLastPage;

  const prevReportedPage = useRef<number>(initialPage);
  useEffect(() => {
    if (currentPage !== prevReportedPage.current) {
      prevReportedPage.current = currentPage;
      onUpdateLastPageRef.current?.(volume.id, currentPage);
    }
  }, [currentPage, volume.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load PDF from Storage or URL
  const loadBookPdf = useCallback(async () => {
    setIsLoadingPdf(true);
    setPdfLoadError(null);
    setUseFallbackText(false);

    try {
      // 1. First check local IndexedDB
      const localBlob = await getPdfFromStorage(volume.id);
      if (localBlob) {
        const doc = await loadPdfDocument(localBlob);
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setIsLoadingPdf(false);
        showToast('مقامی محفوظ شدہ کتاب کامیابی سے کھل گئی!');
        return;
      }

      // 2. If no local blob, check if pdfUrl is configured
      if (volume.pdfUrl && volume.pdfUrl.startsWith('http')) {
        const doc = await loadPdfDocument(volume.pdfUrl);
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setIsLoadingPdf(false);
        showToast('آن لائن کتاب کامیابی سے لوڈ ہو گئی!');
        return;
      }

      // 3. No local PDF and no valid URL
      setPdfLoadError('اس جلد کی پی ڈی ایف فائل ابھی اپلوڈ نہیں کی گئی ہے۔ براہ کرم نیچے دیے گئے بٹن سے اپنے موبائل یا کمپیوٹر سے پی ڈی ایف فائل منتخب کریں۔');
      setIsLoadingPdf(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn('PDF load warning:', errorMsg);
      setPdfLoadError(
        'آن لائن پی ڈی ایف لوڈ کرنے میں نیٹ ورک یا سیکیورٹی کی رکاوٹ ہے۔ آپ براہ راست اپنے ڈیوائس سے پی ڈی ایف فائل اپلوڈ کر کے فوراً پڑھ سکتے ہیں۔'
      );
      setIsLoadingPdf(false);
    }
  }, [volume.id, volume.pdfUrl]);

  useEffect(() => {
    loadBookPdf();
  }, [loadBookPdf]);

  // Handle direct file upload from user device
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('براہ کرم درست پی ڈی ایف (.pdf) فائل منتخب کریں!');
      return;
    }

    setIsLoadingPdf(true);
    setPdfLoadError(null);

    try {
      // Save into IndexedDB for persistent offline reading
      await savePdfToStorage(volume.id, file);

      // Load document into PDF.js
      const doc = await loadPdfDocument(file);
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);

      // Extract thumbnail of first page for cover preview
      const thumb = await generateFirstPageThumbnail(doc);
      if (onVolumePdfUpdated) {
        onVolumePdfUpdated(volume.id, doc.numPages, thumb || undefined);
      }

      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#10B981', '#3B82F6'],
        });
      } catch {
        // ignore
      }

      setIsLoadingPdf(false);
      showToast(`کتاب کامیابی سے اپلوڈ ہو گئی! (کل صفحات: ${doc.numPages})`);
    } catch (err) {
      console.error('File upload error:', err);
      alert('پی ڈی ایف فائل پڑھنے میں خرابی پیش آئی۔ فائل کی تصدیق کریں۔');
      setIsLoadingPdf(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Render current page onto canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || mode !== 'swipe') return;

    let isMounted = true;
    setIsRenderingPage(true);

    renderPageToCanvas(pdfDoc, currentPage, canvasRef.current, zoom)
      .catch((err) => {
        if (isMounted) {
          console.error('Canvas render error:', err);
        }
      })
      .finally(() => {
        if (isMounted) setIsRenderingPage(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, currentPage, zoom, mode]);

  // Page Turn Actions
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setPageTurnAnim('page-turn-left');
      setCurrentPage((prev) => prev + 1);
      setTimeout(() => setPageTurnAnim(''), 350);
    } else {
      showToast('یہ اس جلد کا آخری صفحہ ہے');
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setPageTurnAnim('page-turn-right');
      setCurrentPage((prev) => prev - 1);
      setTimeout(() => setPageTurnAnim(''), 350);
    } else {
      showToast('یہ اس جلد کا پہلا صفحہ ہے');
    }
  }, [currentPage]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (mode !== 'swipe') return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) goToNextPage();
      else goToPrevPage();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPageJump || showToc) return;
      if (e.key === 'ArrowLeft') goToNextPage();
      else if (e.key === 'ArrowRight') goToPrevPage();
      else if (e.key === 'Escape') {
        if (showToc) setShowToc(false);
        else if (showPageJump) setShowPageJump(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPrevPage, showPageJump, showToc]);

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      setShowPageJump(false);
      showToast(`صفحہ ${p} پر منتقل ہو گئے`);
    } else {
      showToast(`براہ کرم 1 سے ${totalPages} کے درمیان صفحہ درج کریں`);
    }
  };

  const handleAddBookmark = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D4AF37', '#10B981', '#F59E0B'],
      });
    } catch {
      // ignore
    }
    onBookmarkAdd({
      volumeId: volume.id,
      volumeNumber: volume.volumeNumber,
      volumeTitle: volume.title,
      pageNumber: currentPage,
      title: `${volume.volumeNumber} — صفحہ ${currentPage}`,
      note: `جلد: ${volume.title}`,
    });
    showToast(`صفحہ ${currentPage} بک مارک میں محفوظ ہو گیا!`);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Theme styles
  const themeStyles = {
    emerald: {
      bg: 'bg-[#061811]',
      paper: 'bg-[#0a2419] text-[#f4eee2] border-[#1d4d38]',
      header: 'bg-[#092218]/95 border-[#1c4b37]',
      accent: 'text-amber-400',
      footer: 'bg-[#092218]/95 border-[#1c4b37]',
    },
    sepia: {
      bg: 'bg-[#2b241b]',
      paper: 'bg-[#fbf0d9] text-[#2c2217] border-[#d8c59f]',
      header: 'bg-[#3d3224]/95 border-[#574732]',
      accent: 'text-amber-700',
      footer: 'bg-[#3d3224]/95 border-[#574732]',
    },
    dark: {
      bg: 'bg-[#0a0a0a]',
      paper: 'bg-[#171717] text-[#e5e5e5] border-[#2e2e2e]',
      header: 'bg-[#141414]/95 border-[#2e2e2e]',
      accent: 'text-amber-400',
      footer: 'bg-[#141414]/95 border-[#2e2e2e]',
    },
    light: {
      bg: 'bg-[#f1f5f9]',
      paper: 'bg-white text-gray-900 border-gray-300 shadow-xl',
      header: 'bg-slate-900 text-white border-slate-800',
      accent: 'text-amber-500',
      footer: 'bg-slate-900 text-white border-slate-800',
    },
  }[theme];

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col ${themeStyles.bg} select-none transition-colors duration-300`}
      dir="rtl"
    >
      {/* Hidden File Input for PDF Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-4 py-2 rounded-full shadow-2xl text-xs sm:text-sm flex items-center gap-2 animate-bounce border border-amber-300">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= TOP NAVIGATION BAR ================= */}
      <header
        className={`shrink-0 h-16 px-3 sm:px-6 flex items-center justify-between border-b ${themeStyles.header} backdrop-blur-md z-30 transition-colors`}
      >
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-amber-400 hover:text-amber-300 transition flex items-center gap-1.5 text-xs sm:text-sm font-semibold border border-amber-500/20"
            title="فہرست میں واپس جائیں"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">واپس</span>
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {volume.volumeNumber}
              </span>
              <h2 className="text-xs sm:text-base font-bold text-white line-clamp-1 max-w-[160px] sm:max-w-md">
                {volume.title}
              </h2>
            </div>
            <span className="text-[11px] text-amber-200/70 line-clamp-1 hidden sm:inline font-arabic">
              {pdfDoc ? `حقیقی پی ڈی ایف • صفحہ ${currentPage} از ${totalPages}` : volume.subtitle}
            </span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Upload PDF Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow transition"
            title="اپنے ڈیوائس سے پی ڈی ایف اپلوڈ یا تبدیل کریں"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden md:inline">پی ڈی ایف اپلوڈ</span>
          </button>

          {/* Mode Switcher */}
          <button
            onClick={() => setMode(mode === 'swipe' ? 'scroll' : 'swipe')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-black/20 hover:bg-black/40 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition"
            title="ریڈر کا طریقہ تبدیل کریں"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">
              {mode === 'swipe' ? 'سوائپ موڈ' : 'سکرول موڈ'}
            </span>
          </button>

          {/* Table of Contents Button */}
          <button
            onClick={() => setShowToc(!showToc)}
            className={`p-2 rounded-lg text-xs font-medium transition ${
              showToc
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-black/20 text-gray-200 hover:text-amber-300 border border-white/10'
            }`}
            title="فہرست مضامین"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleAddBookmark}
            className={`p-2 rounded-lg transition ${
              isBookmarked
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-black/20 text-gray-200 hover:text-amber-400 border border-white/10'
            }`}
            title="صفحہ بک مارک کریں"
          >
            <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Settings Drawer Button */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="p-2 rounded-lg bg-black/20 text-gray-200 hover:text-amber-400 border border-white/10 transition"
            title="ترتیبات و تھیم"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-black/20 text-gray-300 hover:text-white border border-white/10 transition hidden sm:flex"
            title="پوری سکرین"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ================= MAIN READING CANVAS AREA ================= */}
      <main
        className="flex-1 overflow-auto relative flex flex-col items-center justify-start p-2 sm:p-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* State 1: Loading PDF */}
        {isLoadingPdf && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-amber-300 font-nastaliq mb-1">
              کتاب کھولی جا رہی ہے...
            </h3>
            <p className="text-xs text-gray-300 max-w-xs font-arabic">
              پی ڈی ایف کے صفحات تیار ہو رہے ہیں، براہ کرم چند لمحے انتظار فرمائیں۔
            </p>
          </div>
        )}

        {/* State 2: PDF Load Error / Missing File -> Upload Prompt */}
        {!isLoadingPdf && !pdfDoc && !useFallbackText && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto text-center">
            <div className="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 mb-5 shadow-2xl">
              <FileText className="w-16 h-16 mx-auto mb-2 text-amber-400" />
              <h3 className="text-xl font-bold font-nastaliq text-amber-300 mb-2">
                کتاب کی پی ڈی ایف (PDF) منتخب کریں
              </h3>
              <p className="text-xs text-gray-200 leading-relaxed font-arabic mb-4">
                {pdfLoadError || 'اس جلد کی پی ڈی ایف فائل اب تک منسلک نہیں ہوئی۔ آپ اپنے موبائل یا کمپیوٹر سے اپنی ڈاؤن لوڈ شدہ کتاب منتخب کر کے فوراً انٹرنل ریڈر میں کھول سکتے ہیں۔'}
              </p>

              {/* Upload Action */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-sm shadow-xl transition flex items-center justify-center gap-2 mb-3"
              >
                <Upload className="w-5 h-5" />
                <span>اپنے ڈیوائس سے پی ڈی ایف فائل منتخب کریں</span>
              </button>

              {/* Retry / Fallback options */}
              <div className="flex gap-2">
                <button
                  onClick={loadBookPdf}
                  className="flex-1 py-2 px-3 rounded-xl bg-black/40 hover:bg-black/60 text-xs text-amber-300 border border-white/10 transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>دوبارہ کوشش کریں</span>
                </button>

                <button
                  onClick={() => setUseFallbackText(true)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-700/40 hover:bg-emerald-700/60 text-xs text-emerald-300 border border-emerald-500/30 transition flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>متنی نمونہ مطالعہ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Real PDF Rendering Active */}
        {!isLoadingPdf && pdfDoc && (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            {/* Swipe Controls Left & Right buttons */}
            {mode === 'swipe' && (
              <>
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage <= 1}
                  className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center bg-black/60 hover:bg-black/90 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-2xl transition disabled:opacity-20 disabled:pointer-events-none"
                  title="پچھلا صفحہ"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages}
                  className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center bg-black/60 hover:bg-black/90 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-2xl transition disabled:opacity-20 disabled:pointer-events-none"
                  title="اگلا صفحہ"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Page Rendering Container */}
            <div
              className={`max-w-4xl max-h-[82vh] overflow-auto flex flex-col items-center p-2 rounded-2xl shadow-2xl border-2 transition-transform duration-200 ${themeStyles.paper} ${pageTurnAnim}`}
            >
              {isRenderingPage && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/70 text-amber-300 text-xs px-3 py-1.5 rounded-full backdrop-blur-md">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>صفحہ بن رہا ہے...</span>
                </div>
              )}

              {/* The HTML5 Canvas for real PDF Rendering */}
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-lg shadow-md block bg-white"
              />
            </div>
          </div>
        )}

        {/* State 4: Fallback Text Mode if user explicitly toggled */}
        {useFallbackText && (
          <div className={`w-full max-w-3xl min-h-[500px] rounded-2xl border-2 p-6 sm:p-10 shadow-2xl flex flex-col justify-between ${themeStyles.paper}`}>
            <div>
              <div className="border-b border-amber-500/20 pb-3 mb-4 flex justify-between text-xs text-amber-400 font-medium">
                <span>{volume.volumeNumber} — {volume.title}</span>
                <span>صفحہ {currentPage}</span>
              </div>
              <h3 className="text-xl font-bold font-nastaliq text-amber-400 mb-4">
                کتاب کا متنی خلاصہ و مقدمہ
              </h3>
              <p className="font-nastaliq text-lg leading-loose text-justify">
                {volume.description}
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 text-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
              >
                اصل پی ڈی ایف کتاب اپلوڈ کریں
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= BOTTOM FLOATING CONTROLS ================= */}
      <footer
        className={`shrink-0 h-16 px-4 sm:px-8 flex items-center justify-between border-t ${themeStyles.footer} backdrop-blur-md z-30 transition-colors`}
      >
        {/* Page Slider & Number */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={() => setShowPageJump(true)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold whitespace-nowrap transition"
          >
            صفحہ {currentPage} / {totalPages}
          </button>

          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-black/40 rounded-lg"
          />
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))}
            className="p-1.5 rounded-lg bg-black/20 text-gray-300 hover:text-white border border-white/10"
            title="زوم کم کریں"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-amber-300 hidden sm:inline">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.2, +(z + 0.15).toFixed(2)))}
            className="p-1.5 rounded-lg bg-black/20 text-gray-300 hover:text-white border border-white/10"
            title="زوم زیادہ کریں"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg bg-black/20 text-gray-300 hover:text-white border border-white/10 hidden sm:flex"
            title="زوم ری سیٹ کریں"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>

      {/* ================= TABLE OF CONTENTS DRAWER ================= */}
      {showToc && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm h-full bg-[#092218] text-white p-5 flex flex-col shadow-2xl border-l border-amber-500/30 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <List className="w-5 h-5" />
                <h3 className="text-lg font-nastaliq">فہرستِ ابواب و فصول</h3>
              </div>
              <button
                onClick={() => setShowToc(false)}
                className="p-1.5 rounded-lg bg-black/30 text-gray-300 hover:text-white text-sm"
              >
                ✕ بند کریں
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {volume.chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => {
                    setCurrentPage(chapter.pageNumber);
                    setShowToc(false);
                    showToast(`صفحہ ${chapter.pageNumber} پر منتقل ہو گئے`);
                  }}
                  className="w-full text-right p-3 rounded-xl border border-white/5 bg-black/20 hover:bg-amber-500/20 text-gray-200 hover:text-amber-300 transition flex items-center justify-between text-sm"
                >
                  <span className="font-nastaliq line-clamp-1">{chapter.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-black/30 text-amber-400 font-mono">
                    ص {chapter.pageNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= GO TO PAGE MODAL ================= */}
      {showPageJump && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleJumpSubmit}
            className="w-full max-w-xs bg-[#0b241b] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl text-center"
          >
            <h4 className="text-lg font-bold text-amber-400 mb-2 font-nastaliq">
              صفحہ پر جائیں
            </h4>
            <p className="text-xs text-gray-300 mb-4">
              ۱ سے لے کر {totalPages} تک کوئی بھی صفحہ درج کریں:
            </p>

            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              autoFocus
              className="w-full text-center text-2xl font-bold py-2 px-3 rounded-xl bg-black/40 border border-amber-500/30 text-amber-300 focus:outline-none focus:border-amber-400 mb-4"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition"
              >
                منتقل ہوں
              </button>
              <button
                type="button"
                onClick={() => setShowPageJump(false)}
                className="flex-1 py-2 rounded-xl bg-black/30 text-gray-300 font-semibold text-sm hover:text-white"
              >
                منسوخ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= SETTINGS DRAWER ================= */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xs h-full bg-[#092218] text-white p-5 flex flex-col shadow-2xl border-r border-amber-500/30 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
              <h3 className="font-bold text-amber-400 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>ریڈر ترتیبات</span>
              </h3>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Reading Mode */}
            <div className="mb-5">
              <label className="block text-xs text-amber-300 font-semibold mb-2">
                مطالعہ کا انداز:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('swipe')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    mode === 'swipe'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-black/30 text-gray-300 border-white/10'
                  }`}
                >
                  سوائپ (ورق گردانی)
                </button>
                <button
                  onClick={() => setMode('scroll')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    mode === 'scroll'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-black/30 text-gray-300 border-white/10'
                  }`}
                >
                  مسلسل سکرول
                </button>
              </div>
            </div>

            {/* Themes */}
            <div className="mb-5">
              <label className="block text-xs text-amber-300 font-semibold mb-2">
                تھیم کا انتخاب:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme('emerald')}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 ${
                    theme === 'emerald'
                      ? 'bg-[#0d281e] text-amber-300 border-amber-400'
                      : 'bg-[#0d281e]/60 text-gray-300 border-white/10'
                  }`}
                >
                  اسلامک زمرد
                </button>
                <button
                  onClick={() => setTheme('sepia')}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 ${
                    theme === 'sepia'
                      ? 'bg-[#fbf0d9] text-[#2c2217] border-amber-600 font-bold'
                      : 'bg-[#fbf0d9]/80 text-[#2c2217] border-white/10'
                  }`}
                >
                  سیپیا کاغذ
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 ${
                    theme === 'dark'
                      ? 'bg-[#171717] text-white border-amber-400'
                      : 'bg-[#171717]/60 text-gray-300 border-white/10'
                  }`}
                >
                  <Moon className="w-3 h-3 text-gray-300" />
                  سیاہ نائٹ
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 ${
                    theme === 'light'
                      ? 'bg-white text-gray-900 border-amber-400 font-bold'
                      : 'bg-white/80 text-gray-900 border-white/10'
                  }`}
                >
                  <Sun className="w-3 h-3 text-amber-600" />
                  روشن دن
                </button>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowSettingsDrawer(false);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 mb-2"
              >
                <Upload className="w-4 h-4" />
                <span>پی ڈی ایف فائل تبدیل کریں</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
