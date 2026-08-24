import { useState } from 'react';
import { AppProvider, useApp } from '@/store/AppContext';
import { Sidebar } from '@/components/Sidebar';
import type { PageKey } from '@/components/Sidebar';
import { Toasts } from '@/components/Toasts';
import { Dashboard } from '@/pages/Dashboard';
import { JobDescription } from '@/pages/JobDescription';
import { ResumeUpload } from '@/pages/ResumeUpload';
import { CandidateRanking } from '@/pages/CandidateRanking';
import { CandidateDetails } from '@/pages/CandidateDetails';
import { Loader2, AlertCircle } from 'lucide-react';

function Shell() {
  const [page, setPage] = useState<PageKey>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { loading, error, candidates } = useApp();

  const navigate = (p: PageKey) => {
    setPage(p);
    if (p !== 'details') setSelectedId(null);
  };

  const selectCandidate = (id: string) => {
    setSelectedId(id);
    setPage('details');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar active={page} onNavigate={navigate} candidateCount={candidates.length} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Loading dashboard…</p>
              </div>
            </div>
          ) : error ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-white p-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Something went wrong</h2>
              <p className="mt-1 text-sm text-slate-500">{error}</p>
            </div>
          ) : page === 'dashboard' ? (
            <Dashboard onNavigate={navigate} />
          ) : page === 'job' ? (
            <JobDescription />
          ) : page === 'upload' ? (
            <ResumeUpload onNavigate={navigate} />
          ) : page === 'ranking' ? (
            <CandidateRanking onSelectCandidate={selectCandidate} onNavigate={navigate} />
          ) : page === 'details' && selectedId ? (
            <CandidateDetails candidateId={selectedId} onBack={() => navigate('ranking')} onNavigate={navigate} />
          ) : (
            <Dashboard onNavigate={navigate} />
          )}
        </div>
      </main>
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
