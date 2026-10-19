import type { Mode } from '../shared/ui';

/* Every string and number McpRecipeLibrary shows. The section heading and lede above it are Studio copy blocks.
   Preview figures are sample data. */

export type Preview =
  | { kind: 'bars'; title: string; rows: { label: string; value: number }[] }               // value: bar length, 0–100
  | { kind: 'message'; from: string; fromIcon: string; time: string; text: string; link: string; meta: string }
  | { kind: 'doc'; title: string; lines: { width: number; bullet?: boolean }[] }            // width: 0–100
  | { kind: 'trend'; title: string; sub: string; points: number[]; markerAt: number; markerLabel: string } // points: daily volume; markerAt: 0–100 across
  | { kind: 'ticket'; icon: string; key: string; text: string; priority: string }
  | { kind: 'tiles'; tiles: { value: string; label: string }[] }
  | { kind: 'event'; title: string; time: string; lines: string[] }
  | { kind: 'editor'; lines: string[] };                                                     // `**x**` marks a heading token, `[x]` a chip

export type Recipe = { mode: Mode; tools: string[]; title: string; prompt: string; preview: Preview };

export type RecipeLibraryContent = {
  modes: Record<Mode, { label: string; line: string }>;
  filterLabel: string;
  allLabel: string;
  copyLabel: string;
  copiedLabel: string;
  recipes: Recipe[];
  library: { label: string; href: string };
};

export const DEFAULT_CONTENT: RecipeLibraryContent = {
  modes: {
    ask:   { label: 'Ask',      line: 'Get answers that draw on LinearB and your other tools, in a chat or in Cursor and VS Code.' },
    auto:  { label: 'Automate', line: 'Run a prompt on a schedule or a trigger, and send the result where your teams work.' },
    build: { label: 'Build',    line: 'Make reports, decks and pages with LinearB data underneath.' },
  },
  filterLabel: 'Show recipes',
  allLabel: 'All',
  copyLabel: 'Copy prompt',
  copiedLabel: 'Copied',
  recipes: [
    { mode: 'ask', tools: ['linearb', 'gsheets'], title: 'Cost of AI per merged PR',
      prompt: 'Pull merged PRs with and without AI by team from LinearB, join them with the tool costs in my “AI spend” sheet, and chart AI cost per merged PR for each team.',
      preview: { kind: 'bars', title: 'AI cost per merged PR', rows: [{ label: 'Platform', value: 38 }, { label: 'Payments', value: 62 }, { label: 'Checkout', value: 84 }, { label: 'Mobile', value: 50 }] } },
    { mode: 'auto', tools: ['linearb', 'slack'], title: 'Nudge reviewers on waiting PRs',
      prompt: 'Every weekday at 10:00, find PRs that have waited more than a day for review in LinearB, and send each reviewer a Slack message with links to theirs.',
      preview: { kind: 'message', from: 'Claude', fromIcon: 'claude', time: '10:00', text: '2 PRs are waiting on your review:', link: 'Retry budget for ledger sync', meta: '1d 4h' } },
    { mode: 'build', tools: ['linearb', 'jira', 'notion'], title: 'Release notes from what shipped',
      prompt: 'Take the PRs in our latest release from LinearB, match them to their Jira issues, and write customer-facing release notes on our Notion changelog page.',
      preview: { kind: 'doc', title: 'Changelog · Oct 18', lines: [{ width: 70 }, { width: 88, bullet: true }, { width: 64, bullet: true }, { width: 76, bullet: true }, { width: 52 }] } },
    { mode: 'ask', tools: ['linearb', 'zendesk'], title: 'Find the release behind a ticket spike',
      prompt: 'Compare Zendesk ticket volume for the last two weeks with LinearB releases over the same period, and tell me which release lines up with the jump.',
      preview: { kind: 'trend', title: 'Support tickets', sub: 'last 14 days', points: [8, 10, 7, 11, 9, 10, 12, 32, 38, 34, 30], markerAt: 61, markerLabel: '2026.10.11.1' } },
    { mode: 'auto', tools: ['linearb', 'zapier', 'jira'], title: 'Open a ticket when failures rise',
      prompt: 'Each morning, check change failure rate for every service in LinearB. If one passes 10%, use Zapier to open a Jira ticket for the team that owns it.',
      preview: { kind: 'ticket', icon: 'jira', key: 'PAY-482', text: 'Change failure rate on ledger-api passed 10%', priority: 'High' } },
    { mode: 'build', tools: ['linearb', 'jira', 'pagerduty'], title: 'An engineering mission control',
      prompt: 'Build me a page I can open every morning, with delivery, incidents and AI adoption by team from LinearB, the current Jira sprint and who’s on call.',
      preview: { kind: 'tiles', tiles: [{ value: '42', label: 'Deploys this week' }, { value: '4%', label: 'Change failure rate' }, { value: '1', label: 'Open incidents' }, { value: '46%', label: 'AI-assisted PRs' }] } },
    { mode: 'ask', tools: ['linearb', 'gcal'], title: 'Prep for tomorrow’s 1:1s',
      prompt: 'For each 1:1 on my calendar tomorrow, summarize what that person’s team shipped in LinearB this sprint, with waiting reviews and pickup time.',
      preview: { kind: 'event', title: '1:1 · Priya N.', time: 'Tue 10:30', lines: ['Payments shipped 14 PRs', '3 reviews waiting · pickup time 14h'] } },
    { mode: 'ask', tools: ['cursor', 'linearb', 'jira'], title: 'Write the PR description',
      prompt: 'Write the description for this PR and link the Jira issue it closes. Then check in LinearB how long reviews usually take on this repository.',
      preview: { kind: 'editor', lines: ['**## Summary**', 'Adds a retry budget to ledger sync', 'Closes [PAY-471]', '**## Review** usually 6h here'] } },
  ],
  library: { label: 'Get the LinearB MCP prompt library', href: 'https://linearb.helpdocs.io/article/ofb17dj8fh-exploring-the-power-of-linear-b-s-mcp-server' },
};
