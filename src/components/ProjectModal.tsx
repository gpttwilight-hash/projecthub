import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Project, ProjectStatus, STATUS_CONFIG } from '../types';

interface Props {
  project: Project | null;
  onSave: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const EMPTY: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  status: 'active',
  progress: 0,
  techStack: [],
  githubUrl: '',
  lastSessionNotes: '',
  problems: [],
};

export default function ProjectModal({ project, onSave, onClose }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [techInput, setTechInput] = useState('');
  const [problemInput, setProblemInput] = useState('');

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        description: project.description,
        status: project.status,
        progress: project.progress,
        techStack: project.techStack,
        githubUrl: project.githubUrl,
        lastSessionNotes: project.lastSessionNotes,
        problems: project.problems,
      });
      setTechInput(project.techStack.join(', '));
    } else {
      setForm(EMPTY);
      setTechInput('');
      setProblemInput('');
    }
  }, [project]);

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const addProblem = () => {
    if (!problemInput.trim()) return;
    set('problems', [...form.problems, problemInput.trim()]);
    setProblemInput('');
  };

  const removeProblem = (i: number) =>
    set('problems', form.problems.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const techStack = techInput.split(',').map(t => t.trim()).filter(Boolean);
    onSave({ ...form, techStack });
  };

  const cfg = STATUS_CONFIG[form.status];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0c1220] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0c1220] border-b border-white/5">
          <h2 className="font-display text-lg font-bold text-white">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2 block">
              Project Name *
            </label>
            <input
              className="field"
              placeholder="e.g. NutriBot"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2 block">
              Description
            </label>
            <input
              className="field"
              placeholder="One-line summary of the project"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2 block">
              Status
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(STATUS_CONFIG) as ProjectStatus[]).map(s => {
                const c = STATUS_CONFIG[s];
                const active = form.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => set('status', s)}
                    className="py-2 px-1 rounded-xl text-xs font-mono font-medium transition-all text-center"
                    style={active
                      ? { background: c.bg, border: `1px solid ${c.border}`, color: c.color }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }
                    }
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-mono text-white/40 uppercase tracking-wider">
                Progress
              </label>
              <span className="text-xs font-mono font-medium" style={{ color: cfg.color }}>
                {form.progress}%
              </span>
            </div>
            <input
              type="range"
              min={0} max={100} step={5}
              value={form.progress}
              onChange={e => set('progress', +e.target.value)}
            />
            <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${form.progress}%`,
                  background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`,
                }}
              />
            </div>
          </div>

          {/* GitHub */}
          <div>
            <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2 block">
              GitHub URL
            </label>
            <input
              className="field font-mono text-xs"
              placeholder="https://github.com/username/repo"
              value={form.githubUrl}
              onChange={e => set('githubUrl', e.target.value)}
            />
          </div>

          {/* Tech stack */}
          <div>
            <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2 block">
              Tech Stack (comma-separated)
            </label>
            <input
              className="field"
              placeholder="React, TypeScript, FastAPI, PostgreSQL"
              value={techInput}
              onChange={e => setTechInput(e.target.value)}
            />
            {techInput && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {techInput.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                  <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-white/50 border border-white/5">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Last session notes */}
          <div>
            <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2 block">
              Last Session Notes
            </label>
            <textarea
              className="field resize-none"
              rows={3}
              placeholder="Where did you stop? What was the last thing you worked on?"
              value={form.lastSessionNotes}
              onChange={e => set('lastSessionNotes', e.target.value)}
            />
          </div>

          {/* Problems */}
          <div>
            <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2 block">
              Blockers / Problems
            </label>
            <div className="flex gap-2 mb-2">
              <input
                className="field flex-1"
                placeholder="Describe a problem or blocker"
                value={problemInput}
                onChange={e => setProblemInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addProblem()}
              />
              <button
                onClick={addProblem}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0"
              >
                <Plus size={15} />
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {form.problems.map((p, i) => (
                <div key={i} className="flex items-center gap-2 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                  <span className="text-sm text-white/60 flex-1">{p}</span>
                  <button onClick={() => removeProblem(i)} className="text-red-400/50 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim()}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-[#050914] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: !form.name.trim() ? 'rgba(0,212,255,0.4)' : '#00d4ff' }}
            >
              {project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
