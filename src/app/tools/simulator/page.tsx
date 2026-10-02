'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocale } from '@/lib/locale-context';
import {
  PROJECT_BASELINES,
  runSimulation,
  formatSAR,
  feasibilityColor,
  feasibilityLabel,
  type SimulatorBaseline,
  type ScenarioInput,
  type SimulationResult,
} from '@/lib/simulator-engine';

type Phase = 'select' | 'configure' | 'result';

const STORAGE_KEY = 'jd_simulator_scenarios';

function loadSavedScenarios(): SimulationResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistScenarios(scenarios: SimulationResult[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch { /* quota exceeded — silent */ }
}

export default function SimulatorPage() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';

  const [phase, setPhase] = useState<Phase>('select');
  const [selectedProject, setSelectedProject] = useState<SimulatorBaseline | null>(null);
  const [scenarioName, setScenarioName] = useState('');
  const [inputs, setInputs] = useState<ScenarioInput>({
    name: '',
    revenue_year1: 0,
    opex_annual: 0,
    capex: 0,
    growth_rate: 0,
    customer_count: 0,
    cac: 0,
    churn_rate: 0,
  });
  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<SimulationResult[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    setSavedScenarios(loadSavedScenarios());
  }, []);

  const selectProject = useCallback((baseline: SimulatorBaseline) => {
    setSelectedProject(baseline);
    setInputs({
      name: '',
      revenue_year1: baseline.revenue_year1,
      opex_annual: baseline.opex_annual,
      capex: baseline.capex,
      growth_rate: baseline.growth_rate,
      customer_count: baseline.customer_count,
      cac: baseline.cac,
      churn_rate: baseline.churn_rate,
    });
    setPhase('configure');
  }, []);

  const handleInputChange = useCallback((field: keyof ScenarioInput, value: string) => {
    if (field === 'name') {
      setScenarioName(value);
      setInputs(prev => ({ ...prev, name: value }));
    } else {
      setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    }
  }, []);

  const executeSimulation = useCallback(() => {
    if (!selectedProject) return;
    const finalInput = { ...inputs, name: scenarioName || 'Unnamed Scenario' };
    const result = runSimulation(selectedProject, finalInput);
    setCurrentResult(result);

    const updated = [...savedScenarios, result];
    setSavedScenarios(updated);
    persistScenarios(updated);

    setPhase('result');
  }, [selectedProject, inputs, scenarioName, savedScenarios]);

  const startNewScenario = useCallback(() => {
    if (!selectedProject) return;
    setScenarioName('');
    setInputs({
      name: '',
      revenue_year1: selectedProject.revenue_year1,
      opex_annual: selectedProject.opex_annual,
      capex: selectedProject.capex,
      growth_rate: selectedProject.growth_rate,
      customer_count: selectedProject.customer_count,
      cac: selectedProject.cac,
      churn_rate: selectedProject.churn_rate,
    });
    setCurrentResult(null);
    setShowCompare(false);
    setPhase('configure');
  }, [selectedProject]);

  const resetToSelect = useCallback(() => {
    setSelectedProject(null);
    setCurrentResult(null);
    setShowCompare(false);
    setPhase('select');
  }, []);

  const labels = {
    title: isAr ? 'محاكي القرارات' : 'Decision Simulator',
    subtitle: isAr ? 'اختبر تأثير التغييرات على نتائج الأعمال' : 'Test how changes affect business outcomes',
    selectProject: isAr ? 'اختر المشروع' : 'Select Project',
    selectStudy: isAr ? 'اختر الدراسة' : 'Select Study',
    configure: isAr ? 'إعدادات السيناريو' : 'Scenario Configuration',
    results: isAr ? 'النتائج' : 'Results',
    run: isAr ? 'تشغيل المحاكاة' : 'Run Simulation',
    newScenario: isAr ? 'سيناريو جديد' : 'New Scenario',
    compare: isAr ? 'مقارنة السيناريوهات' : 'Compare Scenarios',
    back: isAr ? 'رجوع' : 'Back',
    baseline: isAr ? 'خط الأساس' : 'Baseline',
    scenario: isAr ? 'السيناريو' : 'Scenario',
    delta: isAr ? 'الفرق' : 'Delta',
    hypothetical: isAr ? 'هذه محاكاة افتراضية — لا يتم تطبيق أي تغييرات على البيانات الفعلية' : 'This is a hypothetical simulation — no changes are applied to actual data',
    scenarioName: isAr ? 'اسم السيناريو' : 'Scenario Name',
    revenue: isAr ? 'الإيرادات (السنة 1)' : 'Revenue (Year 1)',
    opex: isAr ? 'المصاريف التشغيلية' : 'Operating Expenses',
    capex: isAr ? 'رأس المال' : 'Capital Investment',
    growth: isAr ? 'معدل النمو %' : 'Growth Rate %',
    customers: isAr ? 'عدد العملاء' : 'Customer Count',
    cacLabel: isAr ? 'تكلفة اكتساب العميل' : 'Customer Acquisition Cost',
    churn: isAr ? 'معدل الانسحاب %' : 'Churn Rate %',
  };

  return (
    <div data-testid="simulator-page" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{labels.title}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">{labels.subtitle}</p>
      </div>

      {phase === 'select' && (
        <SelectPhase
          baselines={PROJECT_BASELINES}
          onSelectProject={selectProject}
          labels={labels}
          isAr={isAr}
        />
      )}

      {phase === 'configure' && selectedProject && (
        <ConfigurePhase
          baseline={selectedProject}
          inputs={inputs}
          scenarioName={scenarioName}
          onInputChange={handleInputChange}
          onRun={executeSimulation}
          onBack={resetToSelect}
          labels={labels}
          isAr={isAr}
        />
      )}

      {phase === 'result' && currentResult && selectedProject && (
        <ResultPhase
          baseline={selectedProject}
          result={currentResult}
          savedScenarios={savedScenarios}
          showCompare={showCompare}
          onToggleCompare={() => setShowCompare(!showCompare)}
          onNewScenario={startNewScenario}
          onBack={resetToSelect}
          labels={labels}
          isAr={isAr}
        />
      )}
    </div>
  );
}

