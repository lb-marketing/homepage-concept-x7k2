/* Every string McpConnectionMap shows. LinearB tool names are as the MCP server lists them (help center,
   "MCP Server"). The tools around the AI tool are a sample, which the "any MCP server" node says. */

export type MapArea = {
  label: string;
  /** LinearB MCP tools for this area */
  mcpTools: string[];
  /** three questions LinearB answers on its own */
  questions: string[];
  /** tool keys this area works alongside; they light up on the map */
  worksWith: string[];
};

export type MapTool = {
  /** what this tool brings */
  brings: string[];
  /** what LinearB brings alongside it */
  linearbBrings: string[];
  /** what you can build with both */
  builds: string[];
};

export type ConnectionMapContent = {
  hubLabel: string;
  hubClients: string[];
  linearbLabel: string;
  areas: Record<string, MapArea>;
  /** keys are icon keys; order is the order around the arc and the autoplay order */
  tools: Record<string, MapTool>;
  /** the dashed node that says the tools shown are a sample */
  more: MapTool & { label: string; captionName: string };
  labels: {
    linearbAnd: string;      // "LinearB and Zendesk"
    brings: string;          // "Zendesk brings"
    buildWithBoth: string;
    buildMore: string;
    areaPrefix: string;      // "LinearB delivery"
    mcpTools: string;
    worksAlongside: string;
    askOnItsOwn: string;
    mapLabel: string;
  };
  /** which tool is selected first */
  start: string;
};

