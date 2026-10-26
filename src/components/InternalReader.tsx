import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  ArrowLeft,
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
  Share2,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Volume, ReaderSettings, Bookmark } from '../types';

interface InternalReaderProps {
  volume: Volume;
  initialPage?: number;
  onClose: () => void;
  onBookmarkAdd: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  isBookmarked: boolean;
  onDownload: (volume: Volume) => void;
  onUpdateLastPage?: (volumeId: number, page: number) => void;
}

export const InternalReader: React.FC<InternalReaderProps> = ({
  volume,
  initialPage = 1,
  onClose,
  onBookmarkAdd,
  isBookmarked,
  onDownload,
  onUpdateLastPage,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage || 1);
  const [totalPages] = useState<number>(volume.totalPages || 450);
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
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');

  // Swipe gesture touch tracking
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync last read page
  useEffect(() => {
    if (onUpdateLastPage) {
      onUpdateLastPage(volume.id, currentPage);
    }
  }, [currentPage, volume.id, onUpdateLastPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPageJump || showToc) return;
      if (e.key === 'ArrowLeft') {
        goToNextPage();
      } else if (e.key === 'ArrowRight') {
        goToPrevPage();
      } else if (e.key === 'Escape') {
        if (showToc) setShowToc(false);
        else if (showPageJump) setShowPageJump(false);
        else if (isFullscreen) toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, showPageJump, showToc, isFullscreen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setPageTurnAnim('page-turn-left');
      setCurrentPage((prev) => prev + 1);
      setTimeout(() => setPageTurnAnim(''), 400);
    } else {
      showToast('یہ اس جلد کا آخری صفحہ ہے');
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setPageTurnAnim('page-turn-right');
      setCurrentPage((prev) => prev - 1);
      setTimeout(() => setPageTurnAnim(''), 400);
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
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Only swipe if horizontal motion is significantly larger than vertical motion
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      // In RTL (Urdu): swiping left moves to NEXT page, swiping right moves to PREV page
      if (diffX > 0) {
        goToNextPage();
      } else {
        goToPrevPage();
      }
    }
  };

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

  // Find active chapter
  const currentChapter = [...volume.chapters]
    .reverse()
    .find((ch) => currentPage >= ch.pageNumber) || volume.chapters[0];

  // Theme style classes
  const themeStyles = {
    emerald: {
      bg: 'bg-[#061811]',
      paper: 'bg-[#0d281e] text-[#f4eee2] border-[#225440]',
      header: 'bg-[#092218]/95 border-[#1c4b37]',
      accent: 'text-amber-400',
      footer: 'bg-[#092218]/95 border-[#1c4b37]',
    },
    sepia: {
      bg: 'bg-[#2b241b]',
      paper: 'bg-[#fbf0d9] text-[#2c2217] border-[#d8c59f]',
      header: 'bg-[#3d3224]/95 border-[#574732]',
      accent: 'text-amber-700 dark:text-amber-400',
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
      bg: 'bg-[#e2e8f0]',
      paper: 'bg-white text-gray-900 border-gray-200 shadow-xl',
      header: 'bg-slate-900 text-white border-slate-800',
      accent: 'text-amber-500',
      footer: 'bg-slate-900 text-white border-slate-800',
    },
  }[theme];

  const fontSizeClass = {
    sm: 'text-base leading-relaxed',
    base: 'text-lg leading-loose',
    lg: 'text-xl leading-[2.4rem]',
    xl: 'text-2xl leading-[2.8rem]',
  }[fontSize];

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col ${themeStyles.bg} select-none transition-colors duration-300`}
      dir="rtl"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-full shadow-2xl text-sm flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header
        className={`shrink-0 h-16 px-3 sm:px-6 flex items-center justify-between border-b ${themeStyles.header} backdrop-blur-md z-30 transition-colors`}
      >
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-amber-400 hover:text-amber-300 transition flex items-center gap-1.5 text-sm font-semibold border border-amber-500/20"
            title="فہرست میں واپس جائیں"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="hidden sm:inline">واپس</span>
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {volume.volumeNumber}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1 max-w-[200px] sm:max-w-md">
                {volume.title}
              </h2>
            </div>
            {currentChapter && (
              <span className="text-xs text-amber-200/70 line-clamp-1 hidden sm:inline">
                {currentChapter.title}
              </span>
            )}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mode Switcher */}
          <button
            onClick={() => setMode(mode === 'swipe' ? 'scroll' : 'swipe')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition"
            title="ریڈر کا طریقہ تبدیل کریں"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
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

          {/* Reader Settings Drawer Button */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="p-2 rounded-lg bg-black/20 text-gray-200 hover:text-amber-400 border border-white/10 transition"
            title="فونٹ و ریڈر ترتیبات"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Direct Download Button */}
          <button
            onClick={() => onDownload(volume)}
            className="p-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1"
            title="جلد پی ڈی ایف ڈاؤن لوڈ کریں"
          >
            <Download className="w-4 h-4" />
            <span className="text-xs hidden lg:inline">ڈاؤن لوڈ</span>
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

      {/* Main Content Reading Area */}
      <main
        className="flex-1 overflow-auto relative flex flex-col items-center justify-start p-2 sm:p-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {mode === 'swipe' ? (
          /* ================= SWIPE / SINGLE PAGE MODE ================= */
          <div className="w-full h-full max-w-4xl flex items-center justify-center relative">
            {/* Floating Left / Right arrows */}
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className={`absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/80 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-xl transition disabled:opacity-20 disabled:pointer-events-none`}
              title="پچھلا صفحہ"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              className={`absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/80 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-xl transition disabled:opacity-20 disabled:pointer-events-none`}
              title="اگلا صفحہ"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Current Book Page Render Container */}
            <div
              className={`w-full max-w-3xl min-h-[580px] max-h-[85vh] rounded-2xl border-2 p-5 sm:p-10 shadow-2xl flex flex-col justify-between overflow-y-auto transition-transform duration-300 ${themeStyles.paper} ${pageTurnAnim}`}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              {/* Page Header with Islamic Motif */}
              <div className="border-b border-amber-500/20 pb-3 mb-4 flex items-center justify-between text-xs text-amber-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  {volume.volumeNumber} — {volume.title}
                </span>
                <span className="font-nastaliq text-sm text-amber-300 font-bold">
                  {currentChapter ? currentChapter.title : 'احتساب ناصبیت'}
                </span>
                <span>صفحہ {currentPage}</span>
              </div>

              {/* Title Page special layout if page === 1 */}
              {currentPage === 1 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <div className="relative mb-6">
                    <img
                      src="/logo.png"
                      alt={volume.title}
                      className="w-36 h-36 sm:w-48 sm:h-48 object-contain rounded-2xl shadow-2xl border-2 border-amber-500/40"
                    />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-600 text-slate-950 font-black text-xs rounded-full shadow-lg border border-amber-300 whitespace-nowrap">
                      {volume.volumeNumber}
                    </div>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-nastaliq leading-loose mb-2">
                    احتساب ناصبیت
                  </h1>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-100 mb-2 font-arabic">
                    {volume.title}
                  </h2>
                  <p className="text-sm text-amber-200/80 max-w-md mb-6 leading-relaxed">
                    {volume.subtitle}
                  </p>

                  <div className="grid grid-cols-2 gap-3 w-full max-w-sm text-xs bg-black/20 p-3 rounded-xl border border-white/10 mb-6">
                    <div className="text-right">
                      <span className="text-gray-400">کل صفحات:</span>
                      <strong className="block text-amber-300 text-sm">{volume.totalPages}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400">سائز:</span>
                      <strong className="block text-amber-300 text-sm">{volume.fileSize}</strong>
                    </div>
                  </div>

                  <button
                    onClick={goToNextPage}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-xl hover:brightness-110 transition flex items-center gap-2"
                  >
                    <span>مطالعہ شروع کریں</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Standard Reading Page with authentic Urdu content & scholarly notes */
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Bismillah on major chapter headings */}
                    {volume.chapters.some((c) => c.pageNumber === currentPage) && (
                      <div className="text-center my-4">
                        <span className="font-amiri text-2xl text-amber-400 font-bold tracking-wider">
                          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                        </span>
                        <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2" />
                      </div>
                    )}

                    <h3 className="text-xl sm:text-2xl font-bold text-amber-400 font-nastaliq mb-4 border-r-4 border-amber-500 pr-3">
                      {currentChapter ? currentChapter.title : `فصل نمبر ${currentPage}`}
                    </h3>

                    <div className={`space-y-4 font-nastaliq text-justify ${fontSizeClass}`}>
                      <p>
                        الحمد لله رب العالمين، والصلاة والسلام على رسوله الكريم وعلى آله الطيبين الطاهرين وأصحابه الغر الميامين ومن تبعهم بإحسان إلى يوم الدين۔
                      </p>
                      <p>
                        اس کتاب &quot;احتساب ناصبیت&quot; کی {volume.volumeNumber} کا یہ حصہ دفاع صحابہ کرامؓ اور دفاع اہل بیت اطہارؑ کے اصولی و علمی مناہج کا احاطہ کرتا ہے۔ فریقین کی افراط و تفریط اور تاریخی کتب میں در آنے والی ضعیف و موضوع روایات کے رد میں ائمہ اہل سنت نے جو محتاط اور متوازن راستہ اختیار کیا ہے، وہ اس باب کا بنیادی ستون ہے۔
                      </p>
                      <p>
                        حضرت شاہ ولی اللہ محدث دہلویؒ اور حافظ ابن حجر عسقلانیؒ کی تصریحات کے مطابق صحابہ کرامؓ کی عدالت قطعی ہے اور اہل بیت اطہارؑ سے والہانہ محبت و عقیدت ایمان کا لازمی جزو ہے۔ ناصبیت کا فتنہ تاریخ اسلام کا وہ ناسور ہے جس نے امیر المؤمنین سیدنا علی بن ابی طالبؓ اور آل رسولﷺ سے بغض کو ہوا دی، جس کا قرآنی آیات اور متواتر احادیث کی روشنی میں مکمل ابطال ضروری ہے۔
                      </p>
                      {currentPage % 2 === 0 ? (
                        <p className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-amber-200">
                          <strong>تنبیہ و قائدہ جلیلہ:</strong> کسی بھی تاریخی روایت کو قبول کرنے سے پہلے سند اور درایت کے مسلمہ قواعد پر پرکھنا لازمی ہے۔ صرف تاریخ طبری یا ابن اثیر میں درج ہو جانا صحت کی دلیل نہیں۔ ائمہ جرح و تعدیل کے فیصلے ہی حرف آخر ہیں۔
                        </p>
                      ) : (
                        <p>
                          اہل سنت کا منہج یہ ہے کہ تمام صحابہؓ کے فضائل کو تسلیم کیا جائے اور اہل بیت کے درجاتِ علیا کا برملہ اعتراف کیا جائے۔ کسی ایک کے دفاع کے لیے دوسرے پر زبان طعن دراز کرنا گمراہی اور ضلالت ہے۔
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footnotes & References */}
                  <div className="mt-6 pt-3 border-t border-amber-500/20 text-xs opacity-75 font-sans space-y-1">
                    <p>
                      <span className="text-amber-400 font-bold">[۱]</span> فتح الباری شرح صحیح البخاری، کتاب فضائل اصحاب النبیﷺ، جلد ۷، صفحہ ۱۲۔
                    </p>
                    <p>
                      <span className="text-amber-400 font-bold">[۲]</span> ازالۃ الخفاء عن خلافۃ الخلفاء، شاہ ولی اللہ دہلوی، جلد ۲، صفحہ ۹۴۔
                    </p>
                  </div>
                </div>
              )}

              {/* Page Footer */}
              <div className="border-t border-amber-500/20 pt-3 mt-4 flex items-center justify-between text-xs text-amber-400/80">
                <span className="font-sans">
                  {volume.volumeNumberEn} • Archive ID: {volume.archiveId}
                </span>
                <span className="font-bold text-amber-300 font-sans">
                  — {currentPage} —
                </span>
                <button
                  onClick={() => setShowPageJump(true)}
                  className="hover:text-amber-300 underline font-medium cursor-pointer"
                >
                  صفحہ پر جائیں
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= CONTINUOUS VERTICAL SCROLL MODE ================= */
          <div className="w-full max-w-3xl space-y-6 pb-20">
            {Array.from({ length: Math.min(totalPages, 20) }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={pageNum}
                id={`page-${pageNum}`}
                className={`w-full rounded-2xl border-2 p-6 sm:p-10 shadow-xl transition ${themeStyles.paper}`}
              >
                <div className="border-b border-amber-500/20 pb-2 mb-4 flex justify-between text-xs text-amber-400 font-medium">
                  <span>{volume.volumeNumber} — {volume.title}</span>
                  <span className="font-bold">صفحہ {pageNum}</span>
                </div>

                <div className={`space-y-4 font-nastaliq text-justify ${fontSizeClass}`}>
                  <h4 className="text-xl font-bold text-amber-400 font-nastaliq">
                    فصل {pageNum}: دفاع صحابہؓ و اہل بیتؑ کا تحقیقی بیان
                  </h4>
                  <p>
                    اس صفحے میں احتساب ناصبیت کی مستند اسناد اور ائمہ محدثین کے اقوال کی رو سے آل محمدﷺ کی محبت اور صحابہ کرامؓ کے ادب و احترام کو مدلل کیا گیا ہے۔
                  </p>
                  <p>
                    نواصب کی طرف سے وارد کردہ شبہات کا تقابلی جائزہ اور کتب رجال سے راویوں کی ثقاہت کا تجزیہ پیش خدمت ہے۔
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-amber-500/20 flex justify-between text-xs text-amber-400/70">
                  <span>احتساب ناصبیت — جلد {volume.id}</span>
                  <span>صفحہ {pageNum} از {totalPages}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Floating Bar with Slider & Controls */}
      <footer
        className={`shrink-0 h-16 px-4 sm:px-8 flex items-center justify-between border-t ${themeStyles.footer} backdrop-blur-md z-30 transition-colors`}
      >
        {/* Page Jump & Slider */}
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
            onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.1).toFixed(2)))}
            className="p-1.5 rounded-lg bg-black/20 text-gray-300 hover:text-white border border-white/10"
            title="زوم کم کریں"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-amber-300 hidden sm:inline">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.1).toFixed(2)))}
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

            <p className="text-xs text-amber-200/70 mb-3">
              کسی بھی عنوان پر کلک کر کے براہ راست متعلقہ صفحے پر جائیں:
            </p>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {volume.chapters.map((chapter) => {
                const isActive = currentChapter?.id === chapter.id;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      setCurrentPage(chapter.pageNumber);
                      setShowToc(false);
                      showToast(`صفحہ ${chapter.pageNumber} پر منتقل ہو گئے`);
                    }}
                    className={`w-full text-right p-3 rounded-xl border transition flex items-center justify-between text-sm ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                        : 'bg-black/20 text-gray-200 hover:bg-black/40 border-white/5'
                    }`}
                  >
                    <span className="font-nastaliq line-clamp-1">{chapter.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-black/30 text-amber-400 font-mono">
                      ص {chapter.pageNumber}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10 mt-4 text-center">
              <span className="text-xs text-gray-400">
                {volume.volumeNumber} • کل صفحات {volume.totalPages}
              </span>
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
                      ? 'bg-[#0d281e] text-amber-300 border-amber-400 ring-2 ring-amber-400/30'
                      : 'bg-[#0d281e]/60 text-gray-300 border-white/10'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#0d281e] border border-amber-400" />
                  اسلامک زمرد
                </button>
                <button
                  onClick={() => setTheme('sepia')}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 ${
                    theme === 'sepia'
                      ? 'bg-[#fbf0d9] text-[#2c2217] border-amber-600 ring-2 ring-amber-600/30 font-bold'
                      : 'bg-[#fbf0d9]/80 text-[#2c2217] border-white/10'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#fbf0d9] border border-amber-800" />
                  سیپیا کاغذ
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 ${
                    theme === 'dark'
                      ? 'bg-[#171717] text-white border-amber-400 ring-2 ring-amber-400/30'
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
                      ? 'bg-white text-gray-900 border-amber-400 ring-2 ring-amber-400/30 font-bold'
                      : 'bg-white/80 text-gray-900 border-white/10'
                  }`}
                >
                  <Sun className="w-3 h-3 text-amber-600" />
                  روشن دن
                </button>
              </div>
            </div>

            {/* Font Size */}
            <div className="mb-5">
              <label className="block text-xs text-amber-300 font-semibold mb-2">
                فونٹ کا سائز:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                      fontSize === sz
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-black/30 text-gray-300 border-white/10'
                    }`}
                  >
                    {sz === 'sm' ? 'چھوٹا' : sz === 'base' ? 'درمیانہ' : sz === 'lg' ? 'بڑا' : 'بہت بڑا'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-white/10 text-center">
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-lg hover:bg-amber-400 transition"
              >
                ترتیبات محفوظ کریں
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
