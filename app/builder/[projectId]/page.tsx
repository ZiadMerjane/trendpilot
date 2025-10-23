'use client';
import { useParams } from 'next/navigation';
import type { AppSpec, ComponentTree } from '@/lib/types';
import { useStore } from '@/lib/store';
import Link from 'next/link';

function defaultSpec(name:string): AppSpec {
  return {
    name, description: "Generated app from accepted idea",
    stack: { framework:"nextjs14", lang:"ts", styling:["tailwind","shadcn"], db:"none", auth:"none" },
    pages:[
      { route:"/", purpose:"landing", sections:["hero","features","cta"]},
      { route:"/dashboard", purpose:"app", widgets:["ideas","charts","tasks"]}
    ],
    components:[
      { type:"Hero", props:{ headline:"Launch smarter with TrendPilot", sub:"From trends to real apps", ctaText:"Get Started" }},
      { type:"FeatureGrid", props:{ items:[{title:"Discover",desc:"Find high-signal ideas"},{title:"Evaluate",desc:"See success likelihood"},{title:"Build",desc:"Generate the app UI"}]} }
    ],
    api:[ { route:"/api/ideas", method:"GET", returns:"Idea[]" } ],
    assets:[ { name:"logo.svg", kind:"image", source:"placeholder" } ]
  };
}

function initialTree(): ComponentTree {
  return {
    root: "root",
    components: {
      root: { id:"root", type:"Page", props:{}, children:["hero_1","features_1","footer_1"] },
      hero_1: { id:"hero_1", type:"Hero", props:{headline:"Launch smarter with TrendPilot", sub:"From trends to real apps", ctaText:"Get Started"}, children:[] },
      features_1: { id:"features_1", type:"FeatureGrid", props:{items:[{title:"Discover",desc:"Find high-signal ideas"},{title:"Evaluate",desc:"See success likelihood"},{title:"Build",desc:"Generate the app UI"}]}, children:[] },
      footer_1: { id:"footer_1", type:"Footer", props:{}, children:[] }
    }
  };
}

export default function BuilderPage(){
  const { projectId } = useParams<{projectId:string}>();
  const store = useStore();
  const project = store.projects.find(p=>p.project_id===projectId);
  if (!project) return <div>Project not found.</div>;
  const spec = defaultSpec(project.project_id);
  const tree = project.ui_component_tree ?? initialTree();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">App Builder Wizard</h1>
        <Link className="btn" href={`/visual-editor?project=${projectId}`}>Open Visual Editor</Link>
      </div>
      <div className="card p-4">
        <pre className="text-xs overflow-x-auto">{JSON.stringify(spec, null, 2)}</pre>
      </div>
      <div className="card p-4">
        <h2 className="font-semibold mb-2">Component Tree (preview)</h2>
        <pre className="text-xs overflow-x-auto">{JSON.stringify(tree, null, 2)}</pre>
      </div>
    </div>
  );
}
