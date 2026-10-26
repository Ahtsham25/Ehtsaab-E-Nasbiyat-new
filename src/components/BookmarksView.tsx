import React, { useState } from 'react';
import {
  Bookmark as BookmarkIcon,
  Trash2,
  BookOpen,
  Calendar,
  Layers,
  Edit3,
  Check,
} from 'lucide-react';
import { Bookmark, Volume } from '../types';

interface BookmarksViewProps {
  bookmarks: Bookmark[];
  volumes: Volume[];
  onSelectBookmark: (volumeId: number, pageNumber: number) => void;
  onDeleteBookmark: (id: string) => void;
  onUpdateBookmarkNote: (id: string, note: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  volumes,
  onSelectBookmark,
  onDeleteBookmark,
  onUpdateBookmarkNote,
}) => {
  const [selectedVolFilter, setSelectedVolFilter] = useState<number | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const filteredBookmarks = bookmarks.filter((bm) => {
    if (selectedVolFilter === 'all') return true;
    return bm.volumeId === selectedVolFilter;
  });

  const handleStartEdit = (bm: Bookmark) => {
    setEditingId(bm.id);
    setEditText(bm.note || '');
  };

  const handleSaveEdit = (id: string) => {
    onUpdateBookmarkNote(id, editText);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen pb-24 text-white" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-b from-[#041a11] to-[#08291c] pt-6 pb-6 px-4 sm:px-8 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookmarkIcon className="w-5 h-5 fill-current" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-nastaliq text-amber-300">
              بک مارکس و اہم نشانات
            </h1>
          </div>
          <p className="text-xs text-amber-200/70 font-arabic mt-1">
            مطالعہ کے دوران محفوظ کیے گئے صفحات اور آپ کے ذاتی تحقیقی نوٹس
          </p>

          {/* Volume filter pills */}
          {bookmarks.length > 0 && (
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedVolFilter('all')}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition border ${
                  selectedVolFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-black/30 text-gray-300 border-white/10'
                }`}
              >
                تمام بک مارکس ({bookmarks.length})
              </button>

              {Array.from(new Set(bookmarks.map((b) => b.volumeId))).map((volId) => {
                const vol = volumes.find((v) => v.id === volId);
                return (
                  <button
                    key={volId}
                    onClick={() => setSelectedVolFilter(volId)}
                    className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition border ${
                      selectedVolFilter === volId
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                        : 'bg-black/30 text-gray-300 border-white/10'
                    }`}
                  >
                    {vol ? vol.volumeNumber : `جلد ${volId}`}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-6">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-16 px-4 bg-black/20 rounded-2xl border border-white/5 my-4">
            <BookmarkIcon className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
            <h3 className="text-base font-bold text-amber-300 font-nastaliq mb-1">
              کوئی بک مارک موجود نہیں ہے
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              کسی بھی جلد کے مطالعہ کے دوران اوپر موجود بک مارک کے آئیکن پر کلک کر کے اس صفحے کو محفوظ کر سکتے ہیں۔
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookmarks.map((bm) => (
              <div
                key={bm.id}
                className="bg-gradient-to-r from-[#0b241b] to-[#071a13] p-4 sm:p-5 rounded-2xl border border-amber-500/20 hover:border-amber-400/50 transition shadow-lg flex flex-col justify-between gap-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-nastaliq">
                      {bm.volumeNumber}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white font-nastaliq">
                      {bm.title}
                    </h3>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-lg bg-black/40 text-amber-400 font-mono font-bold border border-white/10">
                    صفحہ نمبر: {bm.pageNumber}
                  </span>
                </div>

                {/* Note section */}
                <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                  {editingId === bm.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="اپنا علمی نوٹ یا تبصرہ درج کریں..."
                        className="w-full bg-black/60 border border-amber-500/40 rounded-lg p-2 text-xs text-white focus:outline-none"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSaveEdit(bm.id)}
                          className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>محفوظ کریں</span>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 rounded bg-white/10 text-gray-300 text-xs"
                        >
                          منسوخ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-amber-100/80 leading-relaxed font-arabic">
                        {bm.note || 'کوئی اضافی نوٹ درج نہیں ہے۔'}
                      </p>
                      <button
                        onClick={() => handleStartEdit(bm)}
                        className="p-1 text-gray-400 hover:text-amber-300 text-xs"
                        title="نوٹ میں ترمیم کریں"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions bottom */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>محفوظ شدہ تاریخ: {bm.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectBookmark(bm.volumeId, bm.pageNumber)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition shadow"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>اس صفحے پر جائیں</span>
                    </button>

                    <button
                      onClick={() => onDeleteBookmark(bm.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                      title="بک مارک حذف کریں"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
