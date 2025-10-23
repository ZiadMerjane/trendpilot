import Link from 'next/link';
export default function Home(){
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">TrendPilot</h1>
      <p className="opacity-80">Start at the Dashboard to explore ideas.</p>
      <Link className="btn" href="/dashboard">Open Dashboard</Link>
    </div>
  );
}
