import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Briefcase, Plus, X, Save, AlertCircle } from 'lucide-react';
import { SKILL_DICTIONARY } from '@/lib/skills';

export function JobDescription() {
  const { job, createJob, pushToast } = useApp();
  const [title, setTitle] = useState(job?.title ?? '');
  const [description, setDescription] = useState(job?.description ?? '');
  const [skills, setSkills] = useState<string[]>(job?.required_skills ?? []);
  const [skillInput, setSkillInput] = useState('');
  const [minExp, setMinExp] = useState<number>(job?.min_experience_years ?? 0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addSkill = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInput('');
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput('');
  };

  const removeSkill = (s: string) => setSkills((prev) => prev.filter((x) => x !== s));

  const suggestions = SKILL_DICTIONARY
    .map((s) => s.canonical)
    .filter((s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s))
    .slice(0, 6);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Job title is required.';
    if (!description.trim() || description.trim().length < 30) e.description = 'Please provide a detailed job description (at least 30 characters).';
    if (skills.length === 0) e.skills = 'Add at least one required skill.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await createJob({
        title: title.trim(),
        description: description.trim(),
        required_skills: skills,
        min_experience_years: minExp,
      });
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to save job.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Job Description</h1>
        <p className="mt-1 text-sm text-slate-500">Define the role so the screener can score candidates against it.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Briefcase className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Role Details</h2>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            {errors.title && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                <AlertCircle className="h-3.5 w-3.5" />{errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Job Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={7}
              placeholder="Paste the full job description here…"
              className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            {errors.description && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                <AlertCircle className="h-3.5 w-3.5" />{errors.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Required Skills</label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                placeholder="Type a skill and press Enter"
                className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                onClick={() => addSkill(skillInput)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            {suggestions.length > 0 && skillInput && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => addSkill(s)}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            )}
            {skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1 text-sm font-medium text-white"
                  >
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-white/70 hover:text-white">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.skills && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                <AlertCircle className="h-3.5 w-3.5" />{errors.skills}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Minimum Experience (years)</label>
            <input
              type="number"
              min={0}
              max={30}
              value={minExp}
              onChange={(e) => setMinExp(Math.max(0, parseInt(e.target.value || '0', 10)))}
              className="mt-1.5 w-32 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save & Activate Job'}
          </button>
        </div>
      </div>
    </div>
  );
}
