import { FileText, Upload, LayoutDashboard, Users, Briefcase, ScanSearch } from 'lucide-react';

export type PageKey = 'dashboard' | 'job' | 'upload' | 'ranking' | 'details';

interface NavItem {
  key: PageKey;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'job', label: 'Job Description', icon: Briefcase },
  { key: 'upload', label: 'Resume Upload', icon: Upload },
  { key: 'ranking', label: 'Candidate Ranking', icon: Users },
];

interface SidebarProps {
  active: PageKey;
  onNavigate: (page: PageKey) => void;
  candidateCount: number;
}

export function Sidebar({ active, onNavigate, candidateCount }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
          <ScanSearch className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight text-slate-900">Smart Resume</h1>
          <p className="text-xs leading-tight text-slate-400">Screener</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
              {item.key === 'ranking' && candidateCount > 0 && (
                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {candidateCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <FileText className="h-4 w-4" />
            Hybrid Scoring Engine
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            40% Skills · 25% Experience · 15% Education · 10% Projects · 10% Semantic
          </p>
        </div>
      </div>
    </aside>
  );
}
