import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  FileText, 
  Calculator, 
  Building2, 
  Trash2, 
  Eye, 
  Plus, 
  ExternalLink, 
  User, 
  MapPin, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { UserProfile, FeasibilityReport, LoanCalculation, Language } from '../types';
import { translations } from '../i18n/translations';
import { dataService } from '../services/dataService';
import { isSupabaseConfigured } from '../lib/supabase';

interface DashboardProps {
  profile: UserProfile;
  language: Language;
  onOpenReport: (report: FeasibilityReport) => void;
  onOpenCalculatorWithCalc: (calc: LoanCalculation) => void;
  onGoToProfile: () => void;
  onGoToIdeas: () => void;
  onOpenSupabaseModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  language,
  onOpenReport,
  onOpenCalculatorWithCalc,
  onGoToProfile,
  onGoToIdeas,
  onOpenSupabaseModal,
}) => {
  const t = translations[language];
  const isSupabaseActive = isSupabaseConfigured();

  const [savedReports, setSavedReports] = useState<FeasibilityReport[]>([]);
  const [savedCalcs, setSavedCalcs] = useState<LoanCalculation[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [reports, calcs, analyses] = await Promise.all([
        dataService.getFeasibilityReports(),
        dataService.getSavedCalculations(),
        dataService.getSavedAnalyses(),
      ]);
      setSavedReports(reports);
      setSavedCalcs(calcs);
      setSavedAnalyses(analyses);
    } catch (e) {
      console.warn('Dashboard load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDeleteReport = async (id: string) => {
    await dataService.deleteFeasibilityReport(id);
    setSavedReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDeleteCalc = async (id: string) => {
    await dataService.deleteCalculation(id);
    setSavedCalcs((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
              <span>उद्यमी डैशबोर्ड • Your Enterprise Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              {t.dashboard.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              {t.dashboard.subtitle}
            </p>
          </div>

          <button
            onClick={onGoToIdeas}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t.dashboard.createNew}</span>
          </button>
        </div>

        {/* Database Status Strip */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Database className={`w-4 h-4 ${isSupabaseActive ? 'text-emerald-700' : 'text-amber-600'}`} />
            <div>
              <span className="font-bold text-stone-900">
                {isSupabaseActive ? t.dashboard.supabaseConnected : t.dashboard.supabaseLocal}
              </span>
              <p className="text-[11px] text-stone-500">
                {isSupabaseActive
                  ? 'All records synced with Row Level Security in your cloud database.'
                  : 'Operating seamlessly in browser storage. Click settings to connect your Supabase project.'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSupabaseModal}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 cursor-pointer"
          >
            {t.dashboard.connectSettings}
          </button>
        </div>
      </div>

      {/* User Profile Snapshot Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white p-6 rounded-3xl shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base font-serif">{profile.name}</h3>
              <p className="text-xs text-emerald-200">
                {profile.occupation || 'Aspiring Rural Entrepreneur'} • {profile.category || 'General'} Category
              </p>
            </div>
          </div>

          <button
            onClick={onGoToProfile}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors cursor-pointer"
          >
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[11px] text-emerald-200 block">Location</span>
            <strong className="text-sm">
              {profile.location.village ? `${profile.location.village}, ${profile.location.district}` : 'Not specified'}
            </strong>
          </div>
          <div>
            <span className="text-[11px] text-emerald-200 block">Available Capital</span>
            <strong className="text-sm text-amber-300">₹{profile.availableCapital.toLocaleString('en-IN')}</strong>
          </div>
          <div>
            <span className="text-[11px] text-emerald-200 block">Monthly Income</span>
            <strong className="text-sm">₹{profile.monthlyIncome.toLocaleString('en-IN')}</strong>
          </div>
          <div>
            <span className="text-[11px] text-emerald-200 block">Loan Readiness</span>
            <strong className="text-sm text-emerald-300">{profile.openToLoan ? 'Open to Bank Credit' : 'Self-funded'}</strong>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Saved Reports & Saved Calculations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Saved Feasibility Reports */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>{t.dashboard.savedReports}</span>
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                {savedReports.length}
              </span>
            </h3>
          </div>

          {savedReports.length === 0 ? (
            <div className="py-8 text-center space-y-2 text-stone-500 text-xs">
              <p>{t.dashboard.noReports}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-300 transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-stone-900">
                      {report.businessTitle}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Total Cost: ₹{report.financialSummary.totalStartupCost.toLocaleString('en-IN')} • EMI: ₹{report.financialSummary.estimatedEMI.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] text-stone-400">
                      Saved {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onOpenReport(report)}
                      className="p-2 text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="View Report"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Loan Calculations */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>{t.dashboard.savedCalcs}</span>
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                {savedCalcs.length}
              </span>
            </h3>
          </div>

          {savedCalcs.length === 0 ? (
            <div className="py-8 text-center space-y-2 text-stone-500 text-xs">
              <p>{t.dashboard.noCalcs}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedCalcs.map((calc) => (
                <div
                  key={calc.id}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-300 transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-stone-900">
                        {calc.businessTitle}
                      </h4>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                        calc.feasibilityScore === 'high'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {calc.feasibilityScore}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Loan: ₹{calc.loanAmount.toLocaleString('en-IN')} @ {calc.interestRate}% • EMI: ₹{calc.monthlyEMI.toLocaleString('en-IN')}/mo
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onOpenCalculatorWithCalc(calc)}
                      className="p-2 text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Open in Calculator"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {calc.id && (
                      <button
                        onClick={() => handleDeleteCalc(calc.id!)}
                        className="p-2 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Calculation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
