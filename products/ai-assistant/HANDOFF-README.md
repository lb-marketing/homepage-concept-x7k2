# LinearB AI assistant page: handoff

A landing page concept for the LinearB AI assistant, split for build.

| File | What it is |
| :-- | :-- |
| `full-page.html` | The whole page with the chosen copy and layout, for reference |
| `blocks/hero-demo.html` | Hero demo: four metrics, the assistant's streamed answer, and customer proof matched to the question |
| `blocks/role-answers.html` | Role answers: team lead, head of engineering and VP of engineering, one question and reply each |
| `blocks/answer-xray.html` | Answer X-ray: each part of an answer next to the widget, range and filters behind it |
| `blocks/builder.html` | Builder: pick a prompt, watch the query stream, the chart draw and the widget save |

Each block file runs on its own: open it in a browser and it works, with no build step and no libraries.
The blocks are the parts that move. The rest of the page (nav, hero heading and buttons, logo strip,
section headings, MCP band, FAQ, closing CTA, footer) maps to existing Studio components, so it is
not in the blocks. Its copy is at the end of this file.

All product data in the demos is sample data.

## The blocks

### Hero demo
- **Desktop:** four metric cards on the left, the assistant on the right, customer proof in a full-width strip underneath.
  Clicking a metric streams its answer and swaps the proof card to the one that matches that question.
- **Autoplay:** until someone hovers, clicks or tabs into it, it steps to the next metric every 8 seconds,
  with a fill bar on the selected card. Off on phones and with reduced motion.
- **Phones (under 980px):** the metrics become one swipeable row above the answer; the answer panel keeps a fixed
  height and scrolls inside, so nothing below it moves.
- **Content:** `TILES` (the four metrics), `A.agents`, `A.plan`, `A.cycle`, `A.wip` (the answers) and `EV` (proof cards).
  Each metric maps to one APEX pillar: AI leverage, predictability, flow efficiency, developer experience.

### Role answers
- Three cards side by side with an arrow between them for the team lead → head of engineering → VP ladder;
  stacked with downward arrows on phones. Static: nothing to click.
- **Content:** `ALTS`, which reuses `A.stuck`, `A.teams` and `A.roi` for the questions.

### Answer X-ray
- **Desktop:** the answer on the left, its source on the right, row by row. Hovering a row tints both halves.
- **Phones (under 640px):** an Answer / Source toggle flips each row in place, so the source shows exactly where
  its answer was. It flips on its own every 4 seconds with a fill bar until tapped.
- **Content:** in the markup (`#xr`), not in the script.

### Builder
- Sits on the dark band (Slate 800). Picking a prompt types it, streams the SQL into the widget card,
  runs through "Writing query → Running query → Charting result", then draws the chart. Save marks it saved.
  Plays once on its own when it scrolls into view.
- The widget area keeps one height through every step, so the card never changes size while it builds.
- **Content:** `BUILD` (prompt, title, row count, chart, SQL for each).

## Shared code

The top of the script holds what the blocks share: chart helpers (`grouped`, `lines`, `hbars`), the proof cards
(`EV`, `evidence`), the sample answers (`A`) and the answer renderer (`show`). Each block section only runs when its
markup is on the page. When building one block as its own component, keep the shared helpers it uses and drop the rest.

Styling follows the LinearB brand kit (v3): exact brand hexes as CSS variables at the top, Outfit SemiBold headings
at zero tracking, Roboto body at −1%, 2px borders, 24/16/999/40px radii, the 20/32/64/128px spacing scale, and
600-step colours for small coloured text. Motion only animates `transform` and `opacity`, and settles to rest under
`prefers-reduced-motion`.

## Before production

- [ ] **Images to the CDN.** Customer logos and the LinearB mark are embedded as data URIs so the files run offline.
      Swap them for `assets.linearb.io` URLs. Customer logos came from the existing CDN set
      (`kraken_logo_b_w_1b6fd9b633`, `yum-logo`, `Skeelo_4994234ebc`, `expedia`, `syngenta`, `peloton`, `survey-monkey`,
      `vizio`, `mitratech`, `gainwell`, `solace-logo-grey_1`), recoloured to Slate 800.
