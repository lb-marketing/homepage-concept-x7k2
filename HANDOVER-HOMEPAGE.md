# LinearB homepage: handover

The approved homepage, ready to build. Staff and marketing have signed off the copy, so build it as written.

| File | What it is |
| :-- | :-- |
| `index.html` | The whole page with the chosen copy, layout and demos. Top nav, footer and every unused version are removed |
| `media/share-image.png` | The 1200 × 630 share image (`og:image`) |
| `media/linearb-mark.png` | The LinearB mark used inside the demo windows |

Open `index.html` in a browser and it runs: no build step, no libraries. All product data in the demos is sample data, and each demo window says so.

## Page order

| # | Section | Selector | Build as |
| :-- | :-- | :-- | :-- |
| 1 | Hero heading, subheading and button | `section.hero` | Studio components, with the rotating word (below) |
| 2 | Hero visual: the context layer | `.hero-tunnel.tn-ha` | Code component |
| 3 | Customer logos | `section.proof` | Studio logo carousel |
| 4 | Explore | `#ask` | Studio heading and copy, code component for the window |
| 5 | Measure (on a colour band) | `#measure` | Studio heading and copy, code component for the window |
| 6 | Act | `#act` | Studio heading and copy, code component for the window |
| 7 | Customer evidence (on a colour band) | `#voices` | Studio components |
| 8 | APEX | `#apex-overview` | Studio heading, code component for the APEX view |
| 9 | Latest resources | `#latest` | Studio cards |
| 10 | Closing CTA | `#start` | Studio CTA |

The nav and footer are the site's existing ones.

## The parts that move

Each runs from one section of the page's script; the comments mark where each starts (`/* ---------- … */`).

### Hero headline: rotating word
- "Drive [productivity] with engineering context". The word cycles through productivity, velocity, quality and reporting every 2.8 seconds, in Indigo 500.
- Only "productivity" is page text. The other words are drawn from `data-w` attributes in CSS, so search engines and screen readers read one clean headline.
- The headline always sits on two lines. A fit script sizes it to the column, between 28px and 64px.
- Reduced motion shows "productivity" and stops.

### Hero visual: the context layer
- Collect (tool categories on the left) flows through Normalize, Enrich and Augment into Serve, which holds two cards: People (an Ask AI prompt) and Agents (a Claude Code session).
- Events are dots on a canvas. Highlighted events carry a label through each stage and land in a card, which then plays its next step: People types a question and answers it; Agents takes a task, calls LinearB through MCP and acts on it, lighting Save money, Gain velocity or Gain quality.
- Each tool category rotates through more of its tools every 1.1 seconds.
- The People and Agents cards always share one height, so the events fan up and down by the same amount. On phones the layout stacks.
- **Content:** `POOL_HA` (the stories and their labels), `data-q` on `.ha-ask` (questions and answers), `data-acts` on `.ha-sess` (agent tasks), `data-more` on each tool row (extra tools).
- "How the context layer works →" is hidden until `products/context-layer/` is live (see Before production).

### Explore, Measure and Act
- Each heading leads with its step in that step's colour: Explore in Indigo 500, Measure in Teal 600, Act in Red 600. A three-step trail under each heading links the three sections.
- **Explore:** pick a prompt and the assistant window types the question, runs its tools and streams a sample answer. "In LinearB" and "Via MCP" switch the window between the app and an MCP client. Content: `ASK`.
- **Measure:** pick a dashboard and the window builds it: tiles count up, the chart draws, the table fills. Content: `MS`.
- **Act:** pick a workflow and a pull request timeline plays step by step. LinearB recommends an effort level and a developer applies it; gitStream labels, approves, merges or routes to reviewers. Content: `AC`.
- **Wording to keep:** LinearB *recommends* the effort level and a person applies it. Automatic effort routing is the goal, not shipped, so no step should show the agent switching on its own.
- Every window holds its tallest state, so switching never moves the page.

### APEX view
- Four pillar cards in one window: AI leverage, Predictability, Efficiency and eXperience (product naming: capital X). Each has the question it answers, a metric, a chart and the LinearB products behind it.
- Charts grow in once the section scrolls into view. Charts and product lines line up across each row. Four across from 1201px, two by two below that, one column on phones.

## SEO and sharing

- **Title:** Drive productivity with engineering context | LinearB
- **Description:** LinearB accelerates every step of the SDLC, with guardrails and scale built in, from an agent merging a change to a quarterly AI ROI report.
- Open Graph and Twitter tags are set, with `media/share-image.png` as the image.
- One `h1`. Section headings are `h2`. Words in neighbouring elements are separated by spaces in the markup, so snippets don't run words together.

## Before production

- [ ] **Canonical URL.** Add `<link rel="canonical" href="https://linearb.io/">`.
- [ ] **Share image to the CDN.** Upload `media/share-image.png` to `assets.linearb.io` and point `og:image` at it. It currently points at the draft site.
- [ ] **LinearB mark to the CDN.** `media/linearb-mark.png` is local. Swap for the CDN logo (`linearb-logo-2026-no-text.png`).
- [ ] **Product page links.** "Book a demo" goes to https://linearb.io/book-a-demo. The Explore and Measure links point at the new product pages (`products/ai-assistant/`, `products/mcp-server/`, `products/engineering-metrics/`); map them to the live URLs.
- [ ] **Links waiting on pages.** Two links are in the markup but hidden (`hidden`) until their pages go live: "How the context layer works →" in the hero visual (`products/context-layer/`) and "See workflow automation →" in Act (`products/workflow-automation/`). Remove `hidden` and set the live URL when each page ships.
- [ ] **Third-party marks** (GitHub, Jira, Claude, Cursor, Copilot and the other tool icons) checked against each company's brand rules.
- [ ] **Customer logos, quotes and headshots** checked against marketing's approved list. Headshots come from each customer's case study page.
- [ ] **Breakpoints.** The demos switch layout at 1200, 900, 860 and 560px; the house breakpoint is 1165px. Map these to the Plasmic mobile variant.
- [ ] **Strings in one place.** Demo content sits in `POOL_HA`, `ASK`, `MS`, `AC` and in `data-` attributes on the hero cards; gather into typed props for Studio.
- [ ] **Leftover CSS.** Script for the unused versions is removed, but some of their CSS is still in the stylesheet. It's harmless; drop it as you lift each block.

