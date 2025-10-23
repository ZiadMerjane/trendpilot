import "./globals.css";
import { ReactNode } from "react";
import AuthButtons from '@/components/AuthButtons';
export const metadata = { title: "TrendPilot", description: "From trends to real apps" };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="container flex items-center justify-between py-4">
            <a href="/dashboard" className="font-bold">TrendPilot</a>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/dashboard">Dashboard</a>
              <a href="/projects">Projects</a>
              <AuthButtons />
            </nav>
          </div>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="container py-10 text-xs opacity-70">© {new Date().getFullYear()} TrendPilot</footer>
      </body>
    </html>
  );
}
