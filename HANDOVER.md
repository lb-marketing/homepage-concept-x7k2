# Handover: building the next LinearB product page

You're picking up a series of product page concepts for the LinearB nav refresh. Two pages are done: `products/ai-assistant/` and `products/engineering-metrics/`. The engineering metrics page is the newest and the best reference. Read `README.md` and `CLAUDE.md` first, then this file.

## What this is

- Internal drafts of linearb.io pages, built as plain HTML/CSS/JS with no build step. Each product page is one self-contained `products/<page-name>/index.html` with its own `variants.json`.
- The nav refresh go-live is Mon 2026-10-19. The source of truth is the Google Sheet **"LinearB Platform Nav Spec"** (tabs: Proposed new nav, Workback schedule, V2). Copy refresh is owned by Aaron Thompson with Jamie.
- **Pages still to do.** Each refreshes existing live pages, so start from their live copy:

| Page | Live pages to start from | Also useful |
| :-- | :-- | :-- |
| Workflow automation (gitStream) | `/platform/gitstream` (the spec says make it the main page), `/platform/workflow-automations`, `/platform/programmable-workflows` | gitStream slides and PDF in Drive (July 2026). Docs: docs.gitstream.cm |
| MCP server | `/platform/mcp-server` | Jamie's "AI assistant and MCP" campaign emails in Drive |
| AI code reviews | `/platform/ai-code-reviews`, already the strongest live page | ai-code-review videos and the "Code review became theater" brief in Drive |
| Developer surveys | `/platform/developer-surveys`, generic and dated | Jamie's Surveys launch brief, launch blog and hero video/still in Drive (Oct 2026) |

## How to run it

```bash
python3 serve.py 8124
```

Open http://localhost:8124/products/. `serve.py` also saves choices from the variants panel. It now merges saves, keeping the option list on disk and taking only the chosen option, so an out-of-date tab can't wipe options. Jamie's own server may already be running on 8123 from the main checkout, so use another port.

## Jamie's preferences (they asked for all of these)

- **Don't commit** until Jamie says so. They iterate for a while first.
- **Reuse blocks.** Check the block catalogue in `README.md` and lift existing blocks (from `brand.html` or another product page), changing only the copy. If a block exists in more than one version, ask which one.
- **No eyebrow labels** above headings.
- **No layout shift.** Switching any demo must never move the page. Use `reserve()`, or stack panels in one grid cell (see `.dsh`/`.dwin` in engineering metrics). Measure it in the browser, don't eyeball it.
- **Avoid flat all-white pages.** Use soft full-width colour bands (`.band`, `.band.rev`) and one dark band (`section.night`). Never two bands back to back.
- **Make it creative and interactive.** Demos built from the real product's widgets and data shapes, labelled as sample data.
- **Headlines stay at three lines or fewer** at desktop widths (check 1100, 1280 and 1440px). Headings beside a demo use the smaller size (`.ai-grid h2`, `.bm h2`).
- **Use tool logos** wherever AI tools are named (the simple-icons CDN; see `ICON`/`mark()` in engineering metrics).
- **Customer evidence comes from customers.** Use the homepage `#voices` block, and never a LinearB-branded card in that slot.
- **Interactive bits must make sense.** Jamie pulled the AI ROI sliders because a half-working calculator felt wrong. Prefer static mocks over half-interactive ones.
- **Fill the space.** Text and bars should be large enough that cards don't look empty, with no big blank areas inside panels.

## Copy and brand

- Use the `linearb-copy` skill for every piece of copy (re-read its references for each deliverable) and the `linearb-brand` skill for colours, type and icons. Brand interface icons come from `assets.linearb.io/image/upload/icons/<Name>.svg`, inlined, with stroke set to `currentColor`.
- Only cleared numbers and customers: 8.1 million+ PRs, 4,800 teams, 42 countries; 50+ AI tools; the 19% average cycle time decrease; Syngenta 81%; Kraken review time; Expedia; Yum! Brands. Customer quotes must be verbatim.
- Sentence case, no em dashes, none of the banned words (unlock, seamless, supercharge, deep dive, journey…), at most one negation-as-setup per page.

## Verify facts against the product

On engineering metrics, Jamie asked for every metric to be checked against LinearB's docs. Do this for the next page too:

- **Help center** (linearb.helpdocs.io) for exact metric labels and what's documented. If a capability isn't documented, tone the claim down.
- **The real product**, through **Claude in Chrome** (Jamie's Chrome is signed in to app.linearb.io). Read only: copy widget names and structure, never the org's real numbers. Dashboards live under Dashboards → LinearB Catalog.
- **Benchmark tiers** are Elite / Good / Fair / Needs focus, with thresholds in the help center benchmarks article. Calculate tier chips from them (see `BENCH`/`tierOf()` in engineering metrics). MTTR has no benchmark.

## Useful findings so far

- **The 2026 page inventory** ("LinearB_Website_Page_Inventory" in Drive) flags stale terms on live pages ("SEI", "AI Productivity Platform") and the outdated 6.1M PR stat (current is 8.1M).
- **gitStream automations** that exist: assign code experts, estimated time to review, review sensitive files, label deleted files, label PRs without tests, additional review for large PRs. There is no "label risky changes" automation.
- **AI vs non-AI comparisons** are documented for cycle time and DORA metrics only. Delivery isn't compared tool by tool.
- **Release detection:** tags, PRs or merges to a dedicated branch, or the deployment API. Set company-wide, with overrides per repository (not per team).

## Browser preview quirks

- Screenshots taken while the viewport is emulated at 1280px or wider can render small and cropped. Measure with JS at those widths, and screenshot at the pane's own size or at mobile.
- Hidden panels use `inert`. Charts drawn in SVG should be redrawn at the box's real width, so their text doesn't scale.

## Where the work is

Everything is on branch `claude/linerb-website-overview-73ba1a`, and the engineering metrics work is not committed yet. The zip this file came in is a copy of the working files at handover time. It leaves out `.git`, `v1/` and `media/` (37 MB of video, needed only for the homepage product tour).