## Brand notes

Checked against the LinearB brand kit:
- Colours are exact brand hexes, apart from third-party marks.
- Headings are Outfit SemiBold tracked at zero; body copy is Roboto tracked at −1%.
- No heading is over 64px, and no heading, intro or quote ends on a single word.
- Motion only animates `transform` and `opacity`, and settles under `prefers-reduced-motion`.

These differ from the kit on purpose:
- **Hero button:** purple and slightly larger (17px, 56px tall), a marketing decision for the one call to action under a display headline. The closing button uses the same large size.
- **Dark panels:** the Gartner card and the security strip use Teal 800.
- **Heading sizes:** section headings run 40px on desktop and 28px on phones. The phone headline is about 30px, so it holds two lines.
- **Card borders:** 1–1.6px.

## Copy for the Studio components

### Hero
- **Heading:** Drive [productivity | velocity | quality | reporting] with engineering context
- **Subheading:** LinearB accelerates every step of the SDLC, with guardrails and scale built in, *from an agent merging a change to a quarterly AI ROI report.* (the italic part is set darker and heavier)
- **Button:** Book a demo → https://linearb.io/book-a-demo

### Logo strip
- **Label:** Trusted by the teams transforming software delivery
- **Logos:** SurveyMonkey, Peloton, Equinix, Norwegian Cruise Line, Vizio, Gainwell, BigID, Expedia, Syngenta, Ingka, Silicon Labs, Astronomer, Mitratech, Solace

### Explore
- **Heading:** Explore how work moves, in plain language
- **Lede:** Get answers built on LinearB's benchmarks in the app, or bring the same data into Claude, ChatGPT or Cursor through MCP.
- **Prompts (try a prompt):** AI impact report (How is the use of AI impacting our velocity?) · Investment strategy (Where is engineering time going?) · Bottleneck detective (Where is AI work getting stuck?)
- **Links:** See the AI assistant → · See the MCP server →

### Measure
- **Heading:** Measure what AI changes in delivery
- **Lede:** LinearB dashboards track AI adoption and cost, cycle time and DORA metrics for every team. When a team measures something its own way, LinearB builds the metric from a plain-language description.
- **Dashboards (open a dashboard):** AI impact (Is AI helping us ship more?) · AI cost (Where is our AI spend going?) · Delivery (How fast does work reach production?)
- **Link:** See engineering metrics →

### Act
- **Heading:** Act on it in every PR, with agents and workflows
- **Lede:** Your agents and gitStream act on LinearB's context in every PR. LinearB recommends the effort each task needs from how risky the code is, and gitStream merges low-risk changes and routes risky ones to the reviewers who know the code.
- **Workflows (run a workflow):** Match effort to the code (Low on stable code, high where it's risky) · Merge low-risk changes (Ship safe changes without the wait) · Route risky changes to two reviewers (Protect the code that matters most)
- **Link:** See workflow automation → (hidden until the page is live)

### Customer evidence
- **Heading:** How engineering leaders are proving AI impact
- **Gartner card:** A Leader in the 2026 Gartner® Magic Quadrant™ for Developer Productivity Insight Platforms · Get the report →
- **Emburse:** Taking AI ROI to the board. "I use LinearB data and charts directly in my board decks, because my board is specifically asking questions about our use of AI and what our ROI is." Ken Ringdahl, CTO · Read the Emburse story → https://linearb.io/case-studies/emburse
- **Skeelo:** Tying engineering to business priorities. "With leadership, we focus on Investment Distribution, Cycle Time trends, and Delivery Probability. These metrics help connect engineering outcomes to company priorities." Renan Kosicki, CTO · Read the Skeelo story → https://linearb.io/case-studies/skeelo
- **Kraken:** Finding the real cause of review delays. "Size and complexity accounted for maybe 5 to 10% of the slowdown. 70 to 80% came from time zone differences, team silos, and reviewer availability." Nik Sudan, Engineering Operations Lead · Read the Kraken story → https://linearb.io/case-studies/kraken
- **Security strip:** Natively secure, obsessively compliant. Independently audited, with evidence of our controls available on request. LinearB participates in the EU-U.S. Data Privacy Framework. Badges: SOC 1 Type II, SOC 2 Type II, ISO 27001, GDPR
- **Footnote:** Gartner, Magic Quadrant for Developer Productivity Insight Platforms, May 5, 2026. Gartner does not endorse any vendor, product or service depicted in its research publications. Gartner and Magic Quadrant are trademarks of Gartner, Inc. and/or its affiliates.

### APEX
- **Heading:** See whether AI is paying off, pillar by pillar
- **Lede:** APEX is LinearB's framework for proving AI is lifting throughput without costing delivery confidence, efficiency or developer experience.
- **Button:** Read the APEX guide → https://linearb.io/resources/apex-framework

### Latest resources
- **Heading:** Keep up with how AI is changing engineering
- **Lede:** New research, guides and Dev Interrupted episodes from LinearB.
- **Cards:** the three most recent posts; the draft shows a podcast, a guide and a report.

### Closing CTA
- **Heading:** Give your agents and leaders / *the context to act* (two lines, the second in aqua)
- **Button:** Book a demo → https://linearb.io/book-a-demo