function SelectPhase({
  baselines,
  onSelectProject,
  labels,
  isAr,
}: {
  baselines: SimulatorBaseline[];
  onSelectProject: (b: SimulatorBaseline) => void;
  labels: Record<string, string>;
  isAr: boolean;
}) {
  return (
    <div data-testid="simulator-select">
      <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
        {labels.selectProject}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {baselines.map((b) => (
          <button
            key={b.projectId}
            data-testid={`simulator-project-${b.projectId}`}
            onClick={() => onSelectProject(b)}
            className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-5 text-left transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-card-hover)]"
          >
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              {b.projectName}
            </h3>
            <div className="mt-3 space-y-1.5 text-xs text-[var(--color-text-secondary)]">
              <div className="flex justify-between">
                <span>{isAr ? 'الإيرادات' : 'Revenue'}</span>
                <span className="font-medium text-[var(--color-green)]">{formatSAR(b.revenue_year1)}</span>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? 'المصاريف' : 'OPEX'}</span>
                <span className="font-medium">{formatSAR(b.opex_annual)}</span>
              </div>
              <div className="flex justify-between">
                <span>{isAr ? 'هامش الربح' : 'Margin'}</span>
                <span className="font-medium">{b.gross_margin}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ConfigurePhase({
  baseline,
  inputs,
  scenarioName,
  onInputChange,
  onRun,
  onBack,
  labels,
  isAr,
}: {
  baseline: SimulatorBaseline;
  inputs: ScenarioInput;
  scenarioName: string;
  onInputChange: (field: keyof ScenarioInput, value: string) => void;
  onRun: () => void;
  onBack: () => void;
  labels: Record<string, string>;
  isAr: boolean;
}) {
  const fields: { key: keyof ScenarioInput; label: string; baseline: number; unit: string }[] = [
    { key: 'revenue_year1', label: labels.revenue, baseline: baseline.revenue_year1, unit: 'SAR' },
    { key: 'opex_annual', label: labels.opex, baseline: baseline.opex_annual, unit: 'SAR' },
    { key: 'capex', label: labels.capex, baseline: baseline.capex, unit: 'SAR' },
    { key: 'growth_rate', label: labels.growth, baseline: baseline.growth_rate, unit: '%' },
    { key: 'customer_count', label: labels.customers, baseline: baseline.customer_count, unit: '' },
    { key: 'cac', label: labels.cacLabel, baseline: baseline.cac, unit: 'SAR' },
    { key: 'churn_rate', label: labels.churn, baseline: baseline.churn_rate, unit: '%' },
  ];

  return (
    <div data-testid="simulator-configure">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-lg border border-[var(--color-border-primary)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          {labels.back}
        </button>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {labels.configure} — {baseline.projectName}
        </h2>
      </div>

      <div className="mb-6">
        <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
          {labels.scenarioName}
        </label>
        <input
          data-testid="scenario-name-input"
          type="text"
          value={scenarioName}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder={isAr ? 'مثال: زيادة السعر 10%' : 'e.g. Price Increase +10%'}
          className="w-full max-w-md rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(({ key, label, baseline: baseVal, unit }) => {
          const current = inputs[key] as number;
          const diff = baseVal !== 0 ? ((current - baseVal) / baseVal) * 100 : 0;
          const diffColor =
            Math.abs(diff) < 0.5
              ? 'text-[var(--color-text-tertiary)]'
              : diff > 0
                ? key === 'opex_annual' || key === 'cac' || key === 'churn_rate'
                  ? 'text-[var(--color-red)]'
                  : 'text-[var(--color-green)]'
                : key === 'revenue_year1' || key === 'customer_count' || key === 'growth_rate'
                  ? 'text-[var(--color-red)]'
                  : 'text-[var(--color-green)]';

          return (
            <div
              key={key}
              className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4"
            >
              <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">
                {label}
              </label>
              <div className="mb-2 text-[10px] text-[var(--color-text-tertiary)]">
                {isAr ? 'خط الأساس' : 'Baseline'}: {baseVal.toLocaleString()} {unit}
              </div>
              <input
                data-testid={`simulator-input-${key}`}
                type="number"
                value={current}
                onChange={(e) => onInputChange(key, e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
              />
              {Math.abs(diff) >= 0.5 && (
                <div className={`mt-1.5 text-xs font-medium ${diffColor}`}>
                  {diff > 0 ? '+' : ''}{diff.toFixed(1)}% {isAr ? 'من الأساس' : 'from baseline'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <button
          data-testid="run-simulation-btn"
          onClick={onRun}
          className="rounded-lg bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-light)]"
        >
          {labels.run}
        </button>
      </div>
    </div>
  );
}

function ResultPhase({
  baseline,
  result,
  savedScenarios,
  showCompare,
  onToggleCompare,
  onNewScenario,
  onBack,
  labels,
  isAr,
}: {
  baseline: SimulatorBaseline;
  result: SimulationResult;
  savedScenarios: SimulationResult[];
  showCompare: boolean;
  onToggleCompare: () => void;
  onNewScenario: () => void;
  onBack: () => void;
  labels: Record<string, string>;
  isAr: boolean;
}) {
  const m = result.metrics;

  const baseProfit = baseline.revenue_year1 - baseline.opex_annual;
  const baseMargin =
    baseline.revenue_year1 > 0 ? (baseProfit / baseline.revenue_year1) * 100 : 0;

  const rows: { label: string; baseline: string; scenario: string; delta: string; deltaDir: 'up' | 'down' | 'flat' }[] = [
    {
      label: isAr ? 'الإيرادات السنوية' : 'Annual Revenue',
      baseline: formatSAR(baseline.revenue_year1),
      scenario: formatSAR(m.annual_revenue),
      delta: `${result.deltas.revenue.percent > 0 ? '+' : ''}${result.deltas.revenue.percent}%`,
      deltaDir: result.deltas.revenue.direction,
    },
    {
      label: isAr ? 'المصاريف التشغيلية' : 'Annual OPEX',
      baseline: formatSAR(baseline.opex_annual),
      scenario: formatSAR(m.annual_opex),
      delta: `${result.deltas.opex.percent > 0 ? '+' : ''}${result.deltas.opex.percent}%`,
      deltaDir: result.deltas.opex.direction === 'up' ? 'down' : result.deltas.opex.direction === 'down' ? 'up' : 'flat',
    },
    {
      label: isAr ? 'صافي الربح' : 'Net Profit',
      baseline: formatSAR(baseProfit),
      scenario: formatSAR(m.net_profit),
      delta: `${result.deltas.net_profit.percent > 0 ? '+' : ''}${result.deltas.net_profit.percent}%`,
      deltaDir: result.deltas.net_profit.direction,
    },
    {
      label: isAr ? 'هامش الربح' : 'Profit Margin',
      baseline: `${baseMargin.toFixed(1)}%`,
      scenario: `${m.profit_margin}%`,
      delta: `${result.deltas.profit_margin.value > 0 ? '+' : ''}${result.deltas.profit_margin.value.toFixed(1)}pts`,
      deltaDir: result.deltas.profit_margin.direction,
    },
    {
      label: isAr ? 'نقطة التعادل' : 'Break-Even',
      baseline: `${baseline.break_even_months} mo`,
      scenario: `${m.break_even_months} mo`,
      delta: `${result.deltas.break_even.value > 0 ? '+' : ''}${result.deltas.break_even.value} mo`,
      deltaDir: result.deltas.break_even.direction === 'up' ? 'down' : result.deltas.break_even.direction === 'down' ? 'up' : 'flat',
    },
    {
      label: isAr ? 'العائد على الاستثمار' : 'ROI',
      baseline: `${((baseProfit - baseline.capex) / (baseline.capex || 1) * 100).toFixed(1)}%`,
      scenario: `${m.roi_percent}%`,
      delta: `${result.deltas.roi.percent > 0 ? '+' : ''}${result.deltas.roi.value.toFixed(1)}pts`,
      deltaDir: result.deltas.roi.direction,
    },
  ];

  const deltaColor = (dir: 'up' | 'down' | 'flat') =>
    dir === 'up' ? 'text-[var(--color-green)]' : dir === 'down' ? 'text-[var(--color-red)]' : 'text-[var(--color-text-tertiary)]';

  return (
    <div data-testid="simulator-result">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-lg border border-[var(--color-border-primary)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          {labels.back}
        </button>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {labels.results} — {result.scenarioName}
        </h2>
        <div className="ml-auto flex gap-2">
          <button
            data-testid="new-scenario-btn"
            onClick={onNewScenario}
            className="rounded-lg border border-[var(--color-border-primary)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            {labels.newScenario}
          </button>
          {savedScenarios.length > 1 && (
            <button
              data-testid="compare-scenarios-btn"
              onClick={onToggleCompare}
              className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-accent-light)]"
            >
              {labels.compare}
            </button>
          )}
        </div>
      </div>

      <div
        data-testid="hypothetical-banner"
        className="mb-6 rounded-lg border border-[var(--color-yellow)]/30 bg-[var(--color-yellow)]/5 px-4 py-3 text-xs text-[var(--color-yellow)]"
      >
        {labels.hypothetical}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div data-testid="decision-impact" className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
          <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">
            {isAr ? 'تقييم الجدوى' : 'Feasibility'}
          </div>
          <div className="text-lg font-bold" style={{ color: feasibilityColor(result.feasibility) }}>
            {feasibilityLabel(result.feasibility)}
          </div>
          <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
            {isAr ? 'الثقة' : 'Confidence'}: {result.confidence}%
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
          <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">
            {isAr ? 'صافي الربح' : 'Net Profit'}
          </div>
          <div className={`text-lg font-bold ${m.net_profit >= 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}`}>
            {formatSAR(m.net_profit)}
          </div>
          <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
            {isAr ? 'هامش' : 'Margin'}: {m.profit_margin}%
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
          <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">LTV/CAC</div>
          <div className={`text-lg font-bold ${m.ltv_cac_ratio >= 3 ? 'text-[var(--color-green)]' : m.ltv_cac_ratio >= 1 ? 'text-[var(--color-yellow)]' : 'text-[var(--color-red)]'}`}>
            {m.ltv_cac_ratio}x
          </div>
          <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
            LTV: {formatSAR(m.ltv)}
          </div>
        </div>

        <div data-testid="trust-panel" className="rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
          <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">
            {isAr ? 'نقطة التعادل' : 'Break-Even'}
          </div>
          <div className="text-lg font-bold text-[var(--color-text-primary)]">
            {m.break_even_months >= 999 ? 'N/A' : `${m.break_even_months} mo`}
          </div>
          <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
            ROI: {m.roi_percent}%
          </div>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="mb-6 space-y-2">
          {result.warnings.map((w, i) => (
            <div key={i} className="rounded-lg border border-[var(--color-orange)]/30 bg-[var(--color-orange)]/5 px-4 py-2 text-xs text-[var(--color-orange)]">
              {w}
            </div>
          ))}
        </div>
      )}

      <div className="mb-6 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] p-4">
        <div className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">
          {isAr ? 'التوصية' : 'Recommendation'}
        </div>
        <p className="text-sm text-[var(--color-text-primary)]">{result.recommendation}</p>
      </div>

      <div data-testid="result-comparison-table" className="overflow-x-auto rounded-xl border border-[var(--color-border-primary)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)]">
                {isAr ? 'المقياس' : 'Metric'}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-tertiary)]">
                {labels.baseline}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-tertiary)]">
                {labels.scenario}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-tertiary)]">
                {labels.delta}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-[var(--color-border-primary)] last:border-0">
                <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{row.label}</td>
                <td className="px-4 py-3 text-right text-[var(--color-text-secondary)]">{row.baseline}</td>
                <td className="px-4 py-3 text-right text-[var(--color-text-primary)]">{row.scenario}</td>
                <td className={`px-4 py-3 text-right font-medium ${deltaColor(row.deltaDir)}`}>{row.delta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {savedScenarios.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-secondary)]">
            {isAr ? 'السيناريوهات المحفوظة' : 'Saved Scenarios'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {savedScenarios.map((s, i) => (
              <div
                key={s.id}
                data-testid={`saved-scenario-${i}`}
                className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] px-3 py-2 text-xs"
              >
                <span className="font-medium text-[var(--color-text-primary)]">{s.scenarioName}</span>
                <span className="ml-2" style={{ color: feasibilityColor(s.feasibility) }}>
                  {feasibilityLabel(s.feasibility)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCompare && savedScenarios.length > 1 && (
        <div data-testid="compare-table" className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-border-primary)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)]">
                  {isAr ? 'المقياس' : 'Metric'}
                </th>
                {savedScenarios.map((s) => (
                  <th key={s.id} className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-tertiary)]">
                    {s.scenarioName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: isAr ? 'الإيرادات' : 'Revenue', get: (s: SimulationResult) => formatSAR(s.metrics.annual_revenue) },
                { label: isAr ? 'صافي الربح' : 'Net Profit', get: (s: SimulationResult) => formatSAR(s.metrics.net_profit) },
                { label: isAr ? 'هامش الربح' : 'Margin', get: (s: SimulationResult) => `${s.metrics.profit_margin}%` },
                { label: isAr ? 'نقطة التعادل' : 'Break-Even', get: (s: SimulationResult) => `${s.metrics.break_even_months} mo` },
                { label: 'ROI', get: (s: SimulationResult) => `${s.metrics.roi_percent}%` },
                { label: 'LTV/CAC', get: (s: SimulationResult) => `${s.metrics.ltv_cac_ratio}x` },
                { label: isAr ? 'الجدوى' : 'Feasibility', get: (s: SimulationResult) => feasibilityLabel(s.feasibility) },
              ].map((row, i) => (
                <tr key={i} className="border-b border-[var(--color-border-primary)] last:border-0">
                  <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{row.label}</td>
                  {savedScenarios.map((s) => (
                    <td key={s.id} className="px-4 py-3 text-right text-[var(--color-text-secondary)]">
                      {row.get(s)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
