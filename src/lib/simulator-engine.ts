export interface SimulatorBaseline {
  projectId: string;
  projectName: string;
  revenue_year1: number;
  opex_annual: number;
  capex: number;
  growth_rate: number;
  break_even_months: number;
  gross_margin: number;
  customer_count: number;
  cac: number;
  churn_rate: number;
}

export interface ScenarioInput {
  name: string;
  revenue_year1: number;
  opex_annual: number;
  capex: number;
  growth_rate: number;
  customer_count: number;
  cac: number;
  churn_rate: number;
}

export interface SimulationResult {
  id: string;
  scenarioName: string;
  timestamp: number;
  input: ScenarioInput;
  metrics: {
    annual_revenue: number;
    annual_opex: number;
    net_profit: number;
    profit_margin: number;
    break_even_months: number;
    roi_percent: number;
    ltv: number;
    ltv_cac_ratio: number;
    year2_revenue: number;
    year3_revenue: number;
    payback_period_months: number;
    cash_runway_months: number;
  };
  deltas: Record<string, { value: number; percent: number; direction: 'up' | 'down' | 'flat' }>;
  feasibility: 'highly_feasible' | 'feasible' | 'marginal' | 'not_feasible';
  confidence: number;
  warnings: string[];
  recommendation: string;
}

export const PROJECT_BASELINES: SimulatorBaseline[] = [
  {
    projectId: 'saudi-business',
    projectName: 'Saudi Business',
    revenue_year1: 240000,
    opex_annual: 180000,
    capex: 120000,
    growth_rate: 15,
    break_even_months: 18,
    gross_margin: 65,
    customer_count: 50,
    cac: 800,
    churn_rate: 5,
  },
  {
    projectId: 'qarar',
    projectName: 'Qarar AI',
    revenue_year1: 360000,
    opex_annual: 240000,
    capex: 200000,
    growth_rate: 20,
    break_even_months: 14,
    gross_margin: 72,
    customer_count: 15,
    cac: 3000,
    churn_rate: 3,
  },
  {
    projectId: 'signalpost',
    projectName: 'SignalPost',
    revenue_year1: 180000,
    opex_annual: 120000,
    capex: 80000,
    growth_rate: 25,
    break_even_months: 12,
    gross_margin: 78,
    customer_count: 100,
    cac: 200,
    churn_rate: 8,
  },
  {
    projectId: 'sponsorloop',
    projectName: 'SponsorLoop',
    revenue_year1: 300000,
    opex_annual: 200000,
    capex: 150000,
    growth_rate: 18,
    break_even_months: 16,
    gross_margin: 60,
    customer_count: 30,
    cac: 1500,
    churn_rate: 6,
  },
  {
    projectId: 'eada',
    projectName: 'EADA',
    revenue_year1: 280000,
    opex_annual: 190000,
    capex: 140000,
    growth_rate: 12,
    break_even_months: 20,
    gross_margin: 58,
    customer_count: 20,
    cac: 2500,
    churn_rate: 4,
  },
];

