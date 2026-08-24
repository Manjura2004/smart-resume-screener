import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  deleteCandidate as deleteCandidateDb,
  ensureSeedData,
  fetchActiveJob,
  fetchCandidates,
  processResume,
  saveJob,
} from '@/lib/data';
import type { Candidate, Job } from '@/lib/types';

type Toast = { id: number; message: string; kind: 'success' | 'error' | 'info' };

interface AppState {
  loading: boolean;
  error: string | null;
  job: Job | null;
  candidates: Candidate[];
  toasts: Toast[];
  refresh: () => Promise<void>;
  createJob: (input: Omit<Job, 'id' | 'created_at'>) => Promise<Job>;
  uploadResumes: (files: File[]) => Promise<void>;
  removeCandidate: (id: string) => Promise<void>;
  pushToast: (message: string, kind?: Toast['kind']) => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((message: string, kind: Toast['kind'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const activeJob = await fetchActiveJob();
      setJob(activeJob);
      if (activeJob) {
        const list = await fetchCandidates(activeJob.id);
        setCandidates(list);
      } else {
        setCandidates([]);
      }
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load data.';
      setError(msg);
      pushToast(msg, 'error');
    }
  }, [pushToast]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await ensureSeedData();
        await refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to initialize.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const createJob = useCallback(
    async (input: Omit<Job, 'id' | 'created_at'>) => {
      const saved = await saveJob(input);
      setJob(saved);
      setCandidates([]);
      pushToast(`Job "${saved.title}" created. Upload resumes to begin screening.`, 'success');
      return saved;
    },
    [pushToast],
  );

  const uploadResumes = useCallback(
    async (files: File[]) => {
      if (!job) {
        pushToast('Please create a job description first.', 'error');
        return;
      }
      const invalid = files.filter((f) => f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf'));
      if (invalid.length > 0) {
        pushToast(`${invalid.length} file(s) skipped — only PDF resumes are accepted.`, 'error');
      }
      const pdfs = files.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
      if (pdfs.length === 0) return;

      pushToast(`Processing ${pdfs.length} resume(s)...`, 'info');
      const results = await Promise.allSettled(pdfs.map((f) => processResume(job.id, f)));
      let ok = 0;
      let fail = 0;
      results.forEach((r) => {
        if (r.status === 'fulfilled') {
          if (r.value.status === 'error') fail += 1;
          else ok += 1;
        } else {
          fail += 1;
        }
      });
      await refresh();
      if (ok > 0) pushToast(`${ok} resume(s) processed successfully.`, 'success');
      if (fail > 0) pushToast(`${fail} resume(s) failed to process.`, 'error');
    },
    [job, refresh, pushToast],
  );

  const removeCandidate = useCallback(
    async (id: string) => {
      await deleteCandidateDb(id);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      pushToast('Candidate removed.', 'info');
    },
    [pushToast],
  );

  const value = useMemo<AppState>(
    () => ({
      loading,
      error,
      job,
      candidates,
      toasts,
      refresh,
      createJob,
      uploadResumes,
      removeCandidate,
      pushToast,
      dismissToast,
    }),
    [loading, error, job, candidates, toasts, refresh, createJob, uploadResumes, removeCandidate, pushToast, dismissToast],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
