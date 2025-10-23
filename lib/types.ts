export type SourceSignal = {
  type: "trends" | "news" | "social" | "search" | "funding" | "ecom" | "other";
  evidence: string; url?: string; score: number;
};
export type Idea = {
  id: string;
  title: string;
  summary: string;
  category: "product"|"service"|"content"|"app"|"website"|"other";
  industry: string;
  source_signals: SourceSignal[];
  success_score: number;
  factor_breakdown: { demand: number; competition: number; monetization: number; ops: number; regulatory: number; capital: number; founder_fit: number };
  confidence: number;
  trend_window: { start: string; peak: string; decay_months: number };
  best_markets: { country: string; reason: string; market_size_index: number }[];
  competition: { summary: string; players: { name: string; url?: string }[] };
  required_roles: ("solo"|"frontend"|"backend"|"designer"|"growth"|"ops"|"data")[];
  recommended_ai_tools: { task: string; tool: string; why: string; alt: string[] }[];
  estimated_budget: { currency: "USD"; capex: number; opex_monthly: number };
  risk: ("supply"|"regulatory"|"crowded"|"unstable_api"|"seasonal"|"low_ltv"|"other")[];
  notes?: string;
};
export type Task = { id: string; title: string; role: string; effort_days: number; dependencies: string[]; done?: boolean };
export type Project = {
  project_id: string;
  idea_id: string;
  status: "draft"|"active"|"paused"|"archived";
  kpis: { name: string; target: string; period: "weekly"|"monthly" }[];
  roadmap: { milestone: string; eta: string; tasks: Task[] }[];
  monitors: { type: "competitor"|"price"|"keyword"|"funding"|"policy"|"appstore"|"search"; query: string; frequency: "daily"|"weekly"|"monthly" }[];
  app_repo_ref?: string | null;
  ui_component_tree?: ComponentTree;
};
export type Component = { id: string; type: string; props: Record<string, any>; children: string[] };
export type ComponentTree = { root: string; components: Record<string, Component> };
export type AppSpec = {
  name: string; description: string;
  stack: { framework: "nextjs14"; lang: "ts"; styling: string[]; db: "none"|"sqlite"|"postgres"; auth: "none"|"nextauth" };
  pages: { route: string; purpose: string; sections?: string[]; widgets?: string[] }[];
  components: { type: string; props: Record<string, any> }[];
  api: { route: string; method: "GET"|"POST"|"PUT"|"DELETE"; body?: string; returns?: string }[];
  assets: { name: string; kind: "image"|"icon"|"font"; source: "generated"|"placeholder"|"url" }[];
};
