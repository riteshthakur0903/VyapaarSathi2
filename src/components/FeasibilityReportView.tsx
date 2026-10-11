import React, { useState } from 'react';
import { 
  Printer, 
  Save, 
  Share2, 
  Building2, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Landmark, 
  TrendingUp, 
  ShieldCheck, 
  Clock,
  Sparkles,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FeasibilityReport, BusinessIdea, LoanCalculation, UserProfile, Language } from '../types';
import { translations } from '../i18n/translations';
import { dataService } from '../services/dataService';

interface FeasibilityReportViewProps {
  report: FeasibilityReport;
  language: Language;
  onSaveReportSuccess?: () => void;
}

export const FeasibilityReportView: React.FC<FeasibilityReportViewProps> = ({
  report,
  language,
  onSaveReportSuccess,
}) => {
  const t = translations[language];
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    await dataService.saveFeasibilityReport(report);
    setSaveSuccess(true);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
    if (onSaveReportSuccess) onSaveReportSuccess();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Action Controls (Hidden when printing) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            व्यवहार्यता अहवाल • Bank-Ready DPR Summary
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
            {report.businessTitle} - Project Feasibility Report
          </h2>
          <p className="text-xs text-stone-500">
            Generated on {new Date(report.createdAt).toLocaleDateString()} for {report.userSummary.name}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-800" />
            <span>{t.reports.printButton}</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saveSuccess ? t.reports.reportSaved : t.reports.saveToDb}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none print:rounded-none">
        {/* Document Header */}
        <div className="border-b-2 border-emerald-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-800 text-white font-extrabold text-xs">
                VyapaarSathi
              </span>
              <span className="text-xs font-serif font-bold text-stone-500">
                व्यापार साथी ग्रामीण उद्यम मार्गदर्शक
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
              Micro-Enterprise Project Feasibility Report
            </h1>
            <p className="text-sm font-semibold text-emerald-900">
              {report.businessTitle}
            </p>
          </div>

          <div className="text-right text-xs text-stone-500">
            <p><strong>Report Reference:</strong> DPR-{report.id.slice(0, 8)}</p>
            <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Section 1: Executive Profile & Location Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-1">
            {t.reports.sections.summary}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
            <div>
              <span className="text-stone-500 block text-[11px]">Applicant Name:</span>
              <strong className="text-stone-900">{report.userSummary.name}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Proposed Location:</span>
              <strong className="text-stone-900">{report.userSummary.locationText}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Available Own Capital:</span>
              <strong className="text-emerald-800">₹{report.userSummary.availableCapital.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Monthly Household Income:</span>
              <strong className="text-stone-900">₹{report.userSummary.monthlyIncome.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Business Rationale */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-1">
            {t.reports.sections.rationale}
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {report.executiveSummary}
          </p>
        </div>

        {/* Section 3: Market Analysis */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-1">
            {t.reports.sections.market}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="font-bold text-stone-900 block">Estimated Demand Level:</span>
              <p className="text-stone-600">{report.marketAnalysis.demandLevel}</p>
            </div>
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="font-bold text-stone-900 block">Target Customer Base:</span>
              <p className="text-stone-600">{report.marketAnalysis.customerBase}</p>
            </div>
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="font-bold text-stone-900 block">Competitor Density:</span>
              <p className="text-stone-600">{report.marketAnalysis.competitionLevel}</p>
            </div>
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="font-bold text-stone-900 block">Identified Market Gap:</span>
              <p className="text-stone-600">{report.marketAnalysis.unmetNeed}</p>
            </div>
          </div>
        </div>

        {/* Section 4: SWOT Analysis */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-1">
            {t.reports.sections.swot}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <span className="font-bold text-emerald-950 uppercase tracking-wider block">
                ✓ Strengths (ताकत)
              </span>
              <ul className="space-y-1 text-emerald-900">
                {report.swot.strengths.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <span className="font-bold text-amber-950 uppercase tracking-wider block">
                ! Weaknesses (कमजोरियां)
              </span>
              <ul className="space-y-1 text-amber-900">
                {report.swot.weaknesses.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
              <span className="font-bold text-teal-950 uppercase tracking-wider block">
                ★ Opportunities (अवसर)
              </span>
              <ul className="space-y-1 text-teal-900">
                {report.swot.opportunities.map((o, i) => (
                  <li key={i}>• {o}</li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
              <span className="font-bold text-rose-950 uppercase tracking-wider block">
                ⚠ Threats & Risks (खतरे)
              </span>
              <ul className="space-y-1 text-rose-900">
                {report.swot.threats.map((th, i) => (
                  <li key={i}>• {th}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 5 & 6: Financial Summary & Recommended Loan/EMI */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-1">
            {t.reports.sections.financial} & {t.reports.sections.loanOptions}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
            <div>
              <span className="text-stone-500 block text-[11px]">Total Project Cost:</span>
              <strong className="text-base text-stone-900">₹{report.financialSummary.totalStartupCost.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Own Margin Contribution:</span>
              <strong className="text-base text-emerald-800">₹{report.financialSummary.ownContribution.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Recommended Loan Size:</span>
              <strong className="text-base text-stone-900">₹{report.financialSummary.recommendedLoan.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px]">Est. Monthly Net Profit:</span>
              <strong className="text-base text-emerald-800">₹{report.financialSummary.estimatedMonthlyProfit.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div className="p-4 bg-emerald-900 text-white rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
            <div>
              <span className="text-emerald-200 block text-[11px]">Estimated Monthly EMI</span>
              <span className="text-2xl font-bold font-serif text-amber-300">
                ₹{report.financialSummary.estimatedEMI.toLocaleString('en-IN')} / month
              </span>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                Calculated at {report.financialSummary.interestRate}% annual interest over {report.financialSummary.tenureMonths} months ({report.financialSummary.tenureMonths / 12} years).
              </p>
            </div>

            <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 text-right">
              <span className="text-[10px] text-emerald-200 block">Est. Capital Payback</span>
              <span className="font-bold text-sm">{report.financialSummary.paybackMonths} Months</span>
            </div>
          </div>
        </div>

        {/* Section 7: Key Operational Risks & Mitigation Checklist */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-1">
            {t.reports.sections.risks}
          </h3>
          <ul className="space-y-2 text-xs text-stone-700">
            {report.mitigationStrategies.map((m, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 8: 30-Day Launch Plan */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-1">
            {t.reports.sections.nextSteps}
          </h3>
          <div className="space-y-2 text-xs text-stone-700">
            {report.actionPlan30Days.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency Disclaimer Footer */}
        <div className="pt-6 border-t border-stone-200 text-[10px] text-stone-500 leading-relaxed">
          <p><strong>Disclaimer & Disclosure:</strong> {report.dataDisclaimer}</p>
          <p className="mt-1">Prepared by VyapaarSathi Advisory Engine for educational and bank project report drafting purposes.</p>
        </div>
      </div>
    </div>
  );
};
