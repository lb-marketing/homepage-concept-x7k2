# MCP server page: Plasmic code components

The three moving parts of `products/mcp-server/`, packaged as React code components for Plasmic Studio, following the web guidance in the `linearb-brand` skill: one dynamic component each, no page around it, and all copy and numbers in one object.

Everything else on the page is Studio's job, using components that already exist: the hero heading and buttons, the logo carousel, the dark band heading and lede, the section headings, the trust cards, the security bar, the cross-link band, the FAQ accordion and the closing CTA.

Open `preview/index.html` through `serve.py` to see all three. Use the width buttons to check how each one responds to the space it's given.

| Component | Where it goes | What it does |
| :-- | :-- | :-- |
| `McpRecipeDemo` | Under the hero copy | Four recipe cards. Picking one types the prompt into the AI tool, lights up and pulses each tool it calls, then lands the result as a Slack message, Google Doc, Google Slides deck or ChatGPT answer. Autoplays once on screen until someone interacts. |
| `McpConnectionMap` | In the dark band | The AI tool at the centre, LinearB and its six areas on one side, ten other tools plus an "any MCP server" node around it. Picking a tool or area updates the caption underneath. Has an `intro` slot for the heading, lede and client chips beside the map. |
| `McpRecipeLibrary` | Recipes section, under its heading and lede | A line per mode (Ask, Automate, Build), a mode filter, eight recipe cards with a preview and a copy button, and the prompt library link. |

## Props

Each component takes:
- **`content`**: every string and number it shows, typed in its `content.ts`. The default is the current page copy. This is what to edit in Studio.
- **`icons`**: tool logos keyed by short name (`linearb`, `slack`, `jira`…). The default is in `shared/icons.ts`.

The demo also takes `autoplay` and `dwellMs`, and the map takes `autoplay`, `autoplayMs` and the `intro` slot. `plasmic-register.tsx` registers all three. Set `importPath` there to wherever the files land.

## How they're built

- **They size to their container, not the window.** Every breakpoint is a container query, so the components work in any column in Studio, including the 588px content width the site uses below 1165px. The widths checked are 1152, 900, 588 and 343px.
- **Nothing is measured to lay them out**, so the first paint is already right and server and client render the same thing:
  - The map and the demo's graph keep a fixed aspect ratio for their width. Their lines are worked out from the content in viewBox units, and node sizes are a share of the width.
  - Every caption and every prompt is rendered in one grid cell, with only the active one visible, so each box is always as tall as its tallest version and nothing moves the page.
- **Animation is transform and opacity only**, apart from one exception. Hover rings and halos sit on their own layers and fade in. The prompt types by real elapsed time, not a per-frame step.
  - The exception is the pulses along the lines, which animate `stroke-dashoffset` on short SVG paths.
- **Reduced motion:** with `prefers-reduced-motion`, nothing autoplays, types or pulses. Each component shows its first state, finished.
- **Colours are brand variables** (`--lb-*` from `linearb-brand.css`, which the site already loads). The one exception is the demo's result windows, which use Slack's, Google's and ChatGPT's own interface colours to look like those apps. Those are declared once at the top of `McpRecipeDemo.module.css`.
- **No new libraries.** React and CSS modules only.

## Before publishing

- **Logos:**
  - Upload the third-party logos to Cloudinary and swap the URLs in `shared/icons.ts`. They currently load from the simple-icons CDN on jsDelivr, which is fine for review but not for production.
  - The LinearB mark and Slack's four-colour mark are inlined, so they need nothing.
  - Each third-party mark needs a check against that company's brand guidelines.
- **Sample data:** all product data is sample data, and the demo says so under the stage. The tool names are the LinearB MCP server's real ones.
- **Changes from the draft page:**
  - The small "What you can build with both" labels in the map caption are sentence case, not uppercase, per the brand rule that only eyebrows are uppercase.
  - Medium weights are 400 or 700, since the site loads Roboto at those weights only.
  - The hero's Google Doc now crops to the height the other result windows set, like a real scrolling document, so it no longer leaves white space under the other windows on a phone.
