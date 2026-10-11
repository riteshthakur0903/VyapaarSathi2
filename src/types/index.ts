export type Language = 'en' | 'hi' | 'mr';

export interface LocationData {
  village: string;
  block: string;
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
  accuracyGranted: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  language: Language;
  occupation: string;
  skills: string;
  monthlyIncome: number;
  availableCapital: number;
  openToLoan: boolean;
  location: LocationData;
  educationLevel?: string;
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'Women';
  createdAt: string;
  updatedAt: string;
}

export interface CostItem {
  id: string;
  category: 'equipment' | 'setup' | 'inventory' | 'rent' | 'licenses' | 'working_capital';
  label: string;
  amount: number;
  description: string;
  isCustom?: boolean;
}

export interface BusinessIdea {
  id: string;
  title: string;
  title_hi: string;
  title_mr: string;
  category: 'food_processing' | 'agriculture_service' | 'manufacturing' | 'retail_service' | 'animal_husbandry';
  tagline: string;
  tagline_hi: string;
  tagline_mr: string;
  summary: string;
  summary_hi: string;
  summary_mr: string;
  estimatedCost: number;
  minimumCapital: number;
  expectedMonthlyProfit: number;
  paybackPeriodMonths: number;
  localDemandLevel: 'Very High' | 'High' | 'Moderate' | 'Seasonal';
  potentialCustomers: string;
  competitorDensity: 'Low (1-2 nearby)' | 'Moderate (3-5 in block)' | 'High';
  marketGaps: string[];
  requiredSkills: string[];
  equipmentNeeded: string[];
  opportunities: string[];
  keyRisks: string[];
  riskMitigation: string[];
  defaultCosts: CostItem[];
  suitableSchemes: string[]; // scheme IDs
  dataConfidence: string; // e.g. "86% Model Estimate"
  dataFreshness: string; // e.g. "Rural Industry Survey Benchmark Q1 2025"
  isSampleData: boolean;
}

export interface LoanCalculation {
  id?: string;
  businessTitle: string;
  totalCost: number;
  availableCapital: number;
  fundingGap: number;
  loanAmount: number;
  interestRate: number; // e.g. 9.5%
  tenureMonths: number;
  monthlyEMI: number;
  totalInterest: number;
  totalRepayment: number;
  breakdown: CostItem[];
  debtServiceCoverageRatio: number; // monthly profit / EMI
  feasibilityScore: 'high' | 'moderate' | 'stretched';
  feasibilityReason: string;
  createdAt?: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  name_hi: string;
  name_mr: string;
  agency: string;
  maxLoanAmount: string;
  subsidyRate: string;
  targetBeneficiaries: string;
  interestSubsidy: string;
  eligibility: string[];
  requiredDocuments: string[];
  applicationSteps: string[];
  officialUrl: string;
  isVerified: boolean;
  verificationSource: string;
  category: 'central' | 'state' | 'bank_scheme';
}

export interface FeasibilityReport {
  id: string;
  userId: string;
  businessId: string;
  businessTitle: string;
  createdAt: string;
  userSummary: {
    name: string;
    locationText: string;
    availableCapital: number;
    monthlyIncome: number;
  };
  executiveSummary: string;
  marketAnalysis: {
    demandLevel: string;
    customerBase: string;
    competitionLevel: string;
    unmetNeed: string;
  };
  financialSummary: {
    totalStartupCost: number;
    ownContribution: number;
    recommendedLoan: number;
    estimatedMonthlyProfit: number;
    estimatedEMI: number;
    tenureMonths: number;
    interestRate: number;
    paybackMonths: number;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendedSchemes: string[];
  mitigationStrategies: string[];
  actionPlan30Days: string[];
  dataDisclaimer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  source?: string;
  isError?: boolean;
  errorMessage?: string;
  canRetry?: boolean;
  rawFailedPrompt?: string;
}
