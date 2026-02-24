import { useState } from 'react';
import { Github, AlertTriangle, Clock, ChevronDown, ChevronUp, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Project, STATUS_CONFIG, PROGRESS_GRADIENT } from '../types';

interface Props {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
  index: number;
}

export default function ProjectCard({ project, onEdit, onDelete, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[project.status];
  const gradient = PROGRESS_GRADIENT[project.status];

  const updatedAgo = (() => {
    const diff = Date.now() - new Date(project.updatedAt).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  })();

  return (
    <div
      className="glass-card p-5 flex flex-col gap-4 animate-fade-up opacity-0"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full"
              style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              ● {cfg.label}
            </span>
            <span className="text-xs text-white/30 font-mono flex items-center gap-1">
              <Clock size={10} /> {updatedAgo}
            </span>
          </div>
          <h3 className="font-display font-700 text-lg text-white leading-tight truncate">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-white/50 mt-0.5 leading-snug line-clamp-1">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              title="Open GitHub"
            >
              <Github size={14} />
            </a>
          )}
          <button
            onClick={() => onEdit(project)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-white/40 font-mono">Progress</span>
          <span className="text-xs font-mono font-medium" style={{ color: cfg.color }}>{project.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${project.progress}%`, background: gradient }}
          />
        </div>
      </div>

      {/* Tech stack */}
      {project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map(t => (
            <span
              key={t}
              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-white/50 border border-white/5"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors w-fit"
      >
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {expanded ? 'Less' : 'Details'}
      </button>

      {/* Expanded section */}
      {expanded && (
        <div className="flex flex-col gap-3 border-t border-white/5 pt-3">
          {/* Last session */}
          {project.lastSessionNotes && (
            <div>
              <div className="text-[11px] font-mono text-white/30 mb-1.5 uppercase tracking-wider">Last Session</div>
              <p className="text-sm text-white/60 leading-relaxed bg-white/3 rounded-lg p-3 border border-white/5">
                {project.lastSessionNotes}
              </p>
            </div>
          )}

          {/* Problems */}
          {project.problems.length > 0 && (
            <div>
              <div className="text-[11px] font-mono text-white/30 mb-1.5 uppercase tracking-wider">Blockers</div>
              <div className="flex flex-col gap-1.5">
                {project.problems.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm bg-red-500/5 border border-red-500/10 rounded-lg p-2.5">
                    <AlertTriangle size={13} className="text-red-400 shrink-0 mt-0.5" />
                    <span className="text-white/60 leading-snug">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GitHub link full */}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-mono text-white/30 hover:text-accent transition-colors w-fit"
            >
              <ExternalLink size={11} />
              {project.githubUrl.replace('https://', '')}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
