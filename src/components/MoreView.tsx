import React, { useState } from 'react';
import {
  Shield,
  Smartphone,
  BookOpen,
  Lock,
  FileText,
  Share2,
  Download,
  Info,
  Code,
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface MoreViewProps {
  onOpenAdmin: () => void;
  onInstallPwa?: () => void;
  isPwaInstallable?: boolean;
}

export const MoreView: React.FC<MoreViewProps> = ({
  onOpenAdmin,
  onInstallPwa,
  isPwaInstallable = true,
}) => {
  const [activeSubModal, setActiveSubModal] = useState<
    'about' | 'privacy' | 'terms' | 'apkGuide' | null
  >(null);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  const sampleWorkflowCode = `name: Build Android APK (احتساب ناصبیت)
on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-apk:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v5
        with:
          distribution: 'temurin'
          java-version: '17'
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install && npm run build
      - run: npx cap init "احتساب ناصبیت" "com.ihtisab.nasbiyat" --web-dir "dist"
      - run: npx cap add android || true && npx cap sync android
      - run: cd android && chmod +x gradlew && ./gradlew assembleDebug --no-daemon
      - uses: actions/upload-artifact@v4
        with:
          name: Ihtisab-e-Nasbiyat-v1.0-APK
          path: android/app/build/outputs/apk/debug/app-debug.apk`;

  const copyWorkflow = () => {
    navigator.clipboard.writeText(sampleWorkflowCode);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
  };

  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'احتساب ناصبیت — ۱۲ جلدیں ایپ',
        text: 'کتاب احتساب ناصبیت (دفاع صحابہؓ و دفاع اہل بیتؑ) مکمل ۱۲ جلدیں مع جدید اردو ریڈر',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('ایپ کا لنک کاپی ہو گیا!');
    }
  };

  return (
    <div className="min-h-screen pb-24 text-white" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-b from-[#041a11] to-[#08291c] pt-6 pb-6 px-4 sm:px-8 border-b border-amber-500/20">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl p-0.5 bg-gradient-to-br from-amber-400 to-amber-700 shadow-md">
              <img
                src="/logo.png"
                alt="لوگو"
                className="w-full h-full object-contain rounded-[10px]"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold font-nastaliq text-amber-300">
                مزید معلومات و ترتیبات
              </h1>
              <p className="text-xs text-amber-200/70 font-arabic">
                احتساب ناصبیت • ورژن 1.0 (اے پی کے ریڈی)
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAdmin}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>ایڈمن پینل</span>
          </button>
        </div>
      </header>

      {/* Main Options List */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 mt-6 space-y-4">
        {/* Admin Backend Panel Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#0d2a1f] to-[#082218] border-2 border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                  بیک اینڈ مینیجر
                </span>
                <h3 className="text-base font-bold text-white font-nastaliq">
                  ایڈمن پینل برائے ۱۲ جلدیں
                </h3>
              </div>
              <p className="text-xs text-amber-100/75 mt-1 font-arabic">
                تمام ۱۲ جلدوں کے آرکائیو لنکس، پی ڈی ایف یو آر ایل، خودکار سرورق (Auto Fetch Cover) اور مضامین ترتیب دیں۔
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAdmin}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>ایڈمن پینل کھولیں</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* APK Build with GitHub Actions Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0b241b] to-[#071a13] border border-amber-500/20 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-nastaliq">
                اینڈرائیڈ اے پی کے کیسے حاصل کریں؟ (GitHub Actions)
              </h3>
              <p className="text-xs text-gray-300 mt-0.5 font-arabic">
                گٹ ہب ایکشنز کی .github/workflows/build-apk.yml فائل کے ذریعے خودکار طریقہ سے اے پی کے تیار کریں۔
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveSubModal('apkGuide')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <Code className="w-4 h-4" />
            <span>اے پی کے گائیڈ دیکھیں</span>
          </button>
        </div>

        {/* In-App PWA Install */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0b241b] to-[#071a13] border border-amber-500/20 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-nastaliq">
                موبائل ہوم سکرین پر ایپ انسٹال کریں
              </h3>
              <p className="text-xs text-gray-300 mt-0.5 font-arabic">
                ایک کلک میں اپنے موبائل میں مکمل ایپ کی طرح انسٹال کریں اور بغیر براؤزر کے استعمال کریں۔
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onInstallPwa) onInstallPwa();
              else alert('براؤزر کے مینو میں جا کر "Add to Home Screen" یا "Install App" منتخب کریں۔');
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shrink-0 shadow"
          >
            <Sparkles className="w-4 h-4" />
            <span>ایپ انسٹال کریں</span>
          </button>
        </div>

        {/* Menu Grid Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* About Book & Author */}
          <button
            onClick={() => setActiveSubModal('about')}
            className="p-4 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 text-right flex items-center justify-between transition"
          >
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-bold text-gray-100 font-nastaliq">
                  کتاب اور مصنف کا تعارف
                </h4>
                <p className="text-[11px] text-gray-400">احتساب ناصبیت کے اغراض و مقاصد</p>
              </div>
            </div>
            <span className="text-amber-400 text-sm">←</span>
          </button>

          {/* Privacy Policy */}
          <button
            onClick={() => setActiveSubModal('privacy')}
            className="p-4 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 text-right flex items-center justify-between transition"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold text-gray-100 font-nastaliq">
                  پرائیویسی پالیسی (Privacy)
                </h4>
                <p className="text-[11px] text-gray-400">ڈیٹا تحفظ اور رازداری کی تفصیلات</p>
              </div>
            </div>
            <span className="text-emerald-400 text-sm">←</span>
          </button>

          {/* Terms of Service */}
          <button
            onClick={() => setActiveSubModal('terms')}
            className="p-4 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 text-right flex items-center justify-between transition"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="text-sm font-bold text-gray-100 font-nastaliq">
                  شرائط و ضوابط (Terms)
                </h4>
                <p className="text-[11px] text-gray-400">استعمال اور اشاعت کے اصول</p>
              </div>
            </div>
            <span className="text-blue-400 text-sm">←</span>
          </button>

          {/* Share App */}
          <button
            onClick={handleShareApp}
            className="p-4 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 text-right flex items-center justify-between transition"
          >
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-sm font-bold text-gray-100 font-nastaliq">
                  ایپ شیئر کریں
                </h4>
                <p className="text-[11px] text-gray-400">دوستوں اور اہل علم تک پہنچائیں</p>
              </div>
            </div>
            <span className="text-purple-400 text-sm">←</span>
          </button>
        </div>

        {/* Footer Note */}
        <div className="pt-8 text-center text-xs text-gray-400 space-y-1">
          <p className="font-nastaliq text-amber-300/80 text-sm">
            رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ
          </p>
          <p>کتاب احتساب ناصبیت • دفاع صحابہؓ و دفاع اہل بیتؑ • بارہ جلدیں</p>
        </div>
      </div>

      {/* ================= SUB MODALS ================= */}

      {/* APK Guide Modal */}
      {activeSubModal === 'apkGuide' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] bg-[#092218] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col overflow-hidden text-right">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-nastaliq text-lg">
                <Smartphone className="w-5 h-5" />
                <span>اینڈرائیڈ اے پی کے (APK) بنانے کا گٹ ہب ایکشنز طریقہ</span>
              </div>
              <button
                onClick={() => setActiveSubModal(null)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs text-gray-200 pl-1 leading-relaxed">
              <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30 text-amber-200">
                <strong>اہم معلومات:</strong> اس پروجیکٹ میں پہلے سے ہی گٹ ہب ایکشنز کی فائل{' '}
                <code className="text-amber-300 font-mono">.github/workflows/build-apk.yml</code>{' '}
                موجود اور ترتیب شدہ ہے۔
              </div>

              <h4 className="text-sm font-bold text-amber-300 font-nastaliq">
                اے پی کے فائل حاصل کرنے کے ۴ آسان مراحل:
              </h4>

              <ol className="list-decimal list-inside space-y-2 pr-1">
                <li>
                  <strong>GitHub پر کوڈ پش کریں:</strong> اس پروجیکٹ کو اپنے گٹ ہب اکاؤنٹ کی کسی بھی ریپوزٹری میں پش (Push) کریں۔
                </li>
                <li>
                  <strong>Actions ٹیب میں جائیں:</strong> اپنے گٹ ہب پروجیکٹ کے اوپر موجود{' '}
                  <span className="text-amber-400 font-bold">&quot;Actions&quot;</span> ٹیب پر کلک کریں۔
                </li>
                <li>
                  <strong>ورک فلو چلائیں:</strong> بائیں جانب{' '}
                  <span className="text-emerald-400 font-bold">&quot;Build Android APK&quot;</span>{' '}
                  ورک فلو پر کلک کر کے <span className="underline">&quot;Run workflow&quot;</span> دبائیں۔
                </li>
                <li>
                  <strong>اے پی کے ڈاؤن لوڈ کریں:</strong> ۳ سے ۵ منٹ میں بلڈ مکمل ہو جائے گی اور نیچے{' '}
                  <span className="text-amber-300 font-bold">&quot;Artifacts&quot;</span> سیکشن میں{' '}
                  <code className="bg-black/50 px-2 py-0.5 rounded text-amber-400">
                    Ihtisab-e-Nasbiyat-v1.0-APK
                  </code>{' '}
                  فائل ڈاؤن لوڈ کے لیے تیار ملے گی!
                </li>
              </ol>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-400">
                    ورک فلو فائل کا کوڈ (.github/workflows/build-apk.yml):
                  </span>
                  <button
                    onClick={copyWorkflow}
                    className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-amber-300 hover:text-white flex items-center gap-1"
                  >
                    {copiedWorkflow ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWorkflow ? 'کاپی ہو گیا' : 'کوڈ کاپی کریں'}</span>
                  </button>
                </div>
                <pre className="bg-black/60 p-3 rounded-xl border border-white/10 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48 text-left" dir="ltr">
                  {sampleWorkflowCode}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 mt-4 flex justify-end">
              <button
                onClick={() => setActiveSubModal(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                سمجھ آ گیا، بند کریں
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Book Modal */}
      {activeSubModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] bg-[#092218] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col overflow-hidden text-right">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
              <h3 className="font-bold font-nastaliq text-amber-400 text-lg">
                کتاب &quot;احتساب ناصبیت&quot; کا علمی تعارف
              </h3>
              <button
                onClick={() => setActiveSubModal(null)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs text-gray-200 leading-relaxed font-arabic">
              <div className="flex items-center gap-3 bg-black/30 p-3 rounded-xl border border-white/10">
                <img src="/logo.png" alt="لوگو" className="w-14 h-14 object-contain rounded-lg" />
                <div>
                  <h4 className="font-bold text-amber-300 font-nastaliq text-sm">
                    احتساب ناصبیت (دفاع صحابہؓ و دفاع اہل بیتؑ)
                  </h4>
                  <p className="text-[11px] text-gray-400">مکمل بارہ (۱۲) ضخیم مجلدات</p>
                </div>
              </div>

              <p>
                کتاب <strong>&quot;احتساب ناصبیت&quot;</strong> اسلامی تاریخ اور کلامی مباحث کا وہ عظیم الشان اور شاہکار تحقیقی انسائیکلوپیڈیا ہے جس میں بیک وقت دو محاذوں پر اہل سنت و الجماعت کا معتدل اور منصفانہ مؤقف اجاگر کیا گیا ہے:
              </p>

              <div className="space-y-2 border-r-2 border-amber-500 pr-3">
                <p>
                  <strong>۱۔ دفاعِ اہل بیت اطہارؑ:</strong> امیر المؤمنین حضرت علی بن ابی طالبؓ، سیدۃ نساء اہل الجنہ حضرت فاطمہ الزہراؓ، حسنین کریمینؑ اور تمام ازواج مطہرات کی عظمت، تقدس اور ان سے محبت کے وجوب کا قرآن و سنت کی روشنی میں مسکت اثبات۔
                </p>
                <p>
                  <strong>۲۔ دفاعِ صحابہ کرامؓ:</strong> سیدنا ابوبکر صدیقؓ، سیدنا عمر فاروقؓ، سیدنا عثمان غنیؓ، سیدنا امیر معاویہؓ اور جملہ مہاجرین و انصار کے شرف صحابیت کا تحفظ اور ان پر اٹھنے والے اعتراضات کا محققانہ بطلان۔
                </p>
              </div>

              <p>
                اس کتاب میں ناصبی فکر اور خارجیت کی جڑوں کو ائمہ محدثین (امام احمد بن حنبل، امام بخاری، حافظ ابن حجر، شاہ ولی اللہ دہلوی، وغیرہ) کے مسلّم اصولوں سے رد کیا گیا ہے۔
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 mt-4 flex justify-end">
              <button
                onClick={() => setActiveSubModal(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                بند کریں
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {activeSubModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] bg-[#092218] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col overflow-hidden text-right">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
              <h3 className="font-bold font-nastaliq text-emerald-400 text-lg">
                پرائیویسی پالیسی (Privacy Policy)
              </h3>
              <button
                onClick={() => setActiveSubModal(null)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-gray-200 leading-relaxed font-arabic">
              <p>
                ہماری اولین ترجیح صارفین کی رازداری کا تحفظ ہے۔ یہ ایپلیکیشن کسی بھی قسم کا ذاتی ڈیٹا، صارف کے کوائف، لوکیشن یا نجی معلومات سرور پر نہ تو جمع کرتی ہے اور نہ ہی تیسرے فریق کو فروخت کرتی ہے۔
              </p>

              <h5 className="font-bold text-amber-300">۱۔ لوکل اسٹوریج (Local Storage):</h5>
              <p>
                آپ کی جانب سے لگائے گئے بک مارکس، نوٹس، ڈاؤن لوڈز اور آخری مطالعہ شدہ صفحہ کا ریکارڈ مکمل طور پر آپ کے اپنے موبائل کی لوکل میموری میں محفوظ رہتا ہے۔
              </p>

              <h5 className="font-bold text-amber-300">۲۔ انٹرنیٹ کا استعمال:</h5>
              <p>
                ایپلیکیشن صرف اس وقت انٹرنیٹ کا استعمال کرتی ہے جب آپ کتب کے سرورق یا پی ڈی ایف فائلز کو آرکائیو (Archive.org) سے ڈاؤن لوڈ یا فیچ کر رہے ہوں۔
              </p>

              <h5 className="font-bold text-amber-300">۳۔ اشتہارات و ٹریکنگ:</h5>
              <p>
                یہ ایپ مکمل طور پر اشتہارات (No Ads) اور تجزیاتی ٹریکرز سے پاک ہے تاکہ مطالعہ یکسوئی سے جاری رکھا جا سکے۔
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 mt-4 flex justify-end">
              <button
                onClick={() => setActiveSubModal(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                ٹھیک ہے
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {activeSubModal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] bg-[#092218] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl flex flex-col overflow-hidden text-right">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
              <h3 className="font-bold font-nastaliq text-blue-400 text-lg">
                شرائط و ضوابط و قانونی اعلان
              </h3>
              <button
                onClick={() => setActiveSubModal(null)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-gray-200 leading-relaxed font-arabic">
              <p>
                یہ ایپلیکیشن خالصتاً دینی، علمی، تحقیقی اور اصلاحی مقاصد کے تحت بلا معاوضہ پیش کی جا رہی ہے۔
              </p>
              <h5 className="font-bold text-amber-300">حقوق اشاعت و استفادہ:</h5>
              <p>
                اس ایپ میں موجود کتب کے مطالعے اور شیئرنگ کی عام اجازت ہے، بشرطیکہ متن میں کسی قسم کا رد و بدل یا تحریف نہ کی جائے اور اسے تجارتی مقاصد کے لیے استعمال نہ کیا جائے۔
              </p>
              <h5 className="font-bold text-amber-300">ذمہ داری سے استثنیٰ:</h5>
              <p>
                کتاب میں مذکور آراء و مضامین مصنف کے تحقیقی منہج کے عکاس ہیں۔ قارئین کو مثبت اور متوازن علمی مطالعے کی ترغیب دی جاتی ہے۔
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 mt-4 flex justify-end">
              <button
                onClick={() => setActiveSubModal(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                قبول ہے
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
