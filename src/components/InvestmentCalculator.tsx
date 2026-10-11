import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  IndianRupee, 
  Plus, 
  Trash2, 
  TrendingUp, 
  ShieldCheck, 
  Sliders, 
  Save, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BusinessIdea, CostItem, LoanCalculation, UserProfile, Language } from '../types';
import { SAMPLE_BUSINESSES } from '../data/sampleBusinesses';
import { translations } from '../i18n/translations';
import { dataService } from '../services/dataService';

interface InvestmentCalculatorProps {
  profile: UserProfile;
  language: Language;
  selectedBusiness: BusinessIdea | null;
  onSelectBusiness: (b: BusinessIdea) => void;
  onGenerateReportWithCalc: (calc: LoanCalculation) => void;
}

export const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({
  profile,
  language,
  selectedBusiness,
  onSelectBusiness,
  onGenerateReportWithCalc,
}) => {
  const t = translations[language];

  // Current business or default
  const activeBusiness = selectedBusiness || SAMPLE_BUSINESSES[0];

  // Editable cost breakdown items
  const [costItems, setCostItems] = useState<CostItem[]>(() => [
    ...activeBusiness.defaultCosts,
  ]);

  // When business changes, reload defaults
  useEffect(() => {
    if (selectedBusiness) {
      setCostItems([...selectedBusiness.defaultCosts]);
    }
  }, [selectedBusiness?.id]);

  // User capital & loan variables
  const [userCapital, setUserCapital] = useState<number>(profile.availableCapital || 50000);
  const [interestRate, setInterestRate] = useState<number>(9.5); // 9.5% annual
  const [tenureMonths, setTenureMonths] = useState<number>(36); // 3 years

  // New cost item input state
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemAmount, setNewItemAmount] = useState<number | ''>('');
  const [newItemCategory, setNewItemCategory] = useState<CostItem['category']>('equipment');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Totals & Gap Calculations
  const totalProjectCost = costItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const fundingGap = Math.max(0, totalProjectCost - userCapital);
  
  // By default, loan amount covers funding gap, but user can customize
  const [customLoanAmount, setCustomLoanAmount] = useState<number>(fundingGap);

  // Keep loan amount synced when gap shifts, unless user explicitly customized
  useEffect(() => {
    setCustomLoanAmount(fundingGap);
  }, [fundingGap]);

  // Loan EMI formula
  const P = Math.max(0, customLoanAmount);
  const annualR = interestRate / 100;
  const monthlyR = annualR / 12;
  const n = tenureMonths;

  let monthlyEMI = 0;
  if (P > 0 && n > 0) {
    if (monthlyR > 0) {
      monthlyEMI = Math.round(
        (P * monthlyR * Math.pow(1 + monthlyR, n)) / (Math.pow(1 + monthlyR, n) - 1)
      );
    } else {
      monthlyEMI = Math.round(P / n);
    }
  }

  const totalRepayment = monthlyEMI * n;
  const totalInterest = Math.max(0, totalRepayment - P);

  // Feasibility metric: Debt Service Coverage Ratio
  const projectedProfit = activeBusiness.expectedMonthlyProfit || 30000;
  const dscr = monthlyEMI > 0 ? Number((projectedProfit / monthlyEMI).toFixed(2)) : 5.0;

  let feasibilityStatus: 'high' | 'moderate' | 'stretched' = 'high';
  let feasibilityMessage = t.calculator.feasibilityHighDesc;
  if (dscr < 1.1) {
    feasibilityStatus = 'stretched';
    feasibilityMessage = t.calculator.feasibilityStretchedDesc;
  } else if (dscr < 1.6) {
    feasibilityStatus = 'moderate';
    feasibilityMessage = t.calculator.feasibilityModDesc;
  } else {
    feasibilityStatus = 'high';
    feasibilityMessage = t.calculator.feasibilityHighDesc;
  }

  // Cost item manipulation
  const handleAmountChange = (id: string, newAmt: number) => {
    setCostItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount: Math.max(0, newAmt) } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCostItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemLabel || !newItemAmount) return;

    const item: CostItem = {
      id: `custom_${Date.now()}`,
      category: newItemCategory,
      label: newItemLabel,
      amount: Number(newItemAmount),
      description: 'Custom entrepreneurial expense',
      isCustom: true,
    };

    setCostItems((prev) => [...prev, item]);
    setNewItemLabel('');
    setNewItemAmount('');
    setIsAddingItem(false);
  };

  // Save calculation
  const handleSaveCalculation = async () => {
    const calc: LoanCalculation = {
      businessTitle: activeBusiness.title,
      totalCost: totalProjectCost,
      availableCapital: userCapital,
      fundingGap,
      loanAmount: P,
      interestRate,
      tenureMonths,
      monthlyEMI,
      totalInterest,
      totalRepayment,
      breakdown: costItems,
      debtServiceCoverageRatio: dscr,
      feasibilityScore: feasibilityStatus,
      feasibilityReason: feasibilityMessage,
    };

    await dataService.saveCalculation(calc);
    setSaveSuccess(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <Calculator className="w-3.5 h-3.5 text-emerald-700" />
              <span>लागत एवं ऋण सिमुलेटर • Interactive Financial Modeler</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              {t.calculator.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              {t.calculator.subtitle}
            </p>
          </div>

          {/* Business Selector Pill */}
          <div className="shrink-0 space-y-1">
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Active Business:
            </label>
            <select
              value={activeBusiness.id}
              onChange={(e) => {
                const found = SAMPLE_BUSINESSES.find((b) => b.id === e.target.value);
                if (found) onSelectBusiness(found);
              }}
              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {SAMPLE_BUSINESSES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Editable Cost Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <span>{t.calculator.costBreakdown}</span>
                <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-normal">
                  {costItems.length} items
                </span>
              </h3>

              <button
                type="button"
                onClick={() => setIsAddingItem(!isAddingItem)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.calculator.addCostItem}</span>
              </button>
            </div>

            {/* Add custom item form */}
            {isAddingItem && (
              <form onSubmit={handleAddNewItem} className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <h4 className="text-xs font-bold text-emerald-950 uppercase">Add New Expense Item</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Item name (e.g. Weighing Scale)"
                    value={newItemLabel}
                    onChange={(e) => setNewItemLabel(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-stone-400 text-xs">₹</span>
                    <input
                      type="number"
                      required
                      min="100"
                      placeholder="Amount"
                      value={newItemAmount}
                      onChange={(e) => setNewItemAmount(e.target.value ? Number(e.target.value) : '')}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                  >
                    <option value="equipment">Machinery & Equipment</option>
                    <option value="setup">Civil Setup / Shed</option>
                    <option value="inventory">Raw Materials & Inventory</option>
                    <option value="rent">Shop Rent & Deposit</option>
                    <option value="licenses">Licenses & Legal</option>
                    <option value="working_capital">Working Capital</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingItem(false)}
                      className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-emerald-800"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List of cost items */}
            <div className="space-y-3">
              {costItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-stone-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">{item.label}</span>
                      <span className="text-[10px] uppercase font-bold text-stone-500 bg-stone-200/60 px-1.5 py-0.2 rounded-md">
                        {item.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-stone-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={item.amount}
                        onChange={(e) => handleAmountChange(item.id, Number(e.target.value))}
                        className="w-28 pl-7 pr-2 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove line item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Cost Summary Card */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">{t.calculator.totalProjectCost}:</span>
                <span className="font-extrabold text-stone-900 text-base">
                  ₹{totalProjectCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">{t.calculator.yourCapital}:</span>
                <span className="font-bold text-emerald-800">
                  - ₹{userCapital.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-950">{t.calculator.fundingGap}:</span>
                <span className="font-extrabold text-rose-700 text-base">
                  ₹{fundingGap.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Loan Assumptions & Interactive What-If Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2 border-b border-stone-100 pb-4">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>{t.calculator.whatIfSimulator}</span>
            </h3>

            {/* Sliders for What-If Analysis */}
            <div className="space-y-5">
              {/* Slider 1: Own Capital */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-stone-700">Your Available Savings:</span>
                  <span className="font-extrabold text-emerald-800">₹{userCapital.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max={Math.max(200000, totalProjectCost)}
                  step="5000"
                  value={userCapital}
                  onChange={(e) => setUserCapital(Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>₹10,000</span>
                  <span>₹{Math.max(200000, totalProjectCost).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Slider 2: Loan Amount */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-stone-700">{t.calculator.loanAmount}:</span>
                  <span className="font-extrabold text-stone-900">₹{P.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(totalProjectCost, 500000)}
                  step="5000"
                  value={P}
                  onChange={(e) => setCustomLoanAmount(Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
              </div>

              {/* Slider 3: Interest Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-stone-700">{t.calculator.interestRate}:</span>
                  <span className="font-extrabold text-stone-900">{interestRate}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="15.0"
                  step="0.25"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>6% (Subsidized)</span>
                  <span>15% (Commercial)</span>
                </div>
              </div>

              {/* Slider 4: Tenure */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-stone-700">{t.calculator.tenure}:</span>
                  <span className="font-extrabold text-stone-900">{tenureMonths} Months ({(tenureMonths / 12).toFixed(1)} Yrs)</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="84"
                  step="6"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>1 Year</span>
                  <span>7 Years</span>
                </div>
              </div>
            </div>

            {/* Calculated EMI Display */}
            <div className="p-5 bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl space-y-3 shadow-lg">
              <span className="text-[11px] text-emerald-200 block uppercase tracking-wider">
                {t.calculator.monthlyEmi}
              </span>
              <div className="text-3xl font-extrabold font-serif text-amber-300">
                ₹{monthlyEMI.toLocaleString('en-IN')}{' '}
                <span className="text-xs text-white/70 font-normal">/ month</span>
              </div>

              <div className="pt-2 border-t border-emerald-700/60 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-emerald-200 block">Total Interest</span>
                  <span className="font-bold">₹{totalInterest.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-200 block">Total Repayment</span>
                  <span className="font-bold">₹{totalRepayment.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Feasibility Assessment Status */}
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              feasibilityStatus === 'high'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : feasibilityStatus === 'moderate'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  {feasibilityStatus === 'high' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                  )}
                  <span>
                    {feasibilityStatus === 'high'
                      ? t.calculator.feasibilityHigh
                      : feasibilityStatus === 'moderate'
                      ? t.calculator.feasibilityMod
                      : t.calculator.feasibilityStretched}
                  </span>
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                  DSCR: {dscr}x
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {feasibilityMessage}
              </p>
            </div>

            {/* Actions: Save & Open Report */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSaveCalculation}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{saveSuccess ? t.calculator.calcSaved : t.calculator.saveCalculation}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const calc: LoanCalculation = {
                    businessTitle: activeBusiness.title,
                    totalCost: totalProjectCost,
                    availableCapital: userCapital,
                    fundingGap,
                    loanAmount: P,
                    interestRate,
                    tenureMonths,
                    monthlyEMI,
                    totalInterest,
                    totalRepayment,
                    breakdown: costItems,
                    debtServiceCoverageRatio: dscr,
                    feasibilityScore: feasibilityStatus,
                    feasibilityReason: feasibilityMessage,
                  };
                  onGenerateReportWithCalc(calc);
                }}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-800" />
                <span>Generate Feasibility Report from This Calc</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
