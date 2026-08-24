import { useRef, useState } from 'react';
import { useApp } from '@/store/AppContext';
import { ProcessingBadge } from '@/components/StatusBadge';
import { UploadCloud, FileText, X, AlertCircle, Briefcase } from 'lucide-react';
import type { PageKey } from '@/components/Sidebar';

export function ResumeUpload({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const { job, candidates, uploadResumes } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<File[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setPending((prev) => [...prev, ...arr]);
  };

  const handleUpload = async () => {
    if (pending.length === 0) return;
    const files = pending;
    setPending([]);
    await uploadResumes(files);
  };

  const removePending = (idx: number) => {
    setPending((prev) => prev.filter((_, i) => i !== idx));
  };

  if (!job) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No active job description</h3>
          <p className="mt-1 text-sm text-slate-500">Create a job description before uploading resumes.</p>
          <button
            onClick={() => onNavigate('job')}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Briefcase className="h-4 w-4" /> Create Job Description
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resume Upload</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload PDF resumes for "{job.title}". The screener extracts text, parses structured data, and scores each candidate.
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed bg-white p-10 text-center transition ${
          dragOver ? 'border-slate-900 bg-slate-50' : 'border-slate-300'
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <UploadCloud className="h-7 w-7 text-slate-500" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">Drag & drop PDF resumes here</h3>
        <p className="mt-1 text-sm text-slate-500">or click to browse — only PDF files are accepted</p>
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <FileText className="h-4 w-4" /> Browse Files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {pending.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Pending Upload ({pending.length})</h2>
            <button
              onClick={handleUpload}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <UploadCloud className="h-4 w-4" /> Upload & Process
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {pending.map((f, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-2.5">
                <FileText className="h-4 w-4 text-slate-500" />
                <span className="flex-1 truncate text-sm text-slate-700">{f.name}</span>
                <span className="text-xs text-slate-400">{(f.size / 1024).toFixed(0)} KB</span>
                <button onClick={() => removePending(idx)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Uploaded Resumes ({candidates.length})</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {candidates.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-slate-400">No resumes uploaded yet.</div>
          )}
          {candidates.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
              <FileText className="h-5 w-5 shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{c.name}</p>
                <p className="truncate text-xs text-slate-400">{c.file_name}</p>
              </div>
              <ProcessingBadge status={c.status} />
              {c.status === 'error' && (
                <span className="hidden max-w-xs truncate text-xs text-rose-500 sm:block">{c.error_message}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
