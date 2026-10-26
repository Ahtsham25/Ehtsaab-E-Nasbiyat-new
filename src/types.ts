export interface ChapterTopic {
  id: string;
  title: string;
  pageNumber: number;
}

export interface Volume {
  id: number; // 1 to 12
  volumeNumber: string; // e.g., "جلد اول", "جلد دوم"
  volumeNumberEn: string; // "Vol 1", "Vol 2"
  title: string; // e.g. "دفاع صحابہؓ و دفاع اہل بیتؑ"
  subtitle: string;
  description: string;
  archiveId: string; // Archive.org item identifier
  archiveUrl: string; // Details page URL
  pdfUrl: string; // Direct download / PDF URL
  coverImage: string; // Thumbnail or cover image URL
  totalPages: number;
  fileSize: string;
  isDownloaded?: boolean;
  downloadProgress?: number;
  lastReadPage?: number;
  chapters: ChapterTopic[];
}

export interface Bookmark {
  id: string;
  volumeId: number;
  volumeNumber: string;
  volumeTitle: string;
  pageNumber: number;
  title: string;
  note?: string;
  createdAt: string;
}

export type ReaderMode = 'swipe' | 'scroll';
export type ReaderTheme = 'dark' | 'sepia' | 'light' | 'emerald';
export type ReaderFontSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ReaderSettings {
  mode: ReaderMode;
  theme: ReaderTheme;
  zoom: number;
  fontSize: ReaderFontSize;
  autoTurnTime?: number;
  showPageNumbers: boolean;
  twoPageSpread: boolean;
}

export type ActiveTab = 'home' | 'downloads' | 'bookmarks' | 'more' | 'reader';
