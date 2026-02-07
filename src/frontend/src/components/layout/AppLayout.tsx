import { Outlet } from '@tanstack/react-router';
import { Music2 } from 'lucide-react';

export default function AppLayout() {
  return (
    <>
      <div className="app-background" />
      <div className="app-background-overlay" />
      <div className="min-h-screen flex flex-col relative">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Music2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">AudioForge</h1>
                <p className="text-xs text-muted-foreground">Professional Audio Editor</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1">
          <Outlet />
        </main>
        
        <footer className="border-t border-border bg-card py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2026. Built with <span className="text-amber-600">♥</span> using{' '}
            <a 
              href="https://caffeine.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-amber-600 transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
