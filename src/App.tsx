import { useState, useMemo, useEffect } from 'react';
import { Plus, FolderOpen, LayoutGrid, Search, Loader2 } from 'lucide-react';
import { Project, ProjectStatus, STATUS_CONFIG } from './types';
import ProjectCard from './components/ProjectCard';
import ProjectModal from './components/ProjectModal';

const API = '/api/projects';

async function apiFetch(method: string, body?: unknown, id?: string) {
  const url = id ? `${API}?id=${id}` : API;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

type Filter = 'all' | ProjectStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'paused', label: 'Paused' },
  { id: 'completed', label: 'Completed' },
  { id: 'idea', label: 'Ideas' },
];

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  useEffect(() => {
    apiFetch('GET')
      .then(setProjects)
      .catch(() => {
        // fallback to localStorage if API not available (local dev)
        const raw = localStorage.getItem('project-hub-v1');
        if (raw) setProjects(JSON.parse(raw));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = projects;
    if (filter !== 'all') list = list.filter(p => p.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.techStack.some(t => t.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [projects, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    for (const s of ['active', 'paused', 'completed', 'idea']) {
      c[s] = projects.filter(p => p.status === s).length;
    }
    return c;
  }, [projects]);

  const handleSave = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editProject) {
      const updated: Project = { ...editProject, ...data, updatedAt: new Date().toISOString() };
      await apiFetch('PUT', updated).catch(() => null);
      setProjects(prev => prev.map(p => p.id === editProject.id ? updated : p));
    } else {
      const newP: Project = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await apiFetch('POST', newP).catch(() => null);
      setProjects(prev => [newP, ...prev]);
    }
    setModalOpen(false);
    setEditProject(null);
  };

  const handleEdit = (p: Project) => { setEditProject(p); setModalOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await apiFetch('DELETE', undefined, id).catch(() => null);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const openNew = () => { setEditProject(null); setModalOpen(true); };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 sticky top-0 z-40 backdrop-blur-xl bg-[#050914]/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <LayoutGrid size={15} className="text-accent" />
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">Project Hub</span>
            <span className="hidden sm:block text-xs font-mono text-white/20 border border-white/10 rounded-full px-2 py-0.5">
              {projects.length} projects
            </span>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#00d4ff', color: '#050914' }}
          >
            <Plus size={15} />
            <span>New Project</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              className="field pl-9 py-2 text-sm"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/5 w-fit">
            {FILTERS.map(f => {
              const active = filter === f.id;
              const cfg = f.id !== 'all' ? STATUS_CONFIG[f.id as ProjectStatus] : null;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all"
                  style={active
                    ? cfg
                      ? { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }
                      : { background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }
                    : { color: 'rgba(255,255,255,0.35)', border: '1px solid transparent' }
                  }
                >
                  {f.label}
                  {counts[f.id] > 0 && <span className="text-[10px] opacity-60">{counts[f.id]}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <Loader2 size={24} className="text-accent animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/7 flex items-center justify-center">
              <FolderOpen size={24} className="text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-white/40 text-sm">No projects found</p>
              {filter === 'all' && !search && (
                <button onClick={openNew} className="text-accent text-sm mt-1 hover:underline">
                  Create your first project →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cards grid */}
        {!loading && (
          <div className="card-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p, i) => (
              <ProjectCard key={p.id} project={p} onEdit={handleEdit} onDelete={handleDelete} index={i} />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <ProjectModal
          project={editProject}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditProject(null); }}
        />
      )}
    </div>
  );
}
