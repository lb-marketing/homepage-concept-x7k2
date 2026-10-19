import type { Mode } from '../shared/ui';

/* Every string and number McpRecipeDemo shows. All product data is sample data, which `sampleNote` says.
   LinearB tool names are as the MCP server lists them (help center, "MCP Server"). `**x**` marks bold text. */

/** One step the AI tool takes: a LinearB MCP tool (`call` is its name) or another tool (`call` is null). */
export type Call = { tool: string; call: string | null; result: string };

export type SlackResult = {
  kind: 'slack'; workspace: string; channels: string[]; channel: string; members: string;
  bot: string; botIcon: string; tag: string; time: string; title: string;
  metrics: { text: string; tone: 'good' | 'fair' }[];
  warning: string; waitingLabel: string; waiting: { title: string; age: string }[];
  reactions: string[]; composer: string;
};
export type DocResult = {
  kind: 'doc'; file: string; menu: string; share: string; title: string; meta: string; summary: string;
  timelineLabel: string; timeline: { time: string; text: string }[];
  changesLabel: string; changes: { title: string; detail: string; comment?: string }[];
};
export type SlidesResult = {
  kind: 'slides'; file: string; menu: string; share: string; slides: number; current: number;
  company: string; deck: string; headline: string;
  chartTitle: string; bars: { label: string; value: number; display: string }[];   // the last bar is this quarter
  facts: { value: string; text: string }[]; source: string; page: string; notes: string;
};
export type ChatResult = {
  kind: 'chat'; app: string; appIcon: string; context: string; answer: string;
  /** month labels and where they sit along the timeline, 0–100 */
  axis: { label: string; at: number }[];
  /** due and projected are 0–100 along the timeline */
  rows: { name: string; meta: string; due: number; projected: number; value: string; deals: string }[];
  legend: { due: string; slip: string }; followUp: string; composer: string;
};
export type Result = SlackResult | DocResult | SlidesResult | ChatResult;

export type DemoRecipe = {
  mode: Mode;
  /** the picker card */
  card: { tools: string[]; title: string; line: string };
  /** the AI tool the prompt is typed into, and what it has connected */
  client: string; context: string; prompt: string;
  calls: Call[];
  result: Result;
};

export type RecipeDemoContent = {
  modes: Record<Mode, string>;
  recipes: DemoRecipe[];
  /** the tools around the AI tool in the graph; x and y are 0–1 across and down. Include every tool a recipe calls. */
  graph: { tool: string; x: number; y: number }[];
  labels: {
    pickerLabel: string;
    reading: string;        // "{client} is reading your prompt…"
    calling: string;        // "Calling {tools}…"
    calledAria: string;     // "{client} called LinearB {calls}, then {tools}"
    done: string;
  };
  sampleNote: string;
};

