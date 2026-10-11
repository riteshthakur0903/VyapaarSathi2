import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ProfileSetup } from './components/ProfileSetup';
import { AIAdvisorChat } from './components/AIAdvisorChat';
import { RecommendedBusinesses } from './components/RecommendedBusinesses';
import { BusinessComparison } from './components/BusinessComparison';
import { InvestmentCalculator } from './components/InvestmentCalculator';
import { LoanSchemes } from './components/LoanSchemes';
import { FeasibilityReportView } from './components/FeasibilityReportView';
import { Dashboard } from './components/Dashboard';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

import { UserProfile, Language, BusinessIdea, FeasibilityReport, LoanCalculation } from './types';
import { dataService, DEFAULT_PROFILE } from './services/dataService';
import { SAMPLE_BUSINESSES } from './data/sampleBusinesses';
import { createFeasibilityReport } from './utils/reportGenerator';
import { translations } from './i18n/translations';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [currentTab, setCurrentTab] = useState<string>('welcome');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [selectedComparisonIds, setSelectedComparisonIds] = useState<string[]>([
    SAMPLE_BUSINESSES[0].id,
    SAMPLE_BUSINESSES[1].id,
  ]);
  const [activeBusiness, setActiveBusiness] = useState<BusinessIdea | null>(SAMPLE_BUSINESSES[0]);
  const [activeReport, setActiveReport] = useState<FeasibilityReport>(() =>
    createFeasibilityReport(SAMPLE_BUSINESSES[0], DEFAULT_PROFILE)
  );
  const [supabaseModalOpen, setSupabaseModalOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initialize from storage
  useEffect(() => {
    const init = async () => {
      try {
        const storedProfile = await dataService.getProfile();
        setProfile(storedProfile);
        setLanguage(storedProfile.language || 'en');
        // Seed default report
        setActiveReport(createFeasibilityReport(SAMPLE_BUSINESSES[0], storedProfile));
      } catch (e) {
        console.warn('Init profile failed:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    init();
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setProfile((prev) => {
      const updated = { ...prev, language: newLang };
      dataService.saveProfile(updated);
      return updated;
    });
  };

  const handleSaveProfile = async (newProfile: UserProfile) => {
    const saved = await dataService.saveProfile(newProfile);
    setProfile(saved);
    // Refresh active report with updated profile location
    if (activeBusiness) {
      setActiveReport(createFeasibilityReport(activeBusiness, saved));
    }
  };

  // Toggle comparison ID
  const handleToggleComparison = (id: string) => {
    setSelectedComparisonIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 3) {
          // Keep max 3 for clean side-by-side display
          return [...prev.slice(1), id];
        }
        return [...prev, id];
      }
    });
  };

  // Open Calculator for specific business
  const handleOpenCalculatorForBusiness = (business: BusinessIdea) => {
    setActiveBusiness(business);
    setCurrentTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate Report for business
  const handleGenerateReportForBusiness = (business: BusinessIdea) => {
    setActiveBusiness(business);
    const newReport = createFeasibilityReport(business, profile);
    setActiveReport(newReport);
    setCurrentTab('reports');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate Report from custom calculation
  const handleGenerateReportWithCalc = (calc: LoanCalculation) => {
    const biz = SAMPLE_BUSINESSES.find((b) => b.title === calc.businessTitle) || activeBusiness || SAMPLE_BUSINESSES[0];
    const newReport = createFeasibilityReport(biz, profile, calc);
    setActiveReport(newReport);
    setCurrentTab('reports');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open existing saved report from dashboard
  const handleOpenSavedReport = (report: FeasibilityReport) => {
    setActiveReport(report);
    setCurrentTab('reports');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open existing saved calculation in calculator
  const handleOpenCalculatorWithCalc = (calc: LoanCalculation) => {
    const biz = SAMPLE_BUSINESSES.find((b) => b.title === calc.businessTitle) || SAMPLE_BUSINESSES[0];
    setActiveBusiness(biz);
    setCurrentTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = translations[language];

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-stone-600">Loading VyapaarSathi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
        comparisonCount={selectedComparisonIds.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentTab === 'welcome' && (
          <WelcomeScreen
            language={language}
            onLanguageChange={handleLanguageChange}
            onStartJourney={() => setCurrentTab('profile')}
            onExploreBusinesses={() => setCurrentTab('recommendations')}
            hasProfile={Boolean(profile.name)}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileSetup
            initialProfile={profile}
            language={language}
            onSaveProfile={handleSaveProfile}
            onContinueToAdvisor={() => setCurrentTab('advisor')}
          />
        )}

        {currentTab === 'advisor' && (
          <AIAdvisorChat
            profile={profile}
            language={language}
            selectedBusiness={activeBusiness}
            onSelectBusiness={(b) => setActiveBusiness(b)}
            onEditProfile={() => setCurrentTab('profile')}
            onViewRecommendations={() => setCurrentTab('recommendations')}
          />
        )}

        {currentTab === 'recommendations' && (
          <RecommendedBusinesses
            profile={profile}
            language={language}
            selectedComparisonIds={selectedComparisonIds}
            onToggleComparison={handleToggleComparison}
            onOpenCalculatorForBusiness={handleOpenCalculatorForBusiness}
            onGenerateReportForBusiness={handleGenerateReportForBusiness}
            onViewComparison={() => setCurrentTab('compare')}
          />
        )}

        {currentTab === 'compare' && (
          <BusinessComparison
            comparisonIds={selectedComparisonIds}
            language={language}
            profile={profile}
            onRemoveFromComparison={handleToggleComparison}
            onSelectPrimary={(business) => {
              setActiveBusiness(business);
              setCurrentTab('calculator');
            }}
            onOpenCalculator={handleOpenCalculatorForBusiness}
            onGoToRecommendations={() => setCurrentTab('recommendations')}
          />
        )}

        {currentTab === 'calculator' && (
          <InvestmentCalculator
            profile={profile}
            language={language}
            selectedBusiness={activeBusiness}
            onSelectBusiness={(b) => setActiveBusiness(b)}
            onGenerateReportWithCalc={handleGenerateReportWithCalc}
          />
        )}

        {currentTab === 'schemes' && (
          <LoanSchemes
            language={language}
            profile={profile}
          />
        )}

        {currentTab === 'reports' && (
          <FeasibilityReportView
            report={activeReport}
            language={language}
            onSaveReportSuccess={() => {}}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            language={language}
            onOpenReport={handleOpenSavedReport}
            onOpenCalculatorWithCalc={handleOpenCalculatorWithCalc}
            onGoToProfile={() => setCurrentTab('profile')}
            onGoToIdeas={() => setCurrentTab('recommendations')}
            onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
          />
        )}
      </main>

      {/* Database Setup & Schema Modal */}
      <SupabaseConfigModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-10 mt-12 print:hidden text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
            <div className="space-y-1">
              <span className="font-bold text-base text-stone-900 font-serif">
                VyapaarSathi (व्यापार साथी)
              </span>
              <p className="text-[11px] text-stone-500">
                Location-Aware Rural Business & Subsidized Credit Advisory Platform for India
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`hover:text-stone-900 font-medium ${language === 'en' ? 'text-emerald-700 font-bold' : ''}`}
              >
                English
              </button>
              <span>•</span>
              <button
                onClick={() => handleLanguageChange('hi')}
                className={`hover:text-stone-900 font-medium ${language === 'hi' ? 'text-emerald-700 font-bold' : ''}`}
              >
                हिन्दी
              </button>
              <span>•</span>
              <button
                onClick={() => handleLanguageChange('mr')}
                className={`hover:text-stone-900 font-medium ${language === 'mr' ? 'text-emerald-700 font-bold' : ''}`}
              >
                मराठी
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-stone-500">
            <p>
              © {new Date().getFullYear()} VyapaarSathi. Developed for rural entrepreneurship enablement.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://www.kviconline.gov.in/pmegp/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-stone-600"
              >
                PMEGP Portal
              </a>
              <a
                href="https://www.mudra.org.in/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-stone-600"
              >
                MUDRA Official
              </a>
              <a
                href="https://pmfme.mofpi.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-stone-600"
              >
                PM-FME Portal
              </a>
              <a
                href="https://www.standupmitra.in/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-stone-600"
              >
                Stand-Up Mitra
              </a>
              <button
                onClick={() => setSupabaseModalOpen(true)}
                className="hover:underline text-emerald-700 font-bold cursor-pointer"
              >
                Database Schema (Supabase)
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
