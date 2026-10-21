# LinearB website concepts

Internal drafts of linearb.io pages: the homepage concept and the product pages for the nav refresh. Nothing here is the live site. Every page is `noindex`, and all product data in the demos is sample data.

| Page | File |
| :-- | :-- |
| Homepage concept (v2) | `brand.html` (`index.html` redirects to it) |
| Homepage concept (v1, frozen) | `v1/brand.html` |
| Product pages index | `products/index.html` |
| AI assistant | `products/ai-assistant/index.html` |
| Engineering metrics | `products/engineering-metrics/index.html` |
| MCP server | `products/mcp-server/index.html` |
| MCP server components (Plasmic) | `products/mcp-server/components/`: the hero demo, connection map and recipe library as React code components, with a preview page |

## Run it locally

```bash
python3 serve.py 8123
```

Then open http://localhost:8123/brand.html or http://localhost:8123/products/.

`serve.py` serves the folder and also saves choices from the variants panel. A plain static server shows the pages but can't save.

**Homepage handover:** `python3 build-handover.py` writes `_exports/LinearB-homepage-handover.zip` for the web team: the chosen page with no nav, footer, variants panel or unused versions, plus `HANDOVER-HOMEPAGE.md` as its README. Re-run it after `brand.html` changes.

## The variants panel

`variants.js` adds a review panel to every page for comparing versions:

- **Headline copy:** an element with `data-variant="<id>"` takes its options from the page folder's `variants.json`. In an option, ` / ` is a line break and `*text*` is the indigo emphasis.
- **Whole sections:** sibling elements sharing `data-slot="<slot>"`, each named with `data-option="<name>"`. The default carries `data-default`, the rest `hidden`.

Locking in a choice writes it into the page file, so it's the default with or without the panel. Remove the `<script src="…variants.js">` tag to ship a page without it.

## Adding a product page

1. Make `products/<page-name>/` with an `index.html` and a `variants.json`.
2. Build it from the blocks below. Start a new block only when no existing one does the job, and add it to the catalogue when you do.
3. Load the panel with `<script src="../../variants.js"></script>`. Keep paths relative, since shared copies may be served from a subfolder.
4. Add the page to `products/index.html`.

## Block catalogue

**The rule: one job, one block.** When a section does the same job as a block below, reuse that block's markup and styles, and change only the copy. Ten slightly different versions of one block are harder to build, hand off and maintain than one.

`brand.html` layers a terminal theme under the brand styles, so when you lift a block from it, take its final rendered styles rather than copying its CSS rules.

