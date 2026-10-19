import { registerComponent } from '@plasmicapp/host';
import { DEFAULT_ICONS } from './shared/icons';
import { McpRecipeDemo } from './McpRecipeDemo/McpRecipeDemo';
import { DEFAULT_CONTENT as DEMO_CONTENT } from './McpRecipeDemo/content';
import { McpConnectionMap } from './McpConnectionMap/McpConnectionMap';
import { DEFAULT_CONTENT as MAP_CONTENT } from './McpConnectionMap/content';
import { McpRecipeLibrary } from './McpRecipeLibrary/McpRecipeLibrary';
import { DEFAULT_CONTENT as LIBRARY_CONTENT } from './McpRecipeLibrary/content';

/* Registers the three MCP server page components with Plasmic Studio. Call from the app host page
   (plasmic-host.tsx) next to the other registrations. Set importPath to wherever these files land in the site repo.

   Each component takes all of its copy and numbers in one `content` object, typed in its content.ts, with the
   current page copy as the default. `icons` maps the short tool names used in `content` to logo files. */
const ICONS_HELP = 'Tool logos by short name. Swap the simple-icons URLs for Cloudinary ones before publishing.';

registerComponent(McpRecipeDemo, {
  name: 'McpRecipeDemo',
  displayName: 'MCP recipe demo',
  description: 'Hero demo: pick a recipe, watch the prompt run across LinearB and other tools, and see the result in the app it lands in.',
  importPath: './components/mcp-server/McpRecipeDemo/McpRecipeDemo',
  importName: 'McpRecipeDemo',
  props: {
    content: { type: 'object', defaultValue: DEMO_CONTENT, description: 'Recipes, prompts, tool calls, result windows, graph layout and status text. Sample data.' },
    icons: { type: 'object', defaultValue: DEFAULT_ICONS, description: ICONS_HELP },
    autoplay: { type: 'boolean', defaultValue: true, description: 'Play through the recipes once on screen, until someone interacts.' },
    dwellMs: { type: 'number', defaultValue: 9000, description: 'How long each recipe stays up while autoplaying, in ms.' },
  },
});

registerComponent(McpConnectionMap, {
  name: 'McpConnectionMap',
  displayName: 'MCP connection map',
  description: 'Dark band map: the AI tool at the centre, LinearB and every other tool feeding it, with a caption per tool and LinearB area.',
  importPath: './components/mcp-server/McpConnectionMap/McpConnectionMap',
  importName: 'McpConnectionMap',
  props: {
    intro: { type: 'slot', description: 'Heading, lede and client chips that sit beside the map on wide screens.' },
    content: { type: 'object', defaultValue: MAP_CONTENT, description: 'LinearB areas and MCP tools, the other tools, captions and labels.' },
    icons: { type: 'object', defaultValue: DEFAULT_ICONS, description: ICONS_HELP },
    autoplay: { type: 'boolean', defaultValue: true, description: 'Step through the tools once on screen, until someone interacts.' },
    autoplayMs: { type: 'number', defaultValue: 5000, description: 'Time on each tool while autoplaying, in ms.' },
  },
});

registerComponent(McpRecipeLibrary, {
  name: 'McpRecipeLibrary',
  displayName: 'MCP recipe library',
  description: 'What Ask, Automate and Build mean, a mode filter, and recipe cards with a preview, a prompt and a copy button.',
  importPath: './components/mcp-server/McpRecipeLibrary/McpRecipeLibrary',
  importName: 'McpRecipeLibrary',
  props: {
    content: { type: 'object', defaultValue: LIBRARY_CONTENT, description: 'Mode lines, filter labels, recipes with their previews, and the prompt library link.' },
    icons: { type: 'object', defaultValue: DEFAULT_ICONS, description: ICONS_HELP },
  },
});
