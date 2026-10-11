import { BusinessIdea, FeasibilityReport, LoanCalculation, UserProfile } from '../types';

export function createFeasibilityReport(
  business: BusinessIdea,
  profile: UserProfile,
  calc?: LoanCalculation
): FeasibilityReport {
  const startupCost = calc ? calc.totalCost : business.estimatedCost;
  const ownContribution = calc ? calc.availableCapital : profile.availableCapital;
  const recommendedLoan = calc ? calc.loanAmount : Math.max(0, startupCost - ownContribution);
  const interestRate = calc ? calc.interestRate : 9.5;
  const tenureMonths = calc ? calc.tenureMonths : 36;
  const estimatedEMI = calc ? calc.monthlyEMI : Math.round((recommendedLoan * 0.032));
  const estimatedMonthlyProfit = business.expectedMonthlyProfit;
  const paybackMonths = business.paybackPeriodMonths;

  const locationText = [
    profile.location.village,
    profile.location.block,
    profile.location.district,
    profile.location.state,
  ]
    .filter(Boolean)
    .join(', ') || 'Rural District';

  return {
    id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: profile.id,
    businessId: business.id,
    businessTitle: business.title,
    createdAt: new Date().toISOString(),
    userSummary: {
      name: profile.name,
      locationText,
      availableCapital: ownContribution,
      monthlyIncome: profile.monthlyIncome,
    },
    executiveSummary: `The proposed project "${business.title}" is located in ${locationText}. It aims to serve a captive customer base of ${business.potentialCustomers}. The enterprise satisfies an unmet local demand (${business.marketGaps[0] || 'critical daily need'}), utilizing ${profile.skills || 'practical village trades'}. With an initial project layout of ₹${startupCost.toLocaleString('en-IN')}, the venture is estimated to generate ₹${estimatedMonthlyProfit.toLocaleString('en-IN')} in net monthly income, delivering a projected payback within ${paybackMonths} months.`,
    marketAnalysis: {
      demandLevel: `${business.localDemandLevel} local demand across ${profile.location.block || 'nearby panchayats'}.`,
      customerBase: business.potentialCustomers,
      competitionLevel: `${business.competitorDensity}. Low barrier to build trusted repeat business.`,
      unmetNeed: business.marketGaps[0] || 'Eliminates travel distance to tehsil and provides reliable, unadulterated service.',
    },
    financialSummary: {
      totalStartupCost: startupCost,
      ownContribution,
      recommendedLoan,
      estimatedMonthlyProfit,
      estimatedEMI,
      tenureMonths,
      interestRate,
      paybackMonths,
    },
    swot: {
      strengths: [
        `Direct access to local village customer base in ${profile.location.village || 'block center'}`,
        'Low overhead expenses compared to urban commercial setups',
        'Daily or weekly cash-flow liquidity with minimal credit default risk',
        `Applicant experience in ${profile.skills || 'practical hands-on trade'}`,
      ],
      weaknesses: [
        'Initial vulnerability to local 3-phase power outages or transport delays',
        'Working capital constraints in the first 60 days of setup',
        'Limited digital marketing reach beyond immediate gram panchayats',
      ],
      opportunities: [
        `Eligible for government margin money subsidy under ${business.suitableSchemes.join(', ').toUpperCase()}`,
        'Expansion into neighboring villages via weekly haats and farmer groups',
        'Product diversification into custom value-added blends and byproducts',
      ],
      threats: [
        business.keyRisks[0] || 'Seasonal crop yield fluctuations affecting local purchasing power',
        'Unscheduled voltage surges requiring protective power equipment',
        'Rise in raw material procurement prices during harvest offseason',
      ],
    },
    recommendedSchemes: business.suitableSchemes,
    mitigationStrategies: [
      business.riskMitigation[0] || 'Maintain 2 months working capital reserve in cash buffer.',
      'Purchase certified ISI machinery backed by supplier warranty and local spare parts.',
      'Utilize digital UPI QR codes to accelerate same-day customer cash recovery.',
      'Adopt clean, hygienic packaging standards to earn word-of-mouth community trust.',
    ],
    actionPlan30Days: [
      'Days 1-7: Finalize premises rent/lease deed or shed site in village center and obtain Panchayat NOC.',
      'Days 8-14: Secure competitive machinery quotations from at least two certified manufacturers for DPR submission.',
      'Days 15-21: Submit online PMEGP/Mudra application through portal with Udyam Aadhaar registration.',
      'Days 22-26: Complete physical bank inspection with branch manager and inspect 3-phase electrical connection.',
      'Days 27-30: Install primary machinery, test trial batch with sample customers, and organize community launch.',
    ],
    dataDisclaimer:
      'This report is generated based on rural industry benchmark assumptions and applicant profile inputs. It is intended for project planning and loan appraisal preparation. Final loan sanction, interest rates, and subsidy disbursement are subject to lending bank inspection and scheme guidelines.',
  };
}