- [ ] **Customer logos, quotes and figures** checked against marketing's approved list.
- [ ] **Third-party marks** (Claude, ChatGPT, Cursor) checked against each company's brand rules.
- [ ] **Breakpoints.** The demos switch layout at 1000, 980, 860 and 640px; the house breakpoint is 1165px.
      Map these to the Plasmic mobile variant.
- [ ] **Strings in one object.** Most demo content sits in `TILES`, `A`, `EV`, `ALTS` and `BUILD`; the X-ray and the
      chart labels are in markup. Gather them into typed props for Studio.
- [ ] **Links.** "Book a demo", "Start free trial" and "Read the … story" (Syngenta, Expedia) point at placeholders.
- [ ] **Icons.** The sparkle (`Ai-Prompt-Spark`) and the Builder prompt icon (`Application-Add`) are from the brand icon
      set. The small arrows, tick, spinner and send arrow are drawn, because the set has nothing close.
- [ ] **Survey data.** None of the demos show developer survey answers: the assistant can't read survey data in this release.

## Copy for the Studio components

### Hero

- **Heading:** The AI assistant for your software factory
- **Subheading:** The LinearB AI assistant puts your engineering context behind every answer. Ask about delivery, AI impact or developer experience in your own words, and get back what changed, why, and where to act in seconds.
- **Buttons:** Book a demo · Start free trial

### Logo strip

- **Label:** Trusted by the teams transforming software delivery
- **Logos:** Expedia, Syngenta, Peloton, Kraken, SurveyMonkey, Yum! Brands, Vizio, Mitratech, Skeelo, Gainwell, Solace

### Role answers section

- **Heading:** Get answers scoped to the decision in front of you
- **Lede:** A team lead asks about this week's PRs, and a VP of engineering asks about the quarter. LinearB answers both from the same data, limited to the teams each person can already see.

### Answer X-ray section

- **Heading:** Check every answer against the data behind it
- **Lede:** The LinearB AI assistant names the widget, dashboard, date range and teams behind every part of an answer, so you can open the same view and check it yourself.
- **Built on your LinearB widgets:** Answers come from the same widgets and metric definitions that power your dashboards.
- **Scoped to what you can see:** Admins, editors and viewers get answers about the teams they can already access, and individual metrics follow your organization's privacy setting.

### Builder section (dark band)

- **Heading:** Build custom metrics in plain language
- **Lede:** Switch the assistant to Builder and describe the metric you need. LinearB writes the query, charts the result, and saves it as a widget on a dashboard your whole team sees.
- **Note:** Every widget comes with its SQL, so you can edit the query, widget type and axes before you save.

### MCP band

- **Heading:** Bring the same answers into the AI tools you already use
- **Copy:** The LinearB MCP server connects Claude, ChatGPT, Cursor or any tool that supports MCP to the data behind the assistant, so you can work with it next to everything else in that tool.
- **Pills:** Claude, ChatGPT, Cursor, Any MCP-compatible tool
- **Button:** See the MCP server → https://linearb.io/platform/mcp-server

### FAQ

- **Who can use the AI assistant?:** Admins, editors and viewers. LinearB scopes every answer to the teams that person can already see, so a team lead asking about delivery gets answers about their own teams.
- **Where do the answers come from?:** From the same widgets and metric definitions behind your LinearB dashboards. Each answer names the widget, dashboard and date range it used, so you can open the same view and compare.
- **Can I keep an answer?:** Answers stay in the chat, and you can copy them. To keep a metric on a dashboard, switch to Builder, describe the widget, and save it to Studio.
- **Can I see and edit the query Builder writes?:** Yes. Builder shows the SQL behind every widget. You can edit it, run it again, and change the widget type and axes before you save.
- **Does it respect individual metric privacy settings?:** Yes. If your organization has turned off individual-level metrics, the assistant doesn't return individual-level data.
- **How accurate are the answers?:** LinearB grounds every answer in your LinearB data and names the widget it ran. As with any AI-generated answer, check important numbers against the dashboard before you act on them.

### Closing CTA

- **Heading:** Ask LinearB about your software factory
- **Buttons:** Book a demo · Start free trial
