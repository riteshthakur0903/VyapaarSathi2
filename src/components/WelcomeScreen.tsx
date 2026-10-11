import React from 'react';
import { 
  ArrowRight, 
  MapPin, 
  Calculator, 
  Landmark, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface WelcomeScreenProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onStartJourney: () => void;
  onExploreBusinesses: () => void;
  hasProfile: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  language,
  onLanguageChange,
  onStartJourney,
  onExploreBusinesses,
  hasProfile,
}) => {
  const t = translations[language];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 sm:p-10 lg:p-14 shadow-xl border border-emerald-700/30">
        {/* Subtle patterned background decoration */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#a7f3d0_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Language Selector Pills right at top */}
          <div className="inline-flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-xs text-emerald-200 px-2 font-medium">
              {t.welcome.selectLanguagePrompt}:
            </span>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                language === 'hi'
                  ? 'bg-amber-400 text-stone-900 shadow-sm scale-105'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => onLanguageChange('mr')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                language === 'mr'
                  ? 'bg-amber-400 text-stone-900 shadow-sm scale-105'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              मराठी
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-white text-emerald-950 shadow-sm scale-105'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              English
            </button>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>आत्मनिर्भर भारत • ग्रामीण स्वरोजगार मार्गदर्शन</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-serif text-white leading-tight">
              {t.welcome.heroHeading}
            </h1>
            <p className="text-base sm:text-lg text-emerald-100 max-w-2xl leading-relaxed">
              {t.welcome.heroSub}
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onStartJourney}
              className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-base shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{hasProfile ? t.welcome.continueProfile : t.welcome.getStarted}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onExploreBusinesses}
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Sample Business Ideas</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-emerald-200/90 border-t border-emerald-700/40">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PMEGP & Mudra Scheme Guidance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Multilingual Voice & Text AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Real Cost & EMI Simulator</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Value Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
            How VyapaarSathi Guides Rural Entrepreneurs
          </h2>
          <p className="text-sm text-stone-600">
            Designed for village youths, self-help groups, and first-time business starters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">
              {t.welcome.feature1Title}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.welcome.feature1Desc}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">
              {t.welcome.feature2Title}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.welcome.feature2Desc}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">
              {t.welcome.feature3Title}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.welcome.feature3Desc}
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">
              {t.welcome.feature4Title}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.welcome.feature4Desc}
            </p>
          </div>
        </div>
      </section>

      {/* How it works in 3 steps */}
      <section className="bg-stone-100 rounded-3xl p-6 sm:p-8 border border-stone-200">
        <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-700" />
          <span>Simple 3-Step Journey for New Entrepreneurs</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h4 className="font-bold text-stone-900 text-sm">Set Profile & Location</h4>
            <p className="text-xs text-stone-600">
              Enter your village name or detect GPS, and specify your available savings (e.g. ₹40,000 to ₹1 Lakh).
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h4 className="font-bold text-stone-900 text-sm">Consult Voice AI & Select Idea</h4>
            <p className="text-xs text-stone-600">
              Chat in Hindi, Marathi, or English. Review viable business options tailored for your area.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h4 className="font-bold text-stone-900 text-sm">Calculate EMI & Print DPR Report</h4>
            <p className="text-xs text-stone-600">
              Calculate exact monthly EMI, see applicable PMEGP subsidies, and print a bank-ready feasibility report.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Transparency & Fair Advisory Policy: </span>
          {t.welcome.sampleNotice}
        </div>
      </div>
    </div>
  );
};
