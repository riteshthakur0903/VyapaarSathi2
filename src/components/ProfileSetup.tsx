import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  IndianRupee, 
  HelpCircle, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { translations } from '../i18n/translations';

interface ProfileSetupProps {
  initialProfile: UserProfile;
  language: Language;
  onSaveProfile: (profile: UserProfile) => void;
  onContinueToAdvisor: () => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({
  initialProfile,
  language,
  onSaveProfile,
  onContinueToAdvisor,
}) => {
  const t = translations[language];
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'success' | 'denied'>('idle');
  const [gpsMessage, setGpsMessage] = useState<string>('');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Request location with explicit prior permission
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      setGpsMessage('Geolocation is not supported by your browser.');
      return;
    }

    setGpsStatus('detecting');
    setGpsMessage(t.profile.gpsDetecting);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsStatus('success');
        setGpsMessage(t.profile.gpsSuccess);

        // Try reverse geocoding via OpenStreetMap Nominatim or provide sensible block info
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.address || {};
          const detectedVillage = addr.village || addr.suburb || addr.town || addr.city_district || 'Gram Panchayat';
          const detectedBlock = addr.county || addr.state_district || 'Tehsil';
          const detectedDistrict = addr.state_district || addr.district || 'District';
          const detectedState = addr.state || 'Maharashtra';

          setProfile((prev) => ({
            ...prev,
            location: {
              village: detectedVillage,
              block: detectedBlock,
              district: detectedDistrict,
              state: detectedState,
              latitude,
              longitude,
              accuracyGranted: true,
            },
          }));
        } catch {
          // If geocoding network fails, keep coordinates with fallback labels
          setProfile((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              latitude,
              longitude,
              accuracyGranted: true,
            },
          }));
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsStatus('denied');
        setGpsMessage(t.profile.gpsDenied);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => {
      onContinueToAdvisor();
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <User className="w-3.5 h-3.5" />
          <span>उद्यमी प्रोफाइल • First-Time Entrepreneur Onboarding</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
          {t.profile.title}
        </h2>
        <p className="text-sm text-stone-600">
          {t.profile.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">1</span>
              <span>{t.profile.personalInfo}</span>
            </h3>
            <span className="text-xs text-stone-500 font-medium">{t.profile.skipOptional}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                {t.profile.fullName} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder={t.profile.namePlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm bg-stone-50/50"
              />
            </div>

            {/* Occupation */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                {t.profile.occupation}
              </label>
              <input
                type="text"
                value={profile.occupation}
                onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                placeholder={t.profile.occupationPlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm bg-stone-50/50"
              />
            </div>

            {/* Skills & Experience */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                {t.profile.skills}
              </label>
              <input
                type="text"
                value={profile.skills}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                placeholder={t.profile.skillsPlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm bg-stone-50/50"
              />
            </div>

            {/* Monthly Income */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  {t.profile.monthlyIncome}
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === 'income' ? null : 'income')}
                  className="text-stone-400 hover:text-stone-700 flex items-center gap-1 text-[11px]"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{t.profile.whyNeeded}</span>
                </button>
              </div>
              {activeTooltip === 'income' && (
                <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded-xl border border-emerald-200">
                  {t.profile.whyIncome}
                </div>
              )}
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-stone-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={profile.monthlyIncome || ''}
                  onChange={(e) => setProfile({ ...profile, monthlyIncome: Number(e.target.value) })}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm bg-stone-50/50"
                  placeholder="15000"
                />
              </div>
            </div>

            {/* Available Capital */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  {t.profile.availableCapital} <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === 'capital' ? null : 'capital')}
                  className="text-stone-400 hover:text-stone-700 flex items-center gap-1 text-[11px]"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{t.profile.whyNeeded}</span>
                </button>
              </div>
              {activeTooltip === 'capital' && (
                <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded-xl border border-emerald-200">
                  {t.profile.whyCapital}
                </div>
              )}
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-stone-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="5000"
                  value={profile.availableCapital || ''}
                  onChange={(e) => setProfile({ ...profile, availableCapital: Number(e.target.value) })}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm bg-stone-50/50"
                  placeholder="50000"
                />
              </div>
            </div>

            {/* Social Category for Subsidy */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                {t.profile.category}
              </label>
              <select
                value={profile.category || 'General'}
                onChange={(e) => setProfile({ ...profile, category: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm bg-stone-50/50"
              >
                <option value="General">{t.profile.general}</option>
                <option value="OBC">{t.profile.obc}</option>
                <option value="SC">{t.profile.sc}</option>
                <option value="ST">{t.profile.st}</option>
                <option value="Women">{t.profile.women}</option>
              </select>
              <p className="text-[11px] text-stone-500">
                SC/ST, OBC, and Women get higher subsidy (up to 35% under PMEGP in rural areas).
              </p>
            </div>

            {/* Open to Loan */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                {t.profile.openToLoan}
              </label>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, openToLoan: true })}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                    profile.openToLoan
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-600'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  ✓ {t.profile.yesLoan}
                </button>
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, openToLoan: false })}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                    !profile.openToLoan
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-600'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  ✓ {t.profile.noLoan}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Location Setup (Permission-First) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">2</span>
              <span>{t.profile.locationSetup}</span>
            </h3>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'loc' ? null : 'loc')}
              className="text-stone-400 hover:text-stone-700 flex items-center gap-1 text-[11px]"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.profile.whyNeeded}</span>
            </button>
          </div>

          {activeTooltip === 'loc' && (
            <div className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded-xl border border-emerald-200">
              {t.profile.whyLocation}
            </div>
          )}

          {/* Location permission box */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Automatic GPS Location Detection</span>
                </h4>
                <p className="text-xs text-stone-600 max-w-xl">
                  {t.profile.locationDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={gpsStatus === 'detecting'}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Navigation className={`w-3.5 h-3.5 ${gpsStatus === 'detecting' ? 'animate-spin' : ''}`} />
                <span>{gpsStatus === 'detecting' ? 'Detecting...' : t.profile.requestGps}</span>
              </button>
            </div>

            {gpsStatus === 'success' && (
              <div className="p-3 bg-emerald-100/70 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{gpsMessage}</span>
              </div>
            )}

            {gpsStatus === 'denied' && (
              <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{gpsMessage}</span>
              </div>
            )}
          </div>

          {/* Manual Entry Fallback Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                {t.profile.village} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.location.village}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    location: { ...profile.location, village: e.target.value },
                  })
                }
                placeholder="उदा. शिरोळ (Shirol)"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs bg-stone-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                {t.profile.block} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.location.block}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    location: { ...profile.location, block: e.target.value },
                  })
                }
                placeholder="उदा. शिरोळ तालुका"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs bg-stone-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                {t.profile.district} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.location.district}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    location: { ...profile.location, district: e.target.value },
                  })
                }
                placeholder="उदा. कोल्हापूर (Kolhapur)"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs bg-stone-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                {t.profile.state} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.location.state}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    location: { ...profile.location, state: e.target.value },
                  })
                }
                placeholder="उदा. Maharashtra / Uttar Pradesh"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs bg-stone-50/50"
              />
            </div>
          </div>
        </div>

        {/* Action Save Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-100 p-6 rounded-2xl border border-stone-200">
          <p className="text-xs text-stone-600">
            Clicking save will update your local profile and sync with Supabase when configured.
          </p>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{savedSuccess ? 'Saved! Redirecting...' : t.profile.saveProfile}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
