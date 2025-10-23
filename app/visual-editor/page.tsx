"use client";
export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { applyPatch } from 'fast-json-patch';

function VisualEditorInner() {
  const params = useSearchParams();
  const projectId = params.get('project') || '';
  const store = useStore();
  const project = store.projects.find(p => p.project_id === projectId);

  const [patchText, setPatchText] = useState(
    '[\\n  { "op":"replace", "path":"/components/hero_1/props/headline", "value":"TrendPilot — Build Faster" }\\n]'
  );

  if (!project) return <div>Project not found.</div>;

  const tree = project.ui_component_tree ?? {
    root: 'root',
    components: {
      root: { id:'root', type:'Page', props:{}, children:['hero_1','features_1','footer_1'] },
      hero_1: { id:'hero_1', type:'Hero', props:{ headline:'Launch smarter with TrendPilot', sub:'From trends to real apps', ctaText:'Get Started' }, children:[] },
      features_1: { id:'features_1', type:'FeatureGrid', props:{ items:[{title:'Discover',desc:'Find high-signal ideas'},{title:'Evaluate',desc:'See success likelihood'},{title:'Build',desc:'Generate the app UI'}] }, children:[] },
      footer_1: { id:'footer_1', type:'Footer', props:{}, children:[] }
    }
  };

  function apply() {
    try {
      const ops = JSON.parse(patchText);
      const result = applyPatch(JSON.parse(JSON.stringify(tree)), ops, true, false);
      store.updateProject(project!.project_id, { ui_component_tree: result.newDocument as any });
      alert('Patch applied!');
    } catch (e: any) {
      alert('Invalid patch: ' + e.message);
    }
  }

  function exportZip() {
    alert('ZIP export is a placeholder in this demo.');
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Visual Editor</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="font-semibold mb-2">JSON Patch</h2>
          <textarea className="w-full h-64 rounded-lg border p-2 font-mono text-xs" value={patchText} onChange={e=>setPatchText(e.target.value)} />
          <button className="btn mt-2" onClick={apply}>Apply Patch</button>
          <button className="btn mt-2 ml-2" onClick={exportZip}>Export Code as ZIP</button>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Current Component Tree</h2>
          <pre className="text-xs overflow-x-auto">{JSON.stringify(project.ui_component_tree ?? tree, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

export default function VisualEditor() {
  return (
    <Suspense fallback={<div className="opacity-70">Loading…</div>}>
      <VisualEditorInner />
    </Suspense>
  );
}
