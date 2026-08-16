import type {
  Project,
  Artifact,
  Task,
  Scores,
  PriorityRecommendation,
  TaskStatus,
  TaskCategory,
  ArtifactStatus,
  LifecycleStage,
  StageStatus,
} from '@/types/project';

// ---------------------------------------------------------------------------
// Configurable weights (must sum to 1.0)
// ---------------------------------------------------------------------------

export const PRIORITY_WEIGHTS = {
  product: 0.10,
  technical: 0.10,
  qa: 0.08,
  deployment: 0.10,
  commercial: 0.08,
  artifacts: 0.07,
  market: 0.12,
  revenue: 0.15,
  easeOfSelling: 0.08,
  remainingEffort: 0.07, // inverse
  blockerSeverity: 0.05, // inverse
} as const;

// ---------------------------------------------------------------------------
// Task-category helpers
// ---------------------------------------------------------------------------

const CATEGORY_GROUPS: Record<string, TaskCategory[]> = {
  product: ['Product', 'UX'],
  technical: ['Frontend', 'Backend', 'Database', 'AI', 'Security'],
  qa: ['QA'],
  deployment: ['Deployment'],
  commercial: ['Business', 'Marketing', 'Sales', 'Finance'],
};

function tasksByCategories(tasks: Task[], categories: TaskCategory[]): Task[] {
  return tasks.filter((t) => categories.includes(t.category));
}

/** Percentage of tasks resolved in the given categories (0-100). */
function categoryReadiness(tasks: Task[], categories: TaskCategory[]): number {
  const subset = tasksByCategories(tasks, categories);
  if (subset.length === 0) return 50; // no data -> neutral
  const resolved = subset.filter((t) => t.status === 'resolved').length;
  return (resolved / subset.length) * 100;
}

// ---------------------------------------------------------------------------
// Lifecycle helpers
// ---------------------------------------------------------------------------

const STAGE_VALUE: Record<StageStatus, number> = {
  complete: 100,
  in_progress: 50,
  blocked: 20,
  not_started: 0,
};

function lifecycleProgress(lifecycle: Record<LifecycleStage, StageStatus>): number {
  const stages = Object.values(lifecycle);
  if (stages.length === 0) return 0;
  const total = stages.reduce((sum, s) => sum + STAGE_VALUE[s], 0);
  return total / stages.length;
}

// ---------------------------------------------------------------------------
// Artifact readiness
// ---------------------------------------------------------------------------

/**
 * Percentage of artifacts that are READY (0-100).
 * Artifacts with status NOT_REQUIRED are excluded from the calculation.
 */
export function calculateArtifactReadiness(artifacts: Artifact[]): number {
  const relevant = artifacts.filter((a) => a.status !== 'NOT_REQUIRED');
  if (relevant.length === 0) return 50; // no data -> neutral
  const ready = relevant.filter((a) => a.status === 'READY').length;
  return (ready / relevant.length) * 100;
}

// ---------------------------------------------------------------------------
// Remaining effort (0-100, where 100 = most effort remaining)
// ---------------------------------------------------------------------------

export function calculateRemainingEffort(project: Project): number {
  const { tasks, lifecycle } = project;
  if (tasks.length === 0) return 80; // no tasks = lots of unknown work

  const pending = tasks.filter((t) => t.status !== 'resolved').length;
  const taskRatio = (pending / tasks.length) * 100;

  const stageProgress = lifecycleProgress(lifecycle);
  const stageRemaining = 100 - stageProgress;

  // Blend: 60% task-based, 40% lifecycle-based
  return Math.round(taskRatio * 0.6 + stageRemaining * 0.4);
}

// ---------------------------------------------------------------------------
// Blocker analysis
// ---------------------------------------------------------------------------

const PRIORITY_SEVERITY: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

interface BlockerAnalysis {
  count: number;
  maxSeverity: number; // 0-4
  severityScore: number; // 0-100 where 100 is worst
  hasCritical: boolean;
}

