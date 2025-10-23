import { heuristicScore, aiScore } from '@/lib/scoring';

export type GenTopic = { term: string; signals: { google: number; reddit: number; hn: number } };

function categoryFor(term: string) {
  const t = term.toLowerCase();
  if (/(fintech|invoice|bank|payment)/.test(t)) return 'fintech';
  if (/(creator|martech|marketing|ads)/.test(t)) return 'martech';
  if (/(remote|hr|jobs|talent)/.test(t)) return 'worktech';
  if (/(climate|sustain|energy|carbon)/.test(t)) return 'climate';
  if (/(no-?code|low-?code)/.test(t)) return 'nocode';
  if (/(ai|copilot|llm|agent)/.test(t)) return 'ai-tools';
  if (/(health|wellness|care)/.test(t)) return 'healthtech';
  return 'general';
}

function summaryFor(term: string, cat: string) {
  const m: Record<string, string> = {
    fintech: `AI-driven finance workflow for SMBs (invoicing, cashflow, payments) with risk checks.`,
    martech: `Creator/marketing analytics tool with campaign insights and auto content brief generation.`,
    worktech: `Remote team productivity toolkit: async standups, goals, and AI meeting notes.`,
    climate: `SaaS to help SMEs track emissions and suggest cost-saving reductions.`,
    nocode: `No-code “blocks” to assemble internal tools, databases, and automations.`,
    'ai-tools': `Task-focused copilot that plugs into docs, email, and CRM to do work autonomously.`,
    healthtech: `Personal wellness planner with habit loops and clinician-friendly exports.`,
    general: `Verticalized SaaS turning domain workflows into automations and dashboards.`,
  };
  return `${term}: ${m[cat] ?? m.general}`;
}

export async function generateIdeasFromTopics(topics: GenTopic[]) {
  const out: any[] = [];
  for (const t of topics) {
    const category = categoryFor(t.term);
    const base = heuristicScore({
      category,
      countries: ['US', 'UK', 'DE', 'CA', 'IN'],
      time_horizon_months: 12,
      signals: { google: t.signals.google, news: t.signals.hn, reddit: t.signals.reddit },
    });
    const title = `${t.term} Platform`;
    const description = summaryFor(t.term, category);
    const scores = await aiScore(base, `${title}. ${description}`); // uses heuristic if no OPENAI key
    out.push({
      id: crypto.randomUUID(),
      title,
      summary: description,
      category,
      success_score: scores.success,
      confidence: scores.confidence,
      best_markets: [{ country: 'US' }, { country: 'UK' }, { country: 'DE' }],
      created_at: new Date().toISOString(),
      // keep shape minimal — repoUpsertIdeas will store as ``data`` column
    });
  }
  return out;
}
