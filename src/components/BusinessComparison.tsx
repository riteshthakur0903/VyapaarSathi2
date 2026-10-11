import React from 'react';
import { 
  Scale, 
  Trash2, 
  CheckCircle, 
  ArrowRight, 
  Calculator, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Landmark,
  PlusCircle
} from 'lucide-react';
import { BusinessIdea, Language, UserProfile } from '../types';
import { SAMPLE_BUSINESSES } from '../data/sampleBusinesses';
import { translations } from '../i18n/translations';

interface BusinessComparisonProps {
  comparisonIds: string[];
  language: Language;
  profile: UserProfile;
  onRemoveFromComparison: (id: string) => void;
  onSelectPrimary: (business: BusinessIdea) => void;
  onOpenCalculator: (business: BusinessIdea) => void;
  onGoToRecommendations: () => void;
}

export const BusinessComparison: React.FC<BusinessComparisonProps> = ({
  comparisonIds,
  language,
  profile,
  onRemoveFromComparison,
  onSelectPrimary,
  onOpenCalculator,
  onGoToRecommendations,
}) => {
  const t = translations[language];

  const comparedBusinesses = SAMPLE_BUSINESSES.filter((b) =>
    comparisonIds.includes(b.id)
  );

  const getLocalizedTitle = (b: BusinessIdea) => {
    if (language === 'hi') return b.title_hi || b.title;
    if (language === 'mr') return b.title_mr || b.title;
    return b.title;
  };

  if (comparedBusinesses.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
          <Scale className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-stone-900 font-serif">
          {t.compare.title}
        </h3>
        <p className="text-sm text-stone-600">
          {t.compare.selectPrompt}
        </p>
        <button
          onClick={onGoToRecommendations}
          className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm inline-flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Browse Business Ideas</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <Scale className="w-3.5 h-3.5 text-emerald-700" />
          <span>तुलना तालिका • Side-by-Side Evaluation</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
          {t.compare.title}
        </h2>
        <p className="text-sm text-stone-600">
          {t.compare.subtitle}
        </p>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/70">
              <th className="p-4 sm:p-5 text-xs font-bold text-stone-500 uppercase tracking-wider w-1/4">
                {t.compare.metric}
              </th>
              {comparedBusinesses.map((b) => (
                <th key={b.id} className="p-4 sm:p-5 w-1/3 align-top">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-stone-900 text-sm font-serif">
                        {getLocalizedTitle(b)}
                      </h4>
                      <button
                        onClick={() => onRemoveFromComparison(b.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => onSelectPrimary(b)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{t.compare.chooseWinner}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
            {/* 1. Total Initial Cost */}
            <tr className="hover:bg-stone-50/50">
              <td className="p-4 font-bold text-stone-900 bg-stone-50/30">
                {t.compare.totalCost}
              </td>
              {comparedBusinesses.map((b) => (
                <td key={b.id} className="p-4">
                  <span className="text-sm font-extrabold text-stone-900">
                    ₹{b.estimatedCost.toLocaleString('en-IN')}
                  </span>
                </td>
              ))}
            </tr>

            {/* 2. Minimum Self-Contribution */}
            <tr className="hover:bg-stone-50/50">
              <td className="p-4 font-bold text-stone-900 bg-stone-50/30">
                {t.compare.minCapital}
              </td>
              {comparedBusinesses.map((b) => {
                const canAfford = profile.availableCapital >= b.minimumCapital;
                return (
                  <td key={b.id} className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">₹{b.minimumCapital.toLocaleString('en-IN')}</span>
                      {canAfford ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md font-bold">
                          Covered
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md font-bold">
                          Needs Savings
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 3. Monthly Expected Profit */}
            <tr className="hover:bg-stone-50/50">
              <td className="p-4 font-bold text-stone-900 bg-stone-50/30">
                {t.compare.monthlyProfit}
              </td>
              {comparedBusinesses.map((b) => (
                <td key={b.id} className="p-4">
                  <span className="text-sm font-bold text-emerald-800">
                    ₹{b.expectedMonthlyProfit.toLocaleString('en-IN')} / month
                  </span>
                </td>
              ))}
            </tr>

            {/* 4. Payback Period */}
            <tr className="hover:bg-stone-50/50">
              <td className="p-4 font-bold text-stone-900 bg-stone-50/30">
                {t.compare.payback}
              </td>
              {comparedBusinesses.map((b) => (
                <td key={b.id} className="p-4 font-bold text-stone-900">
                  {b.paybackPeriodMonths} Months
                </td>
              ))}
            </tr>

            {/* 5. Local Demand Level */}
            <tr className="hover:bg-stone-50/50">
              <td className="p-4 font-bold text-stone-900 bg-stone-50/30">
                {t.compare.demand}
              </td>
              {comparedBusinesses.map((b) => (
                <td key={b.id} className="p-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                    {b.localDemandLevel}
                  </span>
                  <p className="text-[11px] text-stone-500 mt-1">{b.potentialCustomers}</p>
                </td>
              ))}
            </tr>

            {/* 6. Competitor Density */}
            <tr className="hover:bg-stone-50/50">
              <td className="p-4 font-bold text-stone-900 bg-stone-50/30">
                Competitor Density
              </td>
              {comparedBusinesses.map((b) => (
                <td key={b.id} className="p-4 font-medium text-stone-800">
                  {b.competitorDensity}
                </td>
              ))}
            </tr>

            {/* 7. Key Operational Risk & Mitigation */}
            <tr className="hover:bg-stone-50/50">
              <td className="p-4 font-bold text-stone-900 bg-stone-50/30">
                {t.compare.riskLevel}
              </td>
              {comparedBusinesses.map((b) => (
                <td key={b.id} className="p-4 space-y-1">
                  <div className="flex items-start gap-1 text-rose-700">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="font-medium">{b.keyRisks[0]}</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    <strong>Mitigation:</strong> {b.riskMitigation[0]}
                  </p>
                </td>
              ))}
            </tr>

            {/* 8. Applicable Government Schemes */}
            <tr className="hover:bg-stone-50/50">
              <td className="p-4 font-bold text-stone-900 bg-stone-50/30">
                {t.compare.schemes}
              </td>
              {comparedBusinesses.map((b) => (
                <td key={b.id} className="p-4 space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {b.suitableSchemes.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-bold uppercase text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* 9. Direct Calculator Link */}
            <tr>
              <td className="p-4 font-bold text-stone-900 bg-stone-50/30">
                Financial Simulation
              </td>
              {comparedBusinesses.map((b) => (
                <td key={b.id} className="p-4">
                  <button
                    onClick={() => onOpenCalculator(b)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-amber-700" />
                    <span>Open Calculator</span>
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
