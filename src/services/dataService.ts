import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, FeasibilityReport, LoanCalculation, BusinessIdea, ChatMessage } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'vyapaarsathi_profile',
  ANALYSES: 'vyapaarsathi_saved_analyses',
  COMPARISONS: 'vyapaarsathi_comparisons',
  CALCULATIONS: 'vyapaarsathi_calculations',
  REPORTS: 'vyapaarsathi_reports',
  CHAT_MESSAGES: 'vyapaarsathi_chat_messages',
};

// Default starter profile
export const DEFAULT_PROFILE: UserProfile = {
  id: 'user_demo_01',
  name: 'Ramesh Patil',
  language: 'en',
  occupation: 'Farmer & Part-time Retail Worker',
  skills: 'Basic Tractor maintenance, Mobile handling, Local grain trade',
  monthlyIncome: 18000,
  availableCapital: 60000,
  openToLoan: true,
  location: {
    village: 'Shirol',
    block: 'Shirol',
    district: 'Kolhapur',
    state: 'Maharashtra',
    accuracyGranted: false,
  },
  educationLevel: '10th Standard',
  category: 'OBC',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const dataService = {
  // --- Profile Methods ---
  async getProfile(): Promise<UserProfile> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data && !error) {
            return {
              id: data.id,
              name: data.name,
              language: data.preferred_language || 'en',
              occupation: data.occupation || '',
              skills: data.skills || '',
              monthlyIncome: Number(data.monthly_income) || 0,
              availableCapital: Number(data.available_capital) || 0,
              openToLoan: Boolean(data.open_to_loan),
              location: {
                village: data.village || '',
                block: data.block || '',
                district: data.district || '',
                state: data.state || '',
                latitude: data.latitude,
                longitude: data.longitude,
                accuracyGranted: Boolean(data.has_location_permission),
              },
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
          }
        }
      } catch (err) {
        console.warn('Supabase profile fetch error, falling back to local storage:', err);
      }
    }

    // LocalStorage fallback
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading local profile', e);
    }
    return DEFAULT_PROFILE;
  },

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const updated = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };

    // Save to local storage immediately
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    } catch (e) {
      console.warn('Local storage write error', e);
    }

    // Sync to Supabase if available
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id,
            name: updated.name,
            preferred_language: updated.language,
            occupation: updated.occupation,
            skills: updated.skills,
            monthly_income: updated.monthlyIncome,
            available_capital: updated.availableCapital,
            open_to_loan: updated.openToLoan,
            village: updated.location.village,
            block: updated.location.block,
            district: updated.location.district,
            state: updated.location.state,
            latitude: updated.location.latitude,
            longitude: updated.location.longitude,
            has_location_permission: updated.location.accuracyGranted,
            updated_at: updated.updatedAt,
          });
        }
      } catch (err) {
        console.warn('Failed to upsert profile in Supabase:', err);
      }
    }

    return updated;
  },

  // --- Saved Business Analyses ---
  async getSavedAnalyses(): Promise<any[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('saved_analyses')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase fetch analyses failed:', e);
      }
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANALYSES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async saveAnalysis(business: BusinessIdea, locationText: string): Promise<boolean> {
    const newItem = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      business_id: business.id,
      business_title: business.title,
      category: business.category,
      summary: business.summary,
      demand_level: business.localDemandLevel,
      estimated_cost: business.estimatedCost,
      monthly_profit: business.expectedMonthlyProfit,
      location_name: locationText,
      data_confidence: business.dataConfidence,
      is_sample_data: business.isSampleData,
      created_at: new Date().toISOString(),
    };

    // Save locally
    const current = await this.getSavedAnalyses();
    const updated = [newItem, ...current.filter((x: any) => x.business_id !== business.id)];
    localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(updated));

    // Sync to Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('saved_analyses').insert({
            user_id: user.id,
            business_id: business.id,
            business_title: business.title,
            category: business.category,
            summary: business.summary,
            demand_level: business.localDemandLevel,
            estimated_cost: business.estimatedCost,
            monthly_profit: business.expectedMonthlyProfit,
            location_name: locationText,
            data_confidence: business.dataConfidence,
            is_sample_data: business.isSampleData,
          });
        }
      } catch (e) {
        console.warn('Supabase save analysis failed:', e);
      }
    }
    return true;
  },

  async deleteSavedAnalysis(id: string): Promise<boolean> {
    const current = await this.getSavedAnalyses();
    const filtered = current.filter((x: any) => x.id !== id && x.business_id !== id);
    localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(filtered));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('saved_analyses').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete analysis failed:', e);
      }
    }
    return true;
  },

  // --- Saved Comparisons ---
  async getSavedComparisons(): Promise<any[]> {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPARISONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async saveComparison(businessIds: string[], notes?: string): Promise<boolean> {
    const item = {
      id: `comp_${Date.now()}`,
      business_ids: businessIds,
      comparison_notes: notes || '',
      created_at: new Date().toISOString(),
    };
    const list = await this.getSavedComparisons();
    localStorage.setItem(STORAGE_KEYS.COMPARISONS, JSON.stringify([item, ...list]));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('business_comparisons').insert({
            user_id: user.id,
            business_ids: businessIds,
            comparison_notes: notes || '',
          });
        }
      } catch (e) {
        console.warn('Supabase save comparison failed:', e);
      }
    }
    return true;
  },

  // --- Financial Calculations ---
  async getSavedCalculations(): Promise<LoanCalculation[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('financial_calculations')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            businessTitle: d.business_title,
            totalCost: Number(d.startup_cost),
            availableCapital: Number(d.available_capital),
            fundingGap: Math.max(0, Number(d.startup_cost) - Number(d.available_capital)),
            loanAmount: Number(d.loan_amount),
            interestRate: Number(d.interest_rate),
            tenureMonths: Number(d.tenure_months),
            monthlyEMI: Number(d.monthly_emi),
            totalInterest: Math.max(0, Number(d.total_repayment) - Number(d.loan_amount)),
            totalRepayment: Number(d.total_repayment),
            breakdown: d.cost_breakdown || [],
            debtServiceCoverageRatio: 1.8,
            feasibilityScore: (d.feasibility_status as any) || 'high',
            feasibilityReason: 'Saved calculation',
            createdAt: d.created_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch calculations failed:', e);
      }
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CALCULATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async saveCalculation(calc: LoanCalculation): Promise<LoanCalculation> {
    const calcWithId: LoanCalculation = {
      ...calc,
      id: calc.id || `calc_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const current = await this.getSavedCalculations();
    const updated = [calcWithId, ...current.slice(0, 9)];
    localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(updated));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('financial_calculations').insert({
            user_id: user.id,
            business_title: calc.businessTitle,
            startup_cost: calc.totalCost,
            available_capital: calc.availableCapital,
            loan_amount: calc.loanAmount,
            interest_rate: calc.interestRate,
            tenure_months: calc.tenureMonths,
            monthly_emi: calc.monthlyEMI,
            total_repayment: calc.totalRepayment,
            cost_breakdown: calc.breakdown,
            feasibility_status: calc.feasibilityScore,
          });
        }
      } catch (e) {
        console.warn('Supabase save calculation failed:', e);
      }
    }
    return calcWithId;
  },

  async deleteCalculation(id: string): Promise<boolean> {
    const current = await this.getSavedCalculations();
    const filtered = current.filter((x) => x.id !== id);
    localStorage.setItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(filtered));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('financial_calculations').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete calculation failed:', e);
      }
    }
    return true;
  },

  // --- Feasibility Reports ---
  async getFeasibilityReports(): Promise<FeasibilityReport[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('feasibility_reports')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            businessId: d.business_id,
            businessTitle: d.business_title,
            createdAt: d.created_at,
            ...d.report_data,
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch reports failed:', e);
      }
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async saveFeasibilityReport(report: FeasibilityReport): Promise<FeasibilityReport> {
    const savedList = await this.getFeasibilityReports();
    const updated = [report, ...savedList.filter((r) => r.id !== report.id)];
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('feasibility_reports').insert({
            user_id: user.id,
            business_title: report.businessTitle,
            business_id: report.businessId,
            location_summary: report.userSummary.locationText,
            report_data: {
              userSummary: report.userSummary,
              executiveSummary: report.executiveSummary,
              marketAnalysis: report.marketAnalysis,
              financialSummary: report.financialSummary,
              swot: report.swot,
              recommendedSchemes: report.recommendedSchemes,
              mitigationStrategies: report.mitigationStrategies,
              actionPlan30Days: report.actionPlan30Days,
              dataDisclaimer: report.dataDisclaimer,
            },
          });
        }
      } catch (e) {
        console.warn('Supabase save feasibility report failed:', e);
      }
    }
    return report;
  },

  async deleteFeasibilityReport(id: string): Promise<boolean> {
    const current = await this.getFeasibilityReports();
    const filtered = current.filter((x) => x.id !== id);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(filtered));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('feasibility_reports').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete report failed:', e);
      }
    }
    return true;
  },

  // --- Chat Messages Methods ---
  async getChatMessages(): Promise<ChatMessage[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });
          if (!error && data && data.length > 0) {
            return data.map((d: any) => ({
              id: d.id,
              role: d.role,
              text: d.text,
              timestamp: d.timestamp || new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              source: d.source,
            }));
          }
        }
      } catch (e) {
        console.warn('Supabase fetch chat failed:', e);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  async saveChatMessages(messages: ChatMessage[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.warn('LocalStorage save chat error:', e);
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && messages.length > 0) {
          const latest = messages[messages.length - 1];
          await supabase.from('chat_messages').insert({
            user_id: user.id,
            role: latest.role,
            text: latest.text,
            timestamp: latest.timestamp,
            source: latest.source || 'gemini-3.8-flash',
          });
        }
      } catch (e) {
        console.warn('Supabase save message failed:', e);
      }
    }
  },

  async clearChatMessages(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('chat_messages').delete().eq('user_id', user.id);
        }
      } catch (e) {
        console.warn('Supabase clear messages failed:', e);
      }
    }
  },
};