function analyzeBlockers(tasks: Task[]): BlockerAnalysis {
  const blockers = tasks.filter((t) => t.status === 'blocker');
  if (blockers.length === 0) {
    return { count: 0, maxSeverity: 0, severityScore: 0, hasCritical: false };
  }
  const maxSeverity = Math.max(...blockers.map((b) => PRIORITY_SEVERITY[b.priority] ?? 1));
  const totalSeverity = blockers.reduce((s, b) => s + (PRIORITY_SEVERITY[b.priority] ?? 1), 0);
  // Normalize: each critical blocker adds 25 points, cap at 100
  const severityScore = Math.min(100, totalSeverity * 12.5);
  const hasCritical = blockers.some((b) => b.priority === 'critical');
  return { count: blockers.length, maxSeverity, severityScore, hasCritical };
}

// ---------------------------------------------------------------------------
// Market attractiveness (0-100)
// ---------------------------------------------------------------------------

const PAIN_LEVEL_SCORE: Record<string, number> = {
  Critical: 100,
  High: 75,
  Medium: 50,
  Low: 25,
};

function calculateMarketScore(project: Project): number {
  const { market, competitors } = project;
  let score = 0;

  // Pain level (40% of market score)
  score += (PAIN_LEVEL_SCORE[market.painLevel] ?? 50) * 0.4;

  // Market sizing data available (20%)
  const hasMarketData = [market.tam, market.sam, market.som].filter(Boolean).length;
  score += (hasMarketData / 3) * 100 * 0.2;

  // Competitive landscape (20%) - having competitors = validated market
  if (competitors.length > 0) {
    const advantages = competitors.reduce((s, c) => s + c.weDoBetter.length, 0);
    const disadvantages = competitors.reduce((s, c) => s + c.theyDoBetter.length, 0);
    const ratio = disadvantages > 0 ? advantages / (advantages + disadvantages) : 0.7;
    score += ratio * 100 * 0.2;
  } else {
    score += 30 * 0.2; // no competitor data = uncertain
  }

  // Geographic opportunity breadth (20%)
  const geoFields = [market.saudiOpportunity, market.gccOpportunity, market.globalOpportunity];
  const filledGeo = geoFields.filter((g) => g && g.length > 0).length;
  score += (filledGeo / 3) * 100 * 0.2;

  return Math.round(score);
}

// ---------------------------------------------------------------------------
// Revenue potential (0-100)
// ---------------------------------------------------------------------------

function calculateRevenueScore(project: Project): number {
  const { financials, commercial } = project;
  let score = 0;

  // Has pricing model (20%)
  if (financials.pricingModel && financials.pricingModel.length > 0) score += 20;

  // Revenue streams defined (20%)
  const streams = [
    financials.setupFee,
    financials.subscription,
    financials.serviceRevenue,
    financials.commission,
    financials.transactionFee,
  ].filter((v) => v !== undefined && v > 0).length;
  score += Math.min(20, streams * 7);

  // Margins and break-even (20%)
  if (financials.estimatedGrossMargin !== undefined && financials.estimatedGrossMargin > 0) {
    score += Math.min(10, financials.estimatedGrossMargin / 10);
  }
  if (financials.breakEvenCustomers !== undefined && financials.breakEvenCustomers > 0) {
    // Fewer customers to break even = better
    score += Math.max(0, 10 - financials.breakEvenCustomers / 10);
  }

  // Milestones defined (15%)
  score += Math.min(15, financials.milestones.length * 5);

  // Commercial clarity (25%)
  const commercialFields = [
    commercial.firstCustomer,
    commercial.whyTheyPay,
    commercial.whatWeSellFirst,
    commercial.suggestedPrice,
    commercial.fastestSalesRoute,
  ];
  const filledCommercial = commercialFields.filter((f) => f && f.length > 0).length;
  score += (filledCommercial / 5) * 25;

  return Math.round(Math.min(100, score));
}

// ---------------------------------------------------------------------------
// Ease of selling (0-100)
// ---------------------------------------------------------------------------