export const DEFAULT_CONTENT: ConnectionMapContent = {
  hubLabel: 'Your AI tool',
  hubClients: ['claude', 'chatgpt', 'cursor'],
  linearbLabel: 'LinearB',
  areas: {
    metrics: { label: 'Metrics', mcpTools: ['get_metrics', 'get_metrics_benchmarks', 'calculate_lead_time'],
      questions: ['How does our cycle time compare with industry benchmarks?', 'Which teams improved deploy frequency this quarter?', 'Where does lead time go: coding, pickup, review or deploy?'],
      worksWith: ['slack', 'gsheets', 'gcal', 'zapier', 'salesforce', 'jira', 'notion'] },
    delivery: { label: 'Delivery', mcpTools: ['search_pull_requests', 'search_branches', 'get_releases', 'get_repository_id_by_name'],
      questions: ['Which PRs in Friday’s release are over 400 lines?', 'Which PRs have waited more than two days for review?', 'What shipped in the last release, and who worked on it?'],
      worksWith: ['jira', 'slack', 'notion', 'zendesk', 'datadog', 'pagerduty'] },
    reliability: { label: 'Reliability', mcpTools: ['search_incidents', 'get_services'],
      questions: ['Which services had incidents this month?', 'What shipped before each incident?', 'How long did recovery take for each one?'],
      worksWith: ['pagerduty', 'datadog', 'zendesk', 'slack', 'zapier'] },
    planning: { label: 'Planning', mcpTools: ['get_issues', 'get_pm_entities'],
      questions: ['Which Q4 epics are behind, and by how much?', 'Which issues have PRs stuck in review?', 'Which issue types take longest to ship?'],
      worksWith: ['jira', 'salesforce', 'notion', 'gsheets'] },
    teams: { label: 'Teams', mcpTools: ['get_teams', 'search_teams_or_groups', 'search_contributors', 'search_users'],
      questions: ['Which teams are carrying the most review load?', 'Which team has the longest pickup time?', 'Who contributes to the Payments team’s repos?'],
      worksWith: ['slack', 'gcal', 'gsheets', 'jira'] },
    ai: { label: 'AI tools', mcpTools: ['get_ai_dev_tools'],
      questions: ['Are AI-assisted PRs reaching production faster than the rest?', 'How does AI adoption differ across teams?', 'Which teams open the most AI-assisted PRs?'],
      worksWith: ['gsheets', 'slack', 'pagerduty', 'datadog', 'zapier', 'notion'] },
  },
  tools: {
    jira: { brings: ['Epics and sprints', 'Issue status', 'Creating tickets'], linearbBrings: ['PRs behind each issue', 'Cycle time', 'Benchmarks'],
      builds: ['Flag epics slipping because their PRs are stuck in review', 'Open a ticket when a team’s pickup time passes 12 hours', 'Show which issue types take longest to ship'] },
    slack: { brings: ['Team channels', 'Incident threads', 'Posting messages'], linearbBrings: ['Team metrics', 'Waiting PRs', 'AI adoption'],
      builds: ['Post a Monday delivery brief to each team’s channel', 'Nudge reviewers when PRs wait more than a day', 'Share AI adoption by team in #eng-leads each month'] },
    pagerduty: { brings: ['Alerts and escalations', 'On-call schedules', 'Resolve times'], linearbBrings: ['Releases and their PRs', 'Change failure rate', 'AI-assisted PRs'],
      builds: ['Draft a postmortem with what shipped before the incident', 'Check whether incidents follow releases heavy on AI-assisted PRs', 'Put who’s on call next to each team’s deploy frequency'] },
    datadog: { brings: ['Error rates', 'Latency', 'Service health'], linearbBrings: ['Releases', 'PR size', 'AI-assisted PRs'],
      builds: ['See whether error rates rise after releases with large PRs', 'Build a weekly service review with releases next to error rates', 'Compare service health with AI-assisted PRs by service'] },
    salesforce: { brings: ['Open opportunities', 'Deal values', 'Feature requests'], linearbBrings: ['Epics and initiatives', 'Issue progress', 'Lead time'],
      builds: ['Price the roadmap at risk in open pipeline', 'Tell account owners when a requested feature ships', 'Rank epics by the revenue waiting on them'] },
    zendesk: { brings: ['Ticket volume', 'Ticket tags', 'Customer reports'], linearbBrings: ['Releases', 'Incidents', 'Issues'],
      builds: ['Find the release behind a jump in tickets', 'Link support tickets to the incidents behind them', 'Show the top customer bugs next to the PRs fixing them'] },
    notion: { brings: ['Docs and wikis', 'Changelog pages', 'Writing pages'], linearbBrings: ['Releases', 'Merged PRs', 'Issues'],
      builds: ['Write customer-facing release notes from what shipped', 'Keep each team’s delivery page up to date every week', 'Draft a quarterly engineering update'] },
    gsheets: { brings: ['AI spend', 'Headcount and budgets', 'Writing rows'], linearbBrings: ['AI-assisted PRs', 'Merged PRs by team', 'Cycle time'],
      builds: ['Chart AI cost per merged PR for each team', 'Track delivery against headcount by quarter', 'Keep a weekly metrics sheet for finance'] },
    gcal: { brings: ['Meetings', '1:1s', 'Focus time'], linearbBrings: ['Pickup time', 'Review load', 'What each team shipped'],
      builds: ['Prep tomorrow’s 1:1s with each team’s delivery', 'Compare meeting load with pickup time by team', 'Plan focus time around review load'] },
    zapier: { brings: ['Triggers and schedules', 'Actions in other apps', 'Approvals'], linearbBrings: ['Metrics for any team', 'AI-assisted PRs', 'Incidents'],
      builds: ['Open a Jira ticket when change failure rate passes 10%', 'Alert when cycle time on AI-assisted PRs climbs above the rest', 'Send a weekly delivery digest by email'] },
  },
  more: { label: 'Any MCP server', captionName: 'any MCP server',
    brings: ['Its own data', 'Actions in its app'], linearbBrings: ['Metrics and benchmarks', 'PRs and releases', 'Incidents', 'AI adoption'],
    builds: ['Join LinearB metrics with cost data in Snowflake', 'Match Figma design changes to the PRs that shipped them', 'Update Asana projects with delivery status from LinearB'] },
  labels: {
    linearbAnd: 'LinearB and {tool}',
    brings: '{tool} brings',
    buildWithBoth: 'What you can build with both',
    buildMore: 'A few more you can build',
    areaPrefix: 'LinearB {area}',
    mcpTools: 'MCP tools',
    worksAlongside: 'Works alongside',
    askOnItsOwn: 'What you can ask LinearB on its own',
    mapLabel: 'LinearB and the tools your AI tool connects to',
  },
  start: 'pagerduty',
};