| Block | What it's for | Canonical version | Used on | Changes per page |
| :-- | :-- | :-- | :-- | :-- |
| Nav | Logo, main links, demo button | `header .nav` in any page | All | Current page link |
| Hero | Two-line headline, subheading and CTAs. The homepage leads with one large purple Book a demo button; product pages keep two CTAs | `section.hero` | All | Headline and subheading (variants) |
| Large button | The one call to action under a display headline: 17px text, 56px tall. Every other button stays the standard size | `.hero .ctas .btn.solid` in `brand.html` | Homepage (hero, plain close) | Nothing |
| Context layer hero | Homepage hero visual: tools on the left flow through Normalize, Enrich and Augment into a People card (an Ask AI prompt) and an Agents card (a Claude Code session acting on cost, velocity and quality) | `.tn-ha` in `brand.html` | Homepage | Stories and card copy |
| Hero demo stage | Interactive demo in white cards on a Teal 200 panel | `.stage-wrap > .aqua` in `products/ai-assistant` | AI assistant, engineering metrics, MCP server | The demo inside |
| Logo strip | Scrolling customer logos | **Two versions, see open decisions** | All | Nothing |
| Section heading | `h2` with an optional lede paragraph below it, no eyebrow label above | `.sect h2` + `.lede` | All | Copy |
| Colour band | Soft full-width teal-to-indigo gradient behind a section; cards on it go white | `.band` / `.band.rev` in `products/engineering-metrics` (same gradients as `brand.html` `.seats` and `.voices`) | Homepage, engineering metrics, MCP server (trust) | Which sections carry it |
| Dark band | The one Slate 800 section on a page | `section.night` | AI assistant, engineering metrics, MCP server | Content |
| Text beside a demo | Heading and copy in one column, a demo in the other. Headings drop to 30–42px so they hold to three lines | **Four versions, see open decisions** | AI assistant, engineering metrics | Copy and demo |
| Cross-link band | Light grey panel with a short heading, one line of copy and a button to a related page | `.mcp` in `products/ai-assistant` | AI assistant (MCP server), engineering metrics (custom metrics builder), MCP server (AI assistant) | Heading, line, button and link |
| Card grid | Two-by-two cards, each with a small mock of the product UI | `.acts` in `products/engineering-metrics` | Engineering metrics | Cards |
| Recipe cards | Four-across cards, each with a preview of what it makes, the tools it connects, a mode tag, a prompt and a working copy button. A line per mode above the grid says what Ask, Automate and Build mean, and a mode filter dims the cards it leaves out, so the grid keeps its height | `.recipes` in `products/mcp-server` | MCP server | Recipes |
| Connection graph | Hero demo: a prompt types, tool logos light up as each is called, pulses run into the AI tool, and the result lands as the app it was written to (Slack, Google Docs, Google Slides, ChatGPT) | `.cx` and `.deck` in `products/mcp-server` | MCP server | Recipes and result windows |
| Connection map | Dark band diagram: your AI tool at the centre, LinearB as the biggest source with its areas around it, and every other tool connected too. Choosing a tool lights LinearB and that tool flowing into the AI tool, and the caption shows what each brings and what you can build with both. A dashed "any MCP server" node marks the tools as a sample. The caption runs full width under the copy and the map on wide screens | `.map` in `products/mcp-server` | MCP server | Tools, areas and captions |
| Trust notes | Three white cards with a brand icon, heading and line, above the security bar | `.trust` in `products/mcp-server` | MCP server | Notes |
| Picker and panel | Buttons or cards that switch one panel. The panel holds its tallest state so switching never moves the page: either `reserve()`, or all panels stacked in one grid cell (`.dwin`) | `reserve()` and `.dsh` in `products/engineering-metrics` | AI assistant (hero tiles), engineering metrics (hero, DORA, AI tools, dashboards), MCP server (hero recipes) | Data |
| Explore, Measure, Act | LinearB's approach. Each heading leads with its step in that step's colour (indigo, teal, coral), with a linked three-step trail under it. Three sections with a picker beside one window: Explore is the AI assistant chat, Measure a dashboard, Act a pull request timeline with effort and label pills. Each window holds its tallest state | `#ask`, `#measure`, `#act` in `brand.html` | Homepage | Prompts, dashboards and pull requests |
| APEX view | Four pillar cards in one window, each with the question it answers, a metric and chart, and the LinearB products behind it. Charts and product lines line up across a row | `#apex-overview` in `brand.html` | Homepage | Data |
| Customer evidence | Gartner card, three customer quotes with headshots and outline story buttons, and a dark security bar in the Gartner card's teal | `brand.html` `#voices` | Homepage, engineering metrics (MCP server uses only its security bar) | Heading; which quotes |
| Latest resources | Three recent posts, or a featured guide | `brand.html` `#latest` | Homepage | Posts |
| FAQ | Question list that opens one answer at a time | `section.faq` | AI assistant, engineering metrics, MCP server | Questions |
| Closing CTA, homepage | A two-line heading, its second line in aqua, over one large Book a demo button on a dark centred panel. Other versions in the variants panel: the live workflow count, tools sending events into the button, and a Claude Code session that offers the CTAs | `brand.html` `.close` | Homepage only | Heading |
| Closing CTA, product pages | Last heading left and the two CTAs right, on an aqua panel | `#start .close` in `products/ai-assistant` | All product pages | Heading (variants) |
| Footer | Page name and draft note | `footer.foot` | All | Page name |

### Open decisions

These blocks exist in more than one version. Pick one, update the pages to match, and move it into the table above.

- **Logo strip:** the homepage uses `section.proof` (with a slot for four positions). The product pages use `section.lstrip`.
- **Text beside a demo:** four column ratios so far. The AI assistant page has `.xr-grid` (1 : 1.25) and `.b-grid` (0.85 : 1.15). Engineering metrics has `.ai-grid` (0.85 : 1.15) and `.bm` (0.8 : 1.2). The MCP server page uses `.ai-grid` in its dark band.
- **Customer evidence on the AI assistant page:** it still uses its own proof cards (`.ev`) instead of the homepage block.

## Page conventions

- **Mode colours (MCP server):** Ask is indigo, Automate is teal (Teal 500, with Teal 700 text on Teal 200), Build is coral (Red 500, with Red 700 text on Red 200). Set `data-mode="ask|auto|build"` and use `--m`, `--m-soft` and `--m-ink`.

- **No eyebrow labels** above section headings.
- **Never two colour bands back to back.** Alternate banded, white and the one dark band down the page.
- **Customer evidence comes from customers.** No LinearB-branded cards in that slot.
- **Interactive demos never shift the page:** fixed heights, or `reserve()` for panels whose content changes.
- **Sample data is labelled as sample data** wherever it appears.
- **Copy** follows the LinearB copy rules: sentence case, no em dashes, and only cleared numbers and customers.