function calculateEaseOfSelling(project: Project): number {
  const { commercial, market, artifacts } = project;
  let score = 0;

  // Sales channels defined (30%)
  score += Math.min(30, commercial.channels.length * 10);

  // Fastest path steps defined (20%)
  score += Math.min(20, commercial.fastestPath.length * 5);

  // Proof needed clarity (15%)
  if (commercial.proofNeeded && commercial.proofNeeded.length > 0) score += 15;

  // Low competition in alternatives (15%)
  const altCount = market.currentAlternatives.length;
  score += altCount === 0 ? 15 : Math.max(0, 15 - altCount * 3);

  // Commercial artifacts ready (20%)
  const commercialArtifacts = artifacts.filter((a) => a.category === 'Commercial');
  if (commercialArtifacts.length > 0) {
    const readyPct = calculateArtifactReadiness(commercialArtifacts);
    score += (readyPct / 100) * 20;
  } else {
    score += 5; // no commercial artifacts = uncertain
  }

  return Math.round(Math.min(100, score));
}

// ---------------------------------------------------------------------------
// Strategic importance (derived from other factors)
// ---------------------------------------------------------------------------

function calculateStrategicImportance(
  marketScore: number,
  revenueScore: number,
  painLevel: string,
  stage: string,
): number {
  let score = 0;

  // Market + revenue weigh heavily
  score += marketScore * 0.35;
  score += revenueScore * 0.35;

  // Pain level
  score += (PAIN_LEVEL_SCORE[painLevel] ?? 50) * 0.15;

  // Later stages = more invested = more strategic
  const STAGE_WEIGHT: Record<string, number> = {
    Idea: 10, Research: 20, UX: 30, MVP: 40, Development: 50,
    Integration: 60, QA: 65, Production: 75, Validation: 80,
    Pilot: 85, Sales: 90, Revenue: 95, Scale: 100,
  };
  score += (STAGE_WEIGHT[stage] ?? 50) * 0.15;

  return Math.round(score);
}

// ---------------------------------------------------------------------------
// Calculate all sub-scores
// ---------------------------------------------------------------------------

export function calculateAllScores(project: Project): Scores {
  const product = Math.round(categoryReadiness(project.tasks, CATEGORY_GROUPS.product));
  const technical = Math.round(categoryReadiness(project.tasks, CATEGORY_GROUPS.technical));
  const qa = Math.round(categoryReadiness(project.tasks, CATEGORY_GROUPS.qa));
  const deployment = Math.round(categoryReadiness(project.tasks, CATEGORY_GROUPS.deployment));
  const commercial = Math.round(categoryReadiness(project.tasks, CATEGORY_GROUPS.commercial));
  const artifacts = Math.round(calculateArtifactReadiness(project.artifacts));
  const market = calculateMarketScore(project);
  const revenue = calculateRevenueScore(project);

  const priority = calculatePriorityScore(project);

  const overall = Math.round(
    (product + technical + qa + deployment + commercial + artifacts + market + revenue) / 8,
  );

  return {
    overall,
    product,
    technical,
    qa,
    deployment,
    commercial,
    artifacts,
    market,
    revenue,
    priority,
  };
}

// ---------------------------------------------------------------------------
// Priority score (0-100)
// ---------------------------------------------------------------------------

