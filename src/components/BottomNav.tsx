import React from 'react';
import { Home, Download, Bookmark, Menu } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  downloadCount: number;
  bookmarkCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  downloadCount,
  bookmarkCount,
}) => {
  const navItems = [
    {
      id: 'home' as ActiveTab,
      label: 'ہوم',
      icon: Home,
      badge: null,
    },
    {
      id: 'downloads' as ActiveTab,
      label: 'ڈاؤن لوڈز',
      icon: Download,
      badge: downloadCount > 0 ? downloadCount : null,
    },
    {
      id: 'bookmarks' as ActiveTab,
      label: 'بک مارکس',
      icon: Bookmark,
      badge: bookmarkCount > 0 ? bookmarkCount : null,
    },
    {
      id: 'more' as ActiveTab,
      label: 'مزید',
      icon: Menu,
      badge: null,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#061e14]/95 backdrop-blur-lg border-t border-amber-500/20 px-4 py-1.5 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]"
      dir="rtl"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-gray-400 hover:text-amber-200/80'
              }`}
            >
              {/* Active Glow Pill */}
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" />
              )}

              <div className="relative">
                <IconComponent className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge !== null && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow-md">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] font-arabic mt-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
