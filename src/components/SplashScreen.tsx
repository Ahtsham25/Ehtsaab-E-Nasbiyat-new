import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const onFinishRef = React.useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onFinishRef.current(), 250);
          return 100;
        }
        return prev + 5;
      });
    }, 45);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#03150d] via-[#08291c] to-[#041910] text-white select-none overflow-hidden"
      dir="rtl"
    >
      {/* Background Islamic Geometric Watermark Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Arabic Bismillah */}
      <div className="pt-8 text-center z-10">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-amiri text-2xl sm:text-3xl text-amber-300/90 font-bold tracking-widest"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1 }}
          className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2"
        />
      </div>

      {/* Center Logo & Title */}
      <div className="flex flex-col items-center text-center z-10 px-4">
        {/* Animated Emblem Frame */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100 }}
          className="relative mb-6"
        >
          {/* Outer Golden Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 to-emerald-500/30 rounded-3xl blur-xl animate-pulse" />

          {/* User's Original Logo Emblem */}
          <div className="relative rounded-3xl p-1 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-2xl">
            <img
              src="/logo.png"
              alt="احتساب ناصبیت"
              className="w-44 h-44 sm:w-56 sm:h-56 object-contain rounded-[22px] bg-[#051a12]"
            />
          </div>
        </motion.div>

        {/* Urdu Calligraphic Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 font-nastaliq leading-relaxed tracking-wide drop-shadow-md"
        >
          احتساب ناصبیت
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-sm sm:text-base text-amber-200/90 font-medium font-arabic mt-1"
        >
          دفاع صحابہؓ و دفاع اہل بیتؑ — مکمل ۱۲ جلدیں
        </motion.p>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 mt-3"
        >
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            تحقیقی و علمی انسائیکلوپیڈیا
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            مفت و آف لائن ریڈر
          </span>
        </motion.div>
      </div>

      {/* Bottom Progress Bar & Skip */}
      <div className="w-full max-w-xs pb-6 z-10 flex flex-col items-center">
        {/* Progress line */}
        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-amber-500/20 mb-3">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-300 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-xs text-amber-300/70">
          <span>کتب خانے کی تیاری...</span>
          <span className="font-mono">{progress}%</span>
        </div>

        <button
          onClick={onFinish}
          className="mt-4 text-xs text-amber-400/80 hover:text-amber-200 underline font-semibold transition"
        >
          براہ راست داخل ہوں ⤶
        </button>
      </div>
    </div>
  );
};