export function calculatePriorityScore(project: Project): number {
  const w = PRIORITY_WEIGHTS;

  const productScore = categoryReadiness(project.tasks, CATEGORY_GROUPS.product);
  const technicalScore = categoryReadiness(project.tasks, CATEGORY_GROUPS.technical);
  const qaScore = categoryReadiness(project.tasks, CATEGORY_GROUPS.qa);
  const deploymentScore = categoryReadiness(project.tasks, CATEGORY_GROUPS.deployment);
  const commercialScore = categoryReadiness(project.tasks, CATEGORY_GROUPS.commercial);
  const artifactsScore = calculateArtifactReadiness(project.artifacts);
  const marketScore = calculateMarketScore(project);
  const revenueScore = calculateRevenueScore(project);
  const easeScore = calculateEaseOfSelling(project);

  // Inverse scores: high remaining effort/blockers = LOW priority contribution
  const effortRemaining = calculateRemainingEffort(project);
  const effortScore = 100 - effortRemaining; // less effort remaining = higher score

  const blockerAnalysis = analyzeBlockers(project.tasks);
  const blockerScore = 100 - blockerAnalysis.severityScore; // fewer/lighter blockers = higher

  const weighted =
    productScore * w.product +
    technicalScore * w.technical +
    qaScore * w.qa +
    deploymentScore * w.deployment +
    commercialScore * w.commercial +
    artifactsScore * w.artifacts +
    marketScore * w.market +
    revenueScore * w.revenue +
    easeScore * w.easeOfSelling +
    effortScore * w.remainingEffort +
    blockerScore * w.blockerSeverity;

  return Math.round(Math.min(100, Math.max(0, weighted)));
}

// ---------------------------------------------------------------------------
// Recommendation
// ---------------------------------------------------------------------------

export function getPriorityRecommendation(project: Project): PriorityRecommendation {
  if (project.status === 'Paused' || project.status === 'Archived') {
    return 'PAUSE';
  }

  const score = calculatePriorityScore(project);
  const blockers = analyzeBlockers(project.tasks);
  const productReady = categoryReadiness(project.tasks, CATEGORY_GROUPS.product) >= 70;
  const deploymentReady = categoryReadiness(project.tasks, CATEGORY_GROUPS.deployment) >= 70;
  const technicalReady = categoryReadiness(project.tasks, CATEGORY_GROUPS.technical) >= 70;
  const commercialReady = categoryReadiness(project.tasks, CATEGORY_GROUPS.commercial) >= 70;
  const marketScore = calculateMarketScore(project);

  // Critical blockers always surface
  if (blockers.hasCritical) {
    return 'FIX BLOCKER';
  }

  // High score + blockers = clear next action
  if (score >= 80 && blockers.count > 0) {
    return 'WORK NOW';
  }

  // Nearly ready, high score
  if (score >= 75 && productReady && technicalReady) {
    return 'FINISH THIS WEEK';
  }

  // Deployment and product ready
  if (score >= 70 && deploymentReady && productReady) {
    return 'READY FOR PILOT';
  }

  // All readiness high
  if (score >= 65 && productReady && technicalReady && commercialReady) {
    return 'READY FOR SALES';
  }

  // Product ready but market unclear
  if (productReady && marketScore < 50) {
    return 'VALIDATE MARKET';
  }

  // Low score
  if (score < 40) {
    return 'PAUSE';
  }

  return 'MONITOR';
}

// ---------------------------------------------------------------------------
// Human-readable reason
// ---------------------------------------------------------------------------

