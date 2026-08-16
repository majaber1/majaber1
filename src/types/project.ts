export type DataProvenance = 'AUTO' | 'MANUAL' | 'ESTIMATED' | 'RESEARCHED' | 'UNVERIFIED';

export type TaskStatus = 'resolved' | 'pending' | 'blocker';
export type TaskCategory =
  | 'Product' | 'UX' | 'Frontend' | 'Backend' | 'Database'
  | 'AI' | 'Security' | 'Deployment' | 'QA' | 'Legal'
  | 'Business' | 'Marketing' | 'Sales' | 'Finance';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  owner?: string;
  source?: string;
  evidence?: string;
  created: string;
  updated: string;
  recommendedAction?: string;
}

export type LifecycleStage =
  | 'Idea' | 'Research' | 'UX' | 'MVP' | 'Development'
  | 'Integration' | 'QA' | 'Production' | 'Validation'
  | 'Pilot' | 'Sales' | 'Revenue' | 'Scale';

export type StageStatus = 'not_started' | 'in_progress' | 'blocked' | 'complete';

export type ArtifactStatus = 'READY' | 'PARTIAL' | 'MISSING' | 'OUTDATED' | 'NOT_REQUIRED';

export interface Artifact {
  name: string;
  category: 'Product' | 'Technical' | 'QA' | 'Business' | 'Commercial';
  status: ArtifactStatus;
  link?: string;
  provenance: DataProvenance;
}

export interface Competitor {
  name: string;
  url?: string;
  market: 'Saudi' | 'GCC' | 'International';
  targetCustomer: string;
  positioning: string;
  features: string[];
  pricing?: string;
  pricingProvenance?: DataProvenance;
  strengths: string[];
  weaknesses: string[];
  theyDoBetter: string[];
  weDoBetter: string[];
  gapsToAddress: string[];
  lastResearched?: string;
  provenance: DataProvenance;
}

export interface MarketOpportunity {
  problem: string;
  buyer: string;
  user: string;
  whoPays: string;
  painLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  currentAlternatives: string[];
  saudiOpportunity: string;
  gccOpportunity: string;
  globalOpportunity: string;
  tam?: string;
  tamProvenance?: DataProvenance;
  sam?: string;
  samProvenance?: DataProvenance;
  som?: string;
  somProvenance?: DataProvenance;
}

export interface CommercialStrategy {
  firstCustomer: string;
  whyTheyPay: string;
  whatWeSellFirst: string;
  suggestedPrice: string;
  priceProvenance: DataProvenance;
  fastestSalesRoute: string;
  proofNeeded: string;
  primaryChannel: string;
  channels: string[];
  fastestPath: string[];
}

export interface Financial {
  pricingModel: string;
  setupFee?: number;
  subscription?: number;
  serviceRevenue?: number;
  commission?: number;
  transactionFee?: number;
  operatingCosts?: number;
  estimatedGrossMargin?: number;
  breakEvenCustomers?: number;
  mrr?: number;
  arr?: number;
  currency: string;
  provenance: DataProvenance;
  milestones: {
    label: string;
    customersNeeded: number;
    revenue: number;
  }[];
}

export interface GitHubInfo {
  repo: string;
  visibility: 'public' | 'private';
  defaultBranch: string;
  latestCommitSha?: string;
  latestCommitMessage?: string;
  latestUpdate?: string;
  openPRs?: number;
  openIssues?: number;
  ciStatus?: 'passing' | 'failing' | 'unknown';
  provenance: DataProvenance;
}

export interface VercelInfo {
  project?: string;
  productionUrl?: string;
  deploymentStatus?: 'ready' | 'building' | 'error' | 'unknown';
  deployedSha?: string;
  productionBranch?: string;
  lastDeployTime?: string;
  provenance: DataProvenance;
}

export interface Scores {
  overall: number;
  product: number;
  technical: number;
  qa: number;
  deployment: number;
  commercial: number;
  artifacts: number;
  market: number;
  revenue: number;
  priority: number;
}

export type PriorityRecommendation =
  | 'WORK NOW' | 'FINISH THIS WEEK' | 'FIX BLOCKER'
  | 'READY FOR PILOT' | 'READY FOR SALES' | 'VALIDATE MARKET'
  | 'MONITOR' | 'PAUSE';

export type ProjectStage =
  | 'Idea' | 'Research' | 'UX' | 'MVP' | 'Development'
  | 'Integration' | 'QA' | 'Production' | 'Validation'
  | 'Pilot' | 'Sales' | 'Revenue' | 'Scale';

export type ProjectStatus =
  | 'Active' | 'Development' | 'Production' | 'Pilot'
  | 'Blocked' | 'Paused' | 'Archived';

export type ProjectCategory = 'AI Product' | 'SaaS' | 'Platform' | 'Tool' | 'Internal';

export interface Roadmap {
  thisWeek: string[];
  next30Days: string[];
  next60Days: string[];
  next90Days: string[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  category: ProjectCategory;
  description: string;
  descriptionAr: string;

  purpose: string;
  problem: string;
  solution: string;
  targetUsers: string;
  buyer: string;
  geography: string;

  stage: ProjectStage;
  status: ProjectStatus;

  scores: Scores;

  github?: GitHubInfo;
  vercel?: VercelInfo;

  lifecycle: Record<LifecycleStage, StageStatus>;

  tasks: Task[];

  artifacts: Artifact[];

  competitors: Competitor[];

  market: MarketOpportunity;

  commercial: CommercialStrategy;

  financials: Financial;

  roadmap: Roadmap;

  nextAction: string;
  definitionOfDone: string;
  afterCompletion: string;

  provenance: DataProvenance;
  lastUpdated: string;
}

export interface DashboardState {
  projects: Project[];
  lastUpdated: string;
  version: string;
}
