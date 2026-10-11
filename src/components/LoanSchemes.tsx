import React, { useState } from 'react';
import { 
  Landmark, 
  ExternalLink, 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  FileCheck, 
  HelpCircle, 
  ChevronRight, 
  Sparkles,
  Info
} from 'lucide-react';
import { GovernmentScheme, Language, UserProfile } from '../types';
import { GOVERNMENT_SCHEMES } from '../data/governmentSchemes';
import { translations } from '../i18n/translations';

interface LoanSchemesProps {
  language: Language;
  profile: UserProfile;
}

export const LoanSchemes: React.FC<LoanSchemesProps> = ({
  language,
  profile,
}) => {
  const t = translations[language];
  const [activeSchemeId, setActiveSchemeId] = useState<string>(GOVERNMENT_SCHEMES[0].id);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const activeScheme = GOVERNMENT_SCHEMES.find((s) => s.id === activeSchemeId) || GOVERNMENT_SCHEMES[0];

  const toggleDoc = (doc: string) => {
    setCheckedDocs((prev) => ({ ...prev, [doc]: !prev[doc] }));
  };

  const getLocalizedName = (s: GovernmentScheme) => {
    if (language === 'hi') return s.name_hi || s.name;
    if (language === 'mr') return s.name_mr || s.name;
    return s.name;
  };

  // Calculate estimated subsidy for rural area
  const isSpecialCategory = profile.category === 'SC' || profile.category === 'ST' || profile.category === 'OBC' || profile.category === 'Women';
  const pmegpSubsidyPercent = isSpecialCategory ? 35 : 25;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <Landmark className="w-3.5 h-3.5 text-emerald-700" />
          <span>सरकारी योजनाएं • Verified Credit & Subsidy Directory</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
          {t.schemes.title}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600">
          {t.schemes.subtitle}
        </p>

        {/* Disclaimer Banner */}
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>Official Advisory Notice: </strong>{t.schemes.disclaimer}
          </span>
        </div>
      </div>

      {/* Profile Subsidy Calculation Highlight */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider">
            Your Rural Subsidy Eligibility Estimate
          </span>
          <h3 className="text-xl font-bold font-serif">
            {profile.name} ({profile.category || 'General'} Category • {profile.location.village || 'Rural Area'})
          </h3>
          <p className="text-xs text-emerald-100 max-w-xl">
            Under rural PMEGP guidelines, you qualify for up to <strong>{pmegpSubsidyPercent}% margin money capital subsidy</strong> on eligible manufacturing or service projects!
          </p>
        </div>

        <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/20 text-center shrink-0">
          <span className="text-[11px] text-emerald-200 block">Applicable Rural Subsidy</span>
          <span className="text-2xl font-black text-amber-300">{pmegpSubsidyPercent}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Scheme Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block px-1">
            Available Schemes ({GOVERNMENT_SCHEMES.length})
          </span>

          <div className="space-y-2">
            {GOVERNMENT_SCHEMES.map((scheme) => {
              const isSelected = scheme.id === activeScheme.id;
              const title = getLocalizedName(scheme);

              return (
                <button
                  key={scheme.id}
                  onClick={() => setActiveSchemeId(scheme.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-600 shadow-sm ring-1 ring-emerald-600'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {scheme.category}
                    </span>
                    {scheme.isVerified && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                    {title}
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                    {scheme.agency}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Scheme Breakdown (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            {/* Header info */}
            <div className="space-y-2 border-b border-stone-100 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                  {activeScheme.agency}
                </span>

                <a
                  href={activeScheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <span>{t.schemes.checkOfficial}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
                {getLocalizedName(activeScheme)}
              </h3>
            </div>

            {/* Key financial benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  {t.schemes.maxFunding}
                </span>
                <span className="text-sm font-bold text-stone-900">
                  {activeScheme.maxLoanAmount}
                </span>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  {t.schemes.subsidy}
                </span>
                <span className="text-sm font-bold text-emerald-950">
                  {activeScheme.subsidyRate}
                </span>
              </div>
            </div>

            {/* Eligibility criteria */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <span>{t.schemes.eligibility}</span>
              </h4>
              <ul className="space-y-2 text-xs text-stone-700">
                {activeScheme.eligibility.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Application steps */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-emerald-700" />
                <span>{t.schemes.steps}</span>
              </h4>
              <div className="space-y-2 text-xs text-stone-700 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                {activeScheme.applicationSteps.map((step, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {step}
                  </p>
                ))}
              </div>
            </div>

            {/* Interactive Document Checklist */}
            <div className="space-y-3 border-t border-stone-100 pt-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-700" />
                  <span>{t.schemes.documents}</span>
                </h4>
                <span className="text-[11px] text-stone-500">
                  Click to track documents you have ready
                </span>
              </div>

              <div className="space-y-2">
                {activeScheme.requiredDocuments.map((doc, idx) => {
                  const isChecked = Boolean(checkedDocs[doc]);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDoc(doc)}
                      className={`w-full p-3 rounded-xl border text-left text-xs flex items-center gap-3 transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400 shrink-0" />
                      )}
                      <span>{doc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Official Source Footnote */}
            <div className="pt-2 text-[10px] text-stone-400 border-t border-stone-100">
              Verified Source: {activeScheme.verificationSource}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