export function getPriorityReason(project: Project): string {
  const recommendation = getPriorityRecommendation(project);
  const score = calculatePriorityScore(project);
  const blockers = analyzeBlockers(project.tasks);
  const effortRemaining = calculateRemainingEffort(project);
  const marketScore = calculateMarketScore(project);
  const revenueScore = calculateRevenueScore(project);

  const parts: string[] = [];

  switch (recommendation) {
    case 'WORK NOW':
      parts.push(
        `Score is ${score}/100 with ${blockers.count} blocker(s) to resolve.`,
        `Clearing these will unlock significant progress.`,
      );
      break;

    case 'FINISH THIS WEEK':
      parts.push(
        `Score is ${score}/100 - product and technical readiness are high.`,
        `${effortRemaining}% effort remaining. Push to completion.`,
      );
      break;

    case 'FIX BLOCKER':
      parts.push(
        `${blockers.count} critical blocker(s) preventing progress.`,
        `Resolve these before any other work on this project.`,
      );
      break;

    case 'READY FOR PILOT':
      parts.push(
        `Product and deployment are ready (score ${score}/100).`,
        `Find a pilot customer to validate with real usage.`,
      );
      break;

    case 'READY FOR SALES':
      parts.push(
        `All readiness dimensions are high (score ${score}/100).`,
        `Commercial and product alignment is strong - start selling.`,
      );
      break;

    case 'VALIDATE MARKET':
      parts.push(
        `Product is ready but market attractiveness is only ${marketScore}/100.`,
        `Validate demand before investing more in development.`,
      );
      break;

    case 'MONITOR':
      parts.push(
        `Score is ${score}/100 - progressing but not urgent.`,
        `Market: ${marketScore}/100, Revenue potential: ${revenueScore}/100.`,
      );
      break;

    case 'PAUSE':
      if (project.status === 'Paused' || project.status === 'Archived') {
        parts.push(`Project is ${project.status.toLowerCase()}.`);
      } else {
        parts.push(
          `Score is ${score}/100 - below threshold for active work.`,
          `Consider whether this project aligns with current priorities.`,
        );
      }
      break;
  }

  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// Top actions
// ---------------------------------------------------------------------------

export function getTopActions(project: Project): string[] {
  const actions: { action: string; urgency: number }[] = [];
  const blockers = analyzeBlockers(project.tasks);

  // Critical blockers first
  const criticalBlockers = project.tasks.filter(
    (t) => t.status === 'blocker' && t.priority === 'critical',
  );
  for (const b of criticalBlockers) {
    actions.push({
      action: b.recommendedAction ?? `Resolve critical blocker: ${b.title}`,
      urgency: 100,
    });
  }

  // High-priority blockers
  const highBlockers = project.tasks.filter(
    (t) => t.status === 'blocker' && t.priority === 'high',
  );
  for (const b of highBlockers) {
    actions.push({
      action: b.recommendedAction ?? `Fix blocker: ${b.title}`,
      urgency: 80,
    });
  }

  // Low readiness areas
  const areas: { name: string; score: number; suggestion: string }[] = [
    {
      name: 'Product',
      score: categoryReadiness(project.tasks, CATEGORY_GROUPS.product),
      suggestion: 'Complete pending product tasks to improve product readiness',
    },
    {
      name: 'Technical',
      score: categoryReadiness(project.tasks, CATEGORY_GROUPS.technical),
      suggestion: 'Address technical debt and pending development tasks',
    },
    {
      name: 'QA',
      score: categoryReadiness(project.tasks, CATEGORY_GROUPS.qa),
      suggestion: 'Set up testing and QA processes',
    },
    {
      name: 'Deployment',
      score: categoryReadiness(project.tasks, CATEGORY_GROUPS.deployment),
      suggestion: 'Configure deployment pipeline and infrastructure',
    },
    {
      name: 'Commercial',
      score: categoryReadiness(project.tasks, CATEGORY_GROUPS.commercial),
      suggestion: 'Develop sales materials and commercial strategy',
    },
  ];

  for (const area of areas) {
    if (area.score < 50) {
      actions.push({ action: area.suggestion, urgency: 60 - area.score * 0.5 });
    }
  }

  // Missing artifacts
  const missingArtifacts = project.artifacts.filter((a) => a.status === 'MISSING');
  if (missingArtifacts.length > 0) {
    actions.push({
      action: `Create ${missingArtifacts.length} missing artifact(s): ${missingArtifacts
        .slice(0, 3)
        .map((a) => a.name)
        .join(', ')}`,
      urgency: 45,
    });
  }

  // Market validation
  const marketScore = calculateMarketScore(project);
  if (marketScore < 40) {
    actions.push({
      action: 'Research and validate market opportunity with potential customers',
      urgency: 55,
    });
  }

  // Revenue clarity
  const revenueScore = calculateRevenueScore(project);
  if (revenueScore < 40) {
    actions.push({
      action: 'Define pricing model and revenue projections',
      urgency: 50,
    });
  }

  // Next action from project itself
  if (project.nextAction && project.nextAction.length > 0) {
    actions.push({ action: project.nextAction, urgency: 70 });
  }

  // Sort by urgency, return top 3
  actions.sort((a, b) => b.urgency - a.urgency);
  return actions.slice(0, 3).map((a) => a.action);
}
