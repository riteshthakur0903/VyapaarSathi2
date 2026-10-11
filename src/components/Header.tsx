import React from 'react';
import { 
  Building2, 
  Globe2, 
  Database, 
  Sparkles, 
  Calculator, 
  Landmark, 
  FileText, 
  LayoutDashboard, 
  User, 
  Scale, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenSupabaseModal: () => void;
  comparisonCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onLanguageChange,
  onOpenSupabaseModal,
  comparisonCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);
  const t = translations[language];
  const isConnected = isSupabaseConfigured();

  const navItems = [
    { id: 'welcome', label: t.nav.welcome, icon: Building2 },
    { id: 'profile', label: t.nav.profile, icon: User },
    { id: 'advisor', label: t.nav.aiAdvisor, icon: Sparkles },
    { id: 'recommendations', label: t.nav.recommendations, icon: Building2 },
    { 
      id: 'compare', 
      label: t.nav.compare, 
      icon: Scale, 
      badge: comparisonCount > 0 ? comparisonCount : undefined 
    },
    { id: 'calculator', label: t.nav.calculator, icon: Calculator },
    { id: 'schemes', label: t.nav.schemes, icon: Landmark },
    { id: 'reports', label: t.nav.reports, icon: FileText },
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
  ];

  const languages = [
    { code: 'en' as Language, label: 'English', native: 'English' },
    { code: 'hi' as Language, label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr' as Language, label: 'Marathi', native: 'मराठी' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs print:hidden">
      {/* Top Banner for rural accessibility & trust */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1 px-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{t.appTagline} • भारत सरकार एमएसएमई एवं ग्रामीण बैंक मानकों पर आधारित</span>
        </div>
        <button
          onClick={onOpenSupabaseModal}
          className="hover:underline flex items-center gap-1.5 cursor-pointer font-medium text-emerald-200"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isConnected ? 'Supabase Connected' : 'Local Mode (Supabase Setup)'}</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => onSelectTab('welcome')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-xl tracking-tight">VS</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-stone-900 font-serif">
                  Vyapaar<span className="text-emerald-700">Sathi</span>
                </span>
                <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full border border-amber-300">
                  व्यापार साथी
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Rural Business & Loan Advisory
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right controls: Language & Supabase Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium cursor-pointer"
                title="Change language / भाषा बदलें"
              >
                <Globe2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  {languages.find((l) => l.code === language)?.native || 'English'}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-stone-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setLangDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Select Language / भाषा
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => onLanguageChange(l.code)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 hover:text-emerald-900 transition-colors ${
                        language === l.code ? 'font-bold text-emerald-800 bg-emerald-50/50' : 'text-stone-700'
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[11px] text-stone-400">({l.label})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation tray */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-stone-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <div className="grid grid-cols-2 gap-1.5 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">Database:</span>
            <button
              onClick={() => {
                onOpenSupabaseModal();
                setMobileMenuOpen(false);
              }}
              className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isConnected ? 'Supabase Active' : 'Setup Supabase'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
