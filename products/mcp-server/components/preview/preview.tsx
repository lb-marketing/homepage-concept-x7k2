import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { McpRecipeLibrary } from '../McpRecipeLibrary/McpRecipeLibrary';
import { McpConnectionMap } from '../McpConnectionMap/McpConnectionMap';
import { McpRecipeDemo } from '../McpRecipeDemo/McpRecipeDemo';

/* Preview only: renders each component at a chosen width, so the container queries can be checked without
   resizing the window. Not part of the handoff. */
const WIDTHS = [1152, 900, 588, 343];

function Frame({ title, dark, children }: { title: string; dark?: boolean; children: React.ReactNode }) {
  return (
    <section className={dark ? 'pv-sec pv-dark' : 'pv-sec'}>
      <p className="pv-h">{title}</p>
      {children}
    </section>
  );
}

function App() {
  const [w, setW] = useState(WIDTHS[0]);
  return (
    <>
      <div className="pv-bar">
        <b>MCP server components</b>
        <span>Width</span>
        {WIDTHS.map(x => <button key={x} type="button" aria-pressed={w === x} onClick={() => setW(x)}>{x}px</button>)}
      </div>
      <div className="pv-wrap" style={{ maxWidth: w }}>
        <Frame title="McpRecipeDemo"><McpRecipeDemo /></Frame>
        <Frame title="McpConnectionMap (with an intro slot)" dark>
          <McpConnectionMap intro={<div className="pv-intro"><h2>Combine LinearB with every other tool you connect</h2><p>The LinearB MCP server covers delivery, quality, throughput, developer experience, DORA metrics and AI adoption. Your AI tool combines it with any other MCP server or connector you add.</p></div>} />
        </Frame>
        <Frame title="McpRecipeLibrary"><McpRecipeLibrary /></Frame>
      </div>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