function generateId(): string {
  return `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function runSimulation(
  baseline: SimulatorBaseline,
  input: ScenarioInput
): SimulationResult {
  const warnings: string[] = [];

  const annual_revenue = input.revenue_year1;
  const annual_opex = input.opex_annual;
  const net_profit = annual_revenue - annual_opex;
  const profit_margin = annual_revenue > 0 ? (net_profit / annual_revenue) * 100 : 0;

  const monthly_profit = net_profit / 12;
  const break_even_months =
    monthly_profit > 0 ? Math.ceil(input.capex / monthly_profit) : 999;

  const roi_percent =
    input.capex > 0 ? ((net_profit - input.capex) / input.capex) * 100 : 0;

  const growthMultiplier = 1 + input.growth_rate / 100;
  const year2_revenue = annual_revenue * growthMultiplier;
  const year3_revenue = year2_revenue * growthMultiplier;

  const avg_revenue_per_customer =
    input.customer_count > 0 ? annual_revenue / input.customer_count : 0;
  const monthly_arpu = avg_revenue_per_customer / 12;
  const churnDecimal = input.churn_rate / 100;
  const ltv =
    churnDecimal > 0 ? monthly_arpu / churnDecimal : monthly_arpu * 60;
  const ltv_cac_ratio = input.cac > 0 ? ltv / input.cac : 0;

  const payback_period_months =
    monthly_arpu > 0 ? Math.ceil(input.cac / monthly_arpu) : 999;

  const monthly_burn = annual_opex / 12;
  const cash_runway_months =
    monthly_burn > 0 ? Math.round(input.capex / monthly_burn) : 0;

  const delta = (current: number, base: number) => {
    const diff = current - base;
    const pct = base !== 0 ? (diff / base) * 100 : 0;
    return {
      value: diff,
      percent: Math.round(pct * 10) / 10,
      direction: (diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat') as 'up' | 'down' | 'flat',
    };
  };

  const baseProfit = baseline.revenue_year1 - baseline.opex_annual;
  const baseMargin =
    baseline.revenue_year1 > 0
      ? (baseProfit / baseline.revenue_year1) * 100
      : 0;
  const baseRoi =
    baseline.capex > 0
      ? ((baseProfit - baseline.capex) / baseline.capex) * 100
      : 0;

  const deltas: SimulationResult['deltas'] = {
    revenue: delta(annual_revenue, baseline.revenue_year1),
    opex: delta(annual_opex, baseline.opex_annual),
    net_profit: delta(net_profit, baseProfit),
    profit_margin: delta(profit_margin, baseMargin),
    break_even: delta(break_even_months, baseline.break_even_months),
    roi: delta(roi_percent, baseRoi),
  };

  if (input.revenue_year1 > baseline.revenue_year1 * 1.5) {
    warnings.push(
      'Revenue projection exceeds 150% of baseline — validate demand assumptions'
    );
  }
  if (input.opex_annual < baseline.opex_annual * 0.5) {
    warnings.push(
      'Operating costs below 50% of baseline — verify cost-reduction feasibility'
    );
  }
  if (profit_margin < 0) {
    warnings.push('Scenario produces negative margins — not sustainable long-term');
  }
  if (break_even_months > 36) {
    warnings.push('Break-even exceeds 3 years — consider reducing capital intensity');
  }
  if (ltv_cac_ratio < 1) {
    warnings.push('LTV/CAC ratio below 1 — customer acquisition is not profitable');
  }

  let feasibility: SimulationResult['feasibility'];
  let confidence: number;

  if (profit_margin >= 20 && break_even_months <= 18 && ltv_cac_ratio >= 3) {
    feasibility = 'highly_feasible';
    confidence = 85;
  } else if (profit_margin >= 10 && break_even_months <= 24 && ltv_cac_ratio >= 1.5) {
    feasibility = 'feasible';
    confidence = 70;
  } else if (profit_margin >= 0 && break_even_months <= 36) {
    feasibility = 'marginal';
    confidence = 50;
  } else {
    feasibility = 'not_feasible';
    confidence = 30;
  }

  if (warnings.length > 0) {
    confidence = Math.max(20, confidence - warnings.length * 10);
  }

  const feasibilityLabels: Record<string, string> = {
    highly_feasible: 'Highly Favorable',
    feasible: 'Favorable',
    marginal: 'Marginal',
    not_feasible: 'Not Recommended',
  };

  let recommendation = `${feasibilityLabels[feasibility]}. `;
  if (feasibility === 'highly_feasible') {
    recommendation +=
      'Strong financial indicators across all metrics. This scenario is well-positioned for execution.';
  } else if (feasibility === 'feasible') {
    recommendation +=
      'Positive outlook with acceptable risk. Monitor key assumptions during execution.';
  } else if (feasibility === 'marginal') {
    recommendation +=
      'Borderline viability. Reduce costs or increase revenue before committing capital.';
  } else {
    recommendation +=
      'This scenario does not meet minimum viability thresholds. Revise key parameters.';
  }

  return {
    id: generateId(),
    scenarioName: input.name,
    timestamp: Date.now(),
    input,
    metrics: {
      annual_revenue,
      annual_opex,
      net_profit,
      profit_margin: Math.round(profit_margin * 10) / 10,
      break_even_months,
      roi_percent: Math.round(roi_percent * 10) / 10,
      ltv: Math.round(ltv),
      ltv_cac_ratio: Math.round(ltv_cac_ratio * 10) / 10,
      year2_revenue: Math.round(year2_revenue),
      year3_revenue: Math.round(year3_revenue),
      payback_period_months,
      cash_runway_months,
    },
    deltas,
    feasibility,
    confidence,
    warnings,
    recommendation,
  };
}

export function formatSAR(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M SAR`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K SAR`;
  }
  return `${value.toLocaleString()} SAR`;
}

export function feasibilityColor(f: SimulationResult['feasibility']): string {
  switch (f) {
    case 'highly_feasible':
      return 'var(--color-green)';
    case 'feasible':
      return 'var(--color-cyan)';
    case 'marginal':
      return 'var(--color-yellow)';
    case 'not_feasible':
      return 'var(--color-red)';
  }
}

export function feasibilityLabel(f: SimulationResult['feasibility']): string {
  switch (f) {
    case 'highly_feasible':
      return 'Highly Feasible';
    case 'feasible':
      return 'Feasible';
    case 'marginal':
      return 'Marginal';
    case 'not_feasible':
      return 'Not Feasible';
  }
}
