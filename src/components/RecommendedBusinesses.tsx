import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Scale, 
  Calculator, 
  FileText, 
  Check, 
  Info, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { BusinessIdea, UserProfile, Language } from '../types';
import { SAMPLE_BUSINESSES } from '../data/sampleBusinesses';
import { translations } from '../i18n/translations';

interface RecommendedBusinessesProps {
  profile: UserProfile;
  language: Language;
  selectedComparisonIds: string[];
  onToggleComparison: (id: string) => void;
  onOpenCalculatorForBusiness: (business: BusinessIdea) => void;
  onGenerateReportForBusiness: (business: BusinessIdea) => void;
  onViewComparison: () => void;
}

export const RecommendedBusinesses: React.FC<RecommendedBusinessesProps> = ({
  profile,
  language,
  selectedComparisonIds,
  onToggleComparison,
  onOpenCalculatorForBusiness,
  onGenerateReportForBusiness,
  onViewComparison,
}) => {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Localized helper
  const getLocalizedTitle = (b: BusinessIdea) => {
    if (language === 'hi') return b.title_hi || b.title;
    if (language === 'mr') return b.title_mr || b.title;
    return b.title;
  };

  const getLocalizedTagline = (b: BusinessIdea) => {
    if (language === 'hi') return b.tagline_hi || b.tagline;
    if (language === 'mr') return b.tagline_mr || b.tagline;
    return b.tagline;
  };

  const getLocalizedSummary = (b: BusinessIdea) => {
    if (language === 'hi') return b.summary_hi || b.summary;
    if (language === 'mr') return b.summary_mr || b.summary;
    return b.summary;
  };

  const filteredBusinesses = SAMPLE_BUSINESSES.filter((b) => {
    const matchesCat = selectedCategory === 'all' || b.category === selectedCategory;
    const matchesQuery = 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.title_hi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.title_mr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {profile.location.village ? `${profile.location.village}, ${profile.location.block}` : 'Rural Region'} • Recommendations
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              {t.recommendations.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              {t.recommendations.subtitle}
            </p>
          </div>

          {/* Capital badge */}
          <div className="bg-stone-50 px-4 py-3 rounded-2xl border border-stone-200 shrink-0">
            <span className="text-[11px] text-stone-500 block">Your Available Capital</span>
            <span className="text-base font-bold text-emerald-800">
              ₹{profile.availableCapital.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Notice of estimated benchmarks */}
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2 text-xs text-stone-600">
          <Info className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong className="text-stone-900">Benchmark Transparency:</strong> Demand and profit figures are derived from rural micro-enterprise economic models. Actual results depend on local footfall and power consistency.
          </span>
        </div>

        {/* Category Filters */}
        <div className="pt-2 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-stone-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {t.recommendations.filterAll}
          </button>
          <button
            onClick={() => setSelectedCategory('food_processing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'food_processing'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {t.recommendations.filterFood}
          </button>
          <button
            onClick={() => setSelectedCategory('agriculture_service')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'agriculture_service'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {t.recommendations.filterAgri}
          </button>
          <button
            onClick={() => setSelectedCategory('manufacturing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'manufacturing'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {t.recommendations.filterMfg}
          </button>
          <button
            onClick={() => setSelectedCategory('retail_service')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'retail_service'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {t.recommendations.filterRetail}
          </button>
          <button
            onClick={() => setSelectedCategory('animal_husbandry')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'animal_husbandry'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {t.recommendations.filterAnimal}
          </button>
        </div>
      </div>

      {/* Grid of Business Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBusinesses.map((b) => {
          const isSelected = selectedComparisonIds.includes(b.id);
          const title = getLocalizedTitle(b);
          const tagline = getLocalizedTagline(b);
          const summary = getLocalizedSummary(b);

          return (
            <div
              key={b.id}
              className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                isSelected ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-stone-200 hover:border-emerald-300'
              }`}
            >
              <div className="p-6 space-y-4">
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                      {b.localDemandLevel} Demand
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-200">
                      {b.dataConfidence}
                    </span>
                  </div>

                  <span className="text-[10px] text-stone-400 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200">
                    {t.recommendations.sampleDataBadge}
                  </span>
                </div>

                {/* Title & Tagline */}
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-stone-900 font-serif">
                    {title}
                  </h3>
                  <p className="text-xs text-emerald-800 font-medium">
                    {tagline}
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed pt-1">
                    {summary}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2.5 py-2 border-y border-stone-100 text-center">
                  <div className="bg-stone-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-stone-500 block uppercase tracking-wider">{t.recommendations.costEst}</span>
                    <span className="text-sm font-bold text-stone-900">₹{b.estimatedCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-emerald-50/60 p-2.5 rounded-xl">
                    <span className="text-[10px] text-emerald-700 block uppercase tracking-wider">{t.recommendations.profitEst}</span>
                    <span className="text-sm font-bold text-emerald-800">₹{b.expectedMonthlyProfit.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-stone-500 block uppercase tracking-wider">{t.recommendations.payback}</span>
                    <span className="text-sm font-bold text-stone-900">{b.paybackPeriodMonths} Months</span>
                  </div>
                </div>

                {/* Hyper-local Analysis Data */}
                <div className="space-y-2.5 text-xs text-stone-700">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-900">{t.recommendations.customers}: </strong>
                      <span>{b.potentialCustomers}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-900">{t.recommendations.competitors}: </strong>
                      <span>{b.competitorDensity}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-900">{t.recommendations.marketGap}: </strong>
                      <span>{b.marketGaps[0]}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-900">Key Risk & Defense: </strong>
                      <span>{b.keyRisks[0]} (Mitigation: {b.riskMitigation[0]})</span>
                    </div>
                  </div>
                </div>

                {/* Freshness & Benchmark Citation */}
                <div className="pt-2 text-[10px] text-stone-400 flex items-center justify-between border-t border-stone-100">
                  <span>Source: {b.dataFreshness}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-stone-50 p-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => onToggleComparison(b.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
                  <span>{isSelected ? t.recommendations.alreadyCompared : t.recommendations.compareButton}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenCalculatorForBusiness(b)}
                    className="px-3 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    title={t.recommendations.openCalc}
                  >
                    <Calculator className="w-3.5 h-3.5 text-amber-700" />
                    <span>Calculator</span>
                  </button>

                  <button
                    onClick={() => onGenerateReportForBusiness(b)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Comparison Tray when businesses are selected */}
      {selectedComparisonIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[92%] bg-stone-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-stone-700 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-xs font-bold block">
                {selectedComparisonIds.length} {t.recommendations.compareBanner}
              </span>
              <span className="text-[11px] text-stone-400">
                {selectedComparisonIds.length < 2 ? 'Select 1 more to compare side-by-side' : 'Ready to compare!'}
              </span>
            </div>
          </div>

          <button
            onClick={onViewComparison}
            disabled={selectedComparisonIds.length < 2}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t.recommendations.viewComparison}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