export const DEFAULT_CONTENT: RecipeDemoContent = {
  modes: { ask: 'Ask', auto: 'Automate', build: 'Build' },
  recipes: [
    {
      mode: 'auto',
      card: { tools: ['linearb', 'slack'], title: 'Post a Monday brief to every team', line: 'LinearB metrics in each team’s Slack channel, on a schedule' },
      client: 'claude', context: 'Scheduled task · Mondays at 9:00',
      prompt: 'Every Monday at 9:00, post each team’s delivery summary for the last week to its Slack channel. Flag pickup time over 12 hours and list PRs waiting more than two days.',
      calls: [
        { tool: 'linearb', call: 'get_teams', result: 'Payments, Checkout, Platform, Mobile' },
        { tool: 'linearb', call: 'get_metrics', result: 'Cycle time, pickup time, deploy frequency, CFR' },
        { tool: 'linearb', call: 'get_metrics_benchmarks', result: 'Benchmark tier for each metric' },
        { tool: 'linearb', call: 'search_pull_requests', result: '6 PRs waiting more than two days' },
        { tool: 'slack', call: null, result: 'Posted to four team channels' },
      ],
      result: {
        kind: 'slack', workspace: 'Acme Engineering', channels: ['# eng-leads', '# payments-eng', '# checkout-eng', '# platform-eng', '# mobile-eng'],
        channel: '# payments-eng', members: '14 members', bot: 'Claude', botIcon: 'claude', tag: 'APP', time: '9:00 AM',
        title: 'Payments · delivery brief for the week of Oct 12',
        metrics: [
          { text: 'Cycle time **1d 9h**, down from 2d 1h · Good', tone: 'good' },
          { text: 'Pickup time **14h**, up from 11h · Fair', tone: 'fair' },
          { text: 'Deploy frequency **0.8 a day** · Good', tone: 'good' },
          { text: 'Change failure rate **3%** · Good', tone: 'good' },
        ],
        warning: '⚠️ Pickup time is over the 12 hour target for the second week running.',
        waitingLabel: 'Waiting more than two days:',
        waiting: [{ title: 'Retry budget for ledger sync', age: '2d 6h' }, { title: 'Refund webhook timeouts', age: '2d 2h' }],
        reactions: ['👀 3', '✅ 2', '🙏 1'], composer: 'Message #payments-eng',
      },
    },
    {
      mode: 'ask',
      card: { tools: ['linearb', 'pagerduty', 'slack', 'gdocs'], title: 'Draft last night’s postmortem', line: 'The incident, release and PRs from LinearB, with PagerDuty and Slack' },
      client: 'claude', context: 'LinearB, PagerDuty, Slack and Google Docs connected',
      prompt: 'Draft the postmortem for last night’s checkout incident. Include what shipped before it, the timeline and how long recovery took.',
      calls: [
        { tool: 'linearb', call: 'search_incidents', result: 'INC-2291 · checkout-api · opened 21:51' },
        { tool: 'linearb', call: 'get_releases', result: 'Release 2026.10.18.2 deployed at 21:42' },
        { tool: 'linearb', call: 'search_pull_requests', result: '7 PRs in the release, 1 over 600 lines' },
        { tool: 'pagerduty', call: null, result: 'Alert, escalation and resolve times' },
        { tool: 'slack', call: null, result: 'Read #inc-checkout, 84 messages' },
        { tool: 'gdocs', call: null, result: 'Created the postmortem draft' },
      ],
      result: {
        kind: 'doc', file: 'Postmortem: checkout payment errors', menu: 'File  Edit  View  Insert  Format  Tools', share: 'Share',
        title: 'Postmortem: checkout payment errors', meta: 'Draft · Payments · Oct 18 · time to restore 46 min',
        summary: 'Payment errors on checkout-api rose after release 2026.10.18.2. The Payments team rolled back at 22:37, 46 minutes after the first alert.',
        timelineLabel: 'Timeline',
        timeline: [
          { time: '21:42', text: 'Release 2026.10.18.2 deployed, 7 PRs' },
          { time: '21:51', text: 'PagerDuty alert on payment error rate' },
          { time: '22:20', text: 'Retry change identified in #inc-checkout' },
          { time: '22:37', text: 'Rolled back, error rate back to normal' },
        ],
        changesLabel: 'Changes in the release',
        changes: [
          { title: 'Retry budget for ledger sync', detail: '642 lines, reviewed in 4 min', comment: 'Comment: largest PR in the release' },
          { title: 'Bump payments SDK', detail: '18 lines' },
        ],
      },
    },
    {
      mode: 'build',
      card: { tools: ['linearb', 'gsheets', 'gslides'], title: 'Report AI ROI to the board', line: 'AI-assisted PRs from LinearB, with tool spend from Google Sheets' },
      client: 'claude', context: 'LinearB, Google Sheets and Google Slides connected',
      prompt: 'Build a board slide on our AI investment for Q3. Compare AI-assisted PRs with the rest in LinearB, add tool spend from our “AI spend” sheet, and show adoption, cycle time and cost per merged PR.',
      calls: [
        { tool: 'linearb', call: 'get_ai_dev_tools', result: 'Copilot, Cursor and Claude Code connected' },
        { tool: 'linearb', call: 'search_pull_requests', result: '1,284 merged PRs in Q3' },
        { tool: 'linearb', call: 'get_metrics', result: 'AI-assisted share and cycle time, against the rest' },
        { tool: 'gsheets', call: null, result: 'Q3 tool spend from “AI spend”' },
        { tool: 'gslides', call: null, result: 'Added the slide to the board deck' },
      ],
      result: {
        kind: 'slides', file: 'Board update · Q3 2026', menu: 'File  Edit  View  Insert  Slide  Arrange', share: 'Slideshow', slides: 4, current: 3,
        company: 'Acme', deck: 'Board update · Q3 2026',
        headline: 'AI-assisted PRs reached 46% of merged work in Q3, at $38 per PR',
        chartTitle: 'AI-assisted share of merged PRs',
        bars: [{ label: 'Q4 ’25', value: 18, display: '18%' }, { label: 'Q1', value: 24, display: '24%' }, { label: 'Q2', value: 31, display: '31%' }, { label: 'Q3', value: 46, display: '46%' }],
        facts: [
          { value: '1d 4h', text: 'cycle time on AI-assisted PRs, against 1d 11h for the rest' },
          { value: '$38', text: 'AI tool cost per merged PR, highest on Mobile at $52' },
        ],
        source: 'Source: LinearB, AI spend sheet', page: '4',
        notes: 'Adoption rose for the third quarter running. Mobile costs the most per PR because its rollout started in August.',
      },
    },
    {
      mode: 'ask',
      card: { tools: ['linearb', 'salesforce'], title: 'Price the roadmap at risk', line: 'Late epics from LinearB, matched to open deals in Salesforce' },
      client: 'chatgpt', context: 'LinearB and Salesforce connected',
      prompt: 'Which Q4 roadmap epics are on track to miss their dates, and how much open pipeline is waiting on each one?',
      calls: [
        { tool: 'linearb', call: 'get_pm_entities', result: '14 epics on the Q4 roadmap' },
        { tool: 'linearb', call: 'get_issues', result: 'Done and open issues for each epic' },
        { tool: 'linearb', call: 'calculate_lead_time', result: 'Lead time by team, last 90 days' },
        { tool: 'salesforce', call: null, result: 'Open opportunities tagged with these features' },
      ],
      result: {
        kind: 'chat', app: 'ChatGPT', appIcon: 'chatgpt', context: 'LinearB and Salesforce',
        answer: 'Three Q4 epics are on track to miss their dates, with **$2.47M** of open pipeline waiting on them. Partner SSO carries the most.',
        axis: [{ label: 'Nov', at: 14.8 }, { label: 'Dec', at: 48.9 }, { label: 'Jan', at: 84 }],
        rows: [
          { name: 'Partner SSO', meta: 'Platform · 54% done', due: 29.5, projected: 53, value: '$1.2M', deals: '6 deals' },
          { name: 'Usage-based billing', meta: 'Payments · 38% done', due: 48.9, projected: 93.2, value: '$860K', deals: '4 deals' },
          { name: 'Audit log export', meta: 'Platform · 71% done', due: 21.6, projected: 37.5, value: '$410K', deals: '3 deals' },
        ],
        legend: { due: 'Due date', slip: 'Projected slip' },
        followUp: 'Want me to share this with the account owners on the six Partner SSO deals?', composer: 'Ask a follow-up',
      },
    },
  ],
  graph: [
    { tool: 'linearb', x: .13, y: .48 }, { tool: 'jira', x: .25, y: .14 }, { tool: 'slack', x: .5, y: .08 }, { tool: 'pagerduty', x: .75, y: .14 },
    { tool: 'gsheets', x: .87, y: .48 }, { tool: 'salesforce', x: .75, y: .8 }, { tool: 'gdocs', x: .5, y: .85 }, { tool: 'gslides', x: .25, y: .8 },
  ],
  labels: {
    pickerLabel: 'Recipes',
    reading: '{client} is reading your prompt…',
    calling: 'Calling {tools}…',
    calledAria: '{client} called LinearB {calls}, then {tools}',
    done: 'done',
  },
  sampleNote: 'Sample data · LinearB tool names as the MCP server lists them',
};
