# LinearB engineering metrics page: handoff

A product page concept for the nav refresh's "Engineering metrics (DORA, AI)" item. It merges three live pages into one: `/platform/engineering-metrics`, `/platform/dora-metrics` and `/platform/ai-developer-productivity-insights`.

| File | What it is |
| :-- | :-- |
| `LinearB-engineering-metrics-page.html` | The whole page with the chosen copy, as one file. It opens in a browser with no build step and no libraries |
| `HANDOFF-README.md` | This file |

All product data in the demos is sample data, labelled on the page.

## Sections, top to bottom

| Section | Block (see the repo README's block catalogue) | Notes |
| :-- | :-- | :-- |
| Hero | Hero | Two-line headline, subheading, two CTAs |
| Cycle time demo | Hero demo stage + picker and panel | Phases with benchmark tiers. Switches between all PRs, AI-assisted PRs and PRs without AI. Autoplays until someone interacts |
| Logo strip | Logo strip (product page version) | Same as the AI assistant page |
| DORA | Colour band + picker and panel | Four metric cards switch one panel of leading indicators and PRs or incidents |
| AI | Dark band + text beside a demo | Adoption per tool, with tool logos. Delivery with and without AI across all tools |
| Dashboards | Colour band + picker and panel | Software Factory, AI ROI and Engineering Health mocks. All three share one grid cell, so switching never moves the page |
| Benchmarks | Text beside a demo | The organization's tier on eight benchmarked metrics |
| Custom metrics band | Cross-link band | Same block as the AI assistant page's MCP band |
| Act on it | Card grid | Four cards, each with a small mock of the product UI |
| Customer evidence | Customer evidence (homepage `#voices`) | Identical to the homepage block, including the row alignment fix |
| FAQ, closing CTA, footer | FAQ, closing CTA (product pages), footer | |

## Behaviour to keep

- **Nothing moves the page.** Every switching demo holds the height of its tallest state, either through `reserve()` or by stacking its panels in one grid cell.
- **Tier chips come from data.** Each chip is calculated from LinearB's published benchmark thresholds (`BENCH` in the script, taken from the help center benchmarks article). Don't hand-set them.
- **Autoplay stops for good on first interaction**, and every animation settles under `prefers-reduced-motion`.
- **Phones:** metric and dashboard cards become swipeable rows, charts stack, and nothing scrolls sideways at 375px.

## Facts checked against LinearB's docs and the product

- **Metric labels match the product:** Deploy frequency, Cycle time (used as DORA lead time), Change failure rate, Mean time to restore (no benchmark, so no chip), PR size, Merge frequency, Rework rate, PRs merged without review.
- **AI comparisons cover only what's documented:** delivery with and without AI on cycle time and DORA metrics, plus adoption per tool. Delivery is not compared tool by tool.
- **Benchmarks are org-level,** which is how LinearB shows them.
- **Dashboard widget names come from the live LinearB Catalog dashboards.** AI ROI's cost per effective PR uses the documented formula: (developer cost + AI spend) ÷ effective PRs.

## Open items

- **Placeholder links (`#top`):** the custom metrics builder page, the Syngenta story and customer stories. The Software Factory dashboard has no help article to link yet.
- **"50+ AI tools":** cleared in the positioning doc, but the help docs list 8 tools.
- **AI assistant:** it's in open beta, and the "Ask what's slowing delivery down" card doesn't say so.
- **Third-party tool logos** (GitHub Copilot, Cursor, Claude, Windsurf, OpenAI) load from the simple-icons CDN. Check each against that company's brand guidelines before launch.
- **Images:** customer logos and the Gartner badge load from `assets.linearb.io`. Most other logos are embedded in the page, so it works offline apart from fonts, tool icons and those images.

## Brand check (linearb-brand web checklist, 2026-10-16)

**Passes:**
- Outfit 600 headings, Roboto body, Roboto Mono only for figures. No negative tracking on headings, and body text at −1%.
- Sentence-case headings, no eyebrow labels, nothing above 64px.
- The logo is inlined in Slate 800. The dashboard icons come from `icons.json`.
- Customer logos and quotes come from the homepage block.
- Small coloured text uses the `*-600` step. No sideways scrolling down to 375px.
- Everything settles under `prefers-reduced-motion`.

**Fixed during the check:** four off-palette colours swapped for tokens (Slate 300, Indigo 300, Green 200, Indigo 700). The AI comparison bars now animate with `transform` instead of `width`.

**Still to decide or fix:**

1. **Section grounds.** The DORA and dashboards bands use the homepage's gradient (`#e5f7f9` → `#ecefff`), which isn't one of the five web grounds. The customer evidence block uses it too. Changing it means changing the homepage as well, to keep the shared block the same.
2. **Customer evidence block colours.** These are homepage values that aren't brand tokens: the Gartner card `#003232` and `#7fe0ea`, a `1.5px #e2e8f0` card border, and `#8798a7` for the footnote. Fix them on both pages together.
3. **Motion.** Three demos animate layout properties instead of `transform`/`opacity`:
   - The hero cycle time bar animates `flex-grow`.
   - The benchmark dots animate `left`.
   - The picker cards animate colour on hover.
4. **Accessibility.** Charts are `aria-hidden` and have no text alternative yet. Each needs an `aria-label` describing what it shows.
5. **Plasmic.** The guide asks for one dynamic component per handoff, with every string and number in one object at the top. The page would split into these components: cycle time demo, DORA explorer, AI tools widget, dashboards, benchmark ladder. Studio already has the nav, logo strip, headings, CTAs, testimonials and FAQ.
6. **Spacing.** Some gaps are hand-set rather than taken from the four spacing variables.
7. **Assets.** These still load from outside `assets.linearb.io`:
   - Google Fonts.
   - Third-party tool icons from the simple-icons CDN.
   - Embedded logos (the strip and the LinearB mark).
8. **Title case.** The dashboard mocks keep the product's own widget names (for example "Who Does the Work"), so they're title case on purpose.
