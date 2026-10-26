import React, { useState, useEffect } from 'react';
import { Volume, Bookmark, ActiveTab } from './types';
import { DEFAULT_VOLUMES, INITIAL_BOOKMARKS } from './data/defaultVolumes';
import { SplashScreen } from './components/SplashScreen';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { DownloadsView } from './components/DownloadsView';
import { BookmarksView } from './components/BookmarksView';
import { MoreView } from './components/MoreView';
import { InternalReader } from './components/InternalReader';
import { AdminPanel } from './components/AdminPanel';
import { usePWAInstall } from './hooks/usePWAInstall';
import confetti from 'canvas-confetti';

const STORAGE_KEY_VOLUMES = 'ihtisab_volumes_v1';
const STORAGE_KEY_BOOKMARKS = 'ihtisab_bookmarks_v1';
const STORAGE_KEY_LAST_READ = 'ihtisab_last_read_v1';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [volumes, setVolumes] = useState<Volume[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOLUMES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_VOLUMES;
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_BOOKMARKS;
  });

  const [lastRead, setLastRead] = useState<{ volumeId: number; page: number } | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAST_READ);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return { volumeId: 1, page: 1 };
  });

  // Reader state
  const [activeReadingVolume, setActiveReadingVolume] = useState<Volume | null>(null);
  const [activeReadingPage, setActiveReadingPage] = useState<number>(1);

  // Admin panel state
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Toast notifications
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  // PWA install
  const { isInstallable, install } = usePWAInstall();

  // Save volumes on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VOLUMES, JSON.stringify(volumes));
    } catch {
      // quota
    }
  }, [volumes]);

  // Save bookmarks on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks));
    } catch {
      // quota
    }
  }, [bookmarks]);

  // Save last read on change
  useEffect(() => {
    if (lastRead) {
      try {
        localStorage.setItem(STORAGE_KEY_LAST_READ, JSON.stringify(lastRead));
      } catch {
        // quota
      }
    }
  }, [lastRead]);

  const showToast = (message: string) => {
    setGlobalToast(message);
    setTimeout(() => setGlobalToast(null), 3000);
  };

  const handleFinishSplash = React.useCallback(() => {
    setShowSplash(false);
  }, []);

  // Update last read page
  const handleUpdateLastPage = React.useCallback((volId: number, page: number) => {
    setLastRead({ volumeId: volId, page });
  }, []);

  // Select volume to open in internal reader
  const handleSelectVolume = React.useCallback((volume: Volume, page: number = 1) => {
    setActiveReadingVolume(volume);
    setActiveReadingPage(page);
    setLastRead({ volumeId: volume.id, page });
  }, []);

  // Close internal reader
  const handleCloseReader = React.useCallback(() => {
    setActiveReadingVolume(null);
  }, []);

  // Download volume
  const handleDownloadVolume = (vol: Volume) => {
    setVolumes((prev) =>
      prev.map((v) => (v.id === vol.id ? { ...v, isDownloaded: true } : v))
    );

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#D4AF37'],
      });
    } catch {
      // ignore
    }

    showToast(`${vol.volumeNumber} کامیابی سے آف لائن مطالعہ کے لیے محفوظ ہو گئی!`);

    // If PDF url exists, also open direct download in background
    if (vol.pdfUrl && vol.pdfUrl.startsWith('http')) {
      const a = document.createElement('a');
      a.href = vol.pdfUrl;
      a.download = `${vol.volumeNumber}-${vol.title}.pdf`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      // silent trigger
    }
  };

  // Download all volumes
  const handleDownloadAll = () => {
    setVolumes((prev) => prev.map((v) => ({ ...v, isDownloaded: true })));
    try {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }
    showToast('تمام ۱۲ جلدیں کامیابی سے ڈاؤن لوڈ و محفوظ ہو گئیں!');
  };

  // Delete downloaded volume from cache
  const handleDeleteDownload = (volumeId: number) => {
    setVolumes((prev) =>
      prev.map((v) => (v.id === volumeId ? { ...v, isDownloaded: false } : v))
    );
    showToast('جلد کو کیش سے حذف کر دیا گیا');
  };

  // Bookmarks
  const handleAddBookmark = (newBm: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const bookmark: Bookmark = {
      ...newBm,
      id: `bm-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setBookmarks((prev) => [bookmark, ...prev]);
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    showToast('بک مارک حذف کر دیا گیا');
  };

  const handleUpdateBookmarkNote = (id: string, note: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, note } : b))
    );
    showToast('نوٹ محفوظ ہو گیا');
  };

  const handleSelectBookmark = (volumeId: number, pageNumber: number) => {
    const vol = volumes.find((v) => v.id === volumeId);
    if (vol) {
      handleSelectVolume(vol, pageNumber);
    }
  };

  // Admin save & reset
  const handleSaveVolumes = (updated: Volume[]) => {
    setVolumes(updated);
    showToast('ایڈمن پینل کی تبدیلیاں نافذ ہو گئیں!');
  };

  const handleResetToDefaults = () => {
    setVolumes(DEFAULT_VOLUMES);
    localStorage.removeItem(STORAGE_KEY_VOLUMES);
    showToast('ابتدائی ترتیبات بحال ہو گئیں');
  };

  const downloadedCount = volumes.filter((v) => v.isDownloaded).length;

  return (
    <div className="min-h-screen bg-[#071911] text-slate-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white" dir="rtl">
      {/* ================= SPLASH SCREEN ================= */}
      {showSplash && <SplashScreen onFinish={handleFinishSplash} />}

      {/* Global Toast Banner */}
      {globalToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm border border-amber-300 animate-bounce">
          {globalToast}
        </div>
      )}

      {/* ================= MAIN TABS CONTENT ================= */}
      <div className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            volumes={volumes}
            onSelectVolume={handleSelectVolume}
            onDownloadVolume={handleDownloadVolume}
            lastReadVolumeId={lastRead?.volumeId || null}
            lastReadPage={lastRead?.page || null}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />
        )}

        {activeTab === 'downloads' && (
          <DownloadsView
            volumes={volumes}
            onSelectVolume={handleSelectVolume}
            onDownloadVolume={handleDownloadVolume}
            onDeleteDownload={handleDeleteDownload}
            onDownloadAll={handleDownloadAll}
          />
        )}

        {activeTab === 'bookmarks' && (
          <BookmarksView
            bookmarks={bookmarks}
            volumes={volumes}
            onSelectBookmark={handleSelectBookmark}
            onDeleteBookmark={handleDeleteBookmark}
            onUpdateBookmarkNote={handleUpdateBookmarkNote}
          />
        )}

        {activeTab === 'more' && (
          <MoreView
            onOpenAdmin={() => setIsAdminOpen(true)}
            onInstallPwa={install}
            isPwaInstallable={isInstallable}
          />
        )}
      </div>

      {/* ================= BOTTOM NAVIGATION BAR ================= */}
      {!activeReadingVolume && !isAdminOpen && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          downloadCount={downloadedCount}
          bookmarkCount={bookmarks.length}
        />
      )}

      {/* ================= INTERNAL READER MODAL ================= */}
      {activeReadingVolume && (
        <InternalReader
          volume={activeReadingVolume}
          initialPage={activeReadingPage}
          onClose={handleCloseReader}
          onBookmarkAdd={handleAddBookmark}
          isBookmarked={bookmarks.some(
            (b) =>
              b.volumeId === activeReadingVolume.id &&
              b.pageNumber === activeReadingPage
          )}
          onDownload={handleDownloadVolume}
          onUpdateLastPage={handleUpdateLastPage}
        />
      )}

      {/* ================= ADMIN BACKEND PANEL MODAL ================= */}
      {isAdminOpen && (
        <AdminPanel
          volumes={volumes}
          onSaveVolumes={handleSaveVolumes}
          onResetToDefaults={handleResetToDefaults}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}
