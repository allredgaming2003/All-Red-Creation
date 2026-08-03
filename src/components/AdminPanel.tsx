import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Video, 
  Sparkles, 
  X, 
  Check, 
  LogOut, 
  Eye, 
  FolderPlus, 
  Mail, 
  Image as ImageIcon,
  RotateCcw,
  Film
} from 'lucide-react';
import { saveProjectToFirestore, deleteProjectFromFirestore, fetchLeadsFromFirestore } from '../lib/firebase';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: 'reels' | 'youtube' | 'commercials';
  categoryLabel: string;
  views: string;
  coverImage: string;
  videoId: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onProjectsChange: (updatedProjects: Project[]) => void;
  onOpenLeadsDashboard?: () => void;
}

// Preset cover images for quick selection when uploading
const PRESET_IMAGES = [
  { label: 'Cinematic Car Shoot', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
  { label: 'High-Tech Studio', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Neon Cyberpunk Edit', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Aero Sports Action', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80' },
  { label: 'Documentary Nature', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Creator Podcast Set', url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80' },
];

export function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  // Match YouTube URLs: watch?v=, embed/, shorts/, youtu.be/
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  // Check if user pasted standard 11-character video ID
  if (trimmed.length === 11 && !trimmed.includes('/')) {
    return trimmed;
  }
  return trimmed;
}

export default function AdminPanel({ isOpen, onClose, projects, onProjectsChange }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'leads'>('upload');
  
  // New Project Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<'reels' | 'youtube' | 'commercials'>('reels');
  const [views, setViews] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [videoId, setVideoId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Leads state inside Admin Panel
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    // Check local auth state
    const auth = localStorage.getItem('arc_admin_authed');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }

    // Load leads from Firestore DB & fallback to local
    async function loadLeads() {
      const fsLeads = await fetchLeadsFromFirestore();
      if (fsLeads && fsLeads.length > 0) {
        setLeads(fsLeads);
      } else {
        const storedLeads = localStorage.getItem('arc_inquiries');
        if (storedLeads) {
          try {
            setLeads(JSON.parse(storedLeads));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
    loadLeads();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    if (cleanUser === 'all.red.gaming.2003@gmail.com' && password === '722009') {
      setIsAuthenticated(true);
      localStorage.setItem('arc_admin_authed', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid credentials! Admin login is restricted to owner email (all.red.gaming.2003@gmail.com) with password 722009.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('arc_admin_authed');
  };

  const getCategoryLabel = (cat: 'reels' | 'youtube' | 'commercials') => {
    switch (cat) {
      case 'reels': return 'REELS & SHORTS';
      case 'youtube': return 'YOUTUBE';
      case 'commercials': return 'COMMERCIALS';
      default: return 'PORTFOLIO';
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVideoId = extractYouTubeId(videoId);
    if (!cleanVideoId) {
      alert('Please enter or paste a YouTube Video Link or Video ID.');
      return;
    }

    const finalTitle = title.trim() || 'New YouTube Work';
    const finalSubtitle = subtitle.trim() || 'Video Edit & Post Production';
    const finalCategory = category || 'reels';
    const finalCoverImage = `https://img.youtube.com/vi/${cleanVideoId}/hqdefault.jpg`;
    const finalViews = views.trim() || '10K';

    let updatedList: Project[] = [];

    if (editingId) {
      // Edit existing project
      const updatedItem: Project = {
        id: editingId,
        title: finalTitle,
        subtitle: finalSubtitle,
        category: finalCategory,
        categoryLabel: getCategoryLabel(finalCategory),
        views: finalViews,
        coverImage: finalCoverImage,
        videoId: cleanVideoId
      };
      updatedList = projects.map(p => p.id === editingId ? updatedItem : p);
      await saveProjectToFirestore({
        id: editingId,
        title: finalTitle,
        category: finalCategory,
        videoUrl: `https://www.youtube.com/watch?v=${cleanVideoId}`,
        videoType: 'youtube',
        thumbnail: finalCoverImage,
        views: finalViews,
        likes: '98%',
        description: finalSubtitle
      });
      setSuccessMsg('Project video updated successfully!');
    } else {
      // Create new project
      const newId = Date.now().toString();
      const newProj: Project = {
        id: newId,
        title: finalTitle,
        subtitle: finalSubtitle,
        category: finalCategory,
        categoryLabel: getCategoryLabel(finalCategory),
        views: finalViews,
        coverImage: finalCoverImage,
        videoId: cleanVideoId
      };
      updatedList = [newProj, ...projects];
      await saveProjectToFirestore({
        id: newId,
        title: finalTitle,
        category: finalCategory,
        videoUrl: `https://www.youtube.com/watch?v=${cleanVideoId}`,
        videoType: 'youtube',
        thumbnail: finalCoverImage,
        views: finalViews,
        likes: '98%',
        description: finalSubtitle
      });
      setSuccessMsg('🎉 YouTube video added live to website portfolio!');
    }

    onProjectsChange(updatedList);
    resetForm();

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const startEditProject = (proj: Project) => {
    setEditingId(proj.id);
    setTitle(proj.title);
    setSubtitle(proj.subtitle);
    setCategory(proj.category);
    setViews(proj.views);
    setCoverImage(proj.coverImage);
    setVideoId(proj.videoId);
    setActiveTab('upload');
  };

  const deleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this video work from the portfolio?')) {
      const updated = projects.filter(p => p.id !== id);
      await deleteProjectFromFirestore(id);
      onProjectsChange(updated);
    }
  };

  const clearAllProjects = async () => {
    if (window.confirm('Delete ALL portfolio videos? You can add your real videos anytime.')) {
      for (const p of projects) {
        await deleteProjectFromFirestore(p.id);
      }
      onProjectsChange([]);
      localStorage.removeItem('arc_projects_data');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setCategory('reels');
    setViews('');
    setCoverImage('');
    setVideoId('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-bg-dark border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] my-auto">
        
        {/* Top Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-bg-card/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red font-bold">
              <ShieldCheck className="w-5 h-5 text-brand-red" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">ARC Administrator Portal</h3>
                <span className="text-[10px] font-mono font-bold bg-brand-red/20 text-brand-red border border-brand-red/30 px-2 py-0.5 rounded-full uppercase">
                  Content Management
                </span>
              </div>
              <p className="text-xs text-gray-400">Upload new creations, edit video works, and oversee incoming client leads</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Log out as Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* LOGIN FORM */
          <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-6 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red shadow-[0_0_30px_rgba(255,0,0,0.3)]">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-2">
              <h4 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight">Admin Authentication Required</h4>
              <p className="text-xs text-gray-400">
                Log in to upload new video works, edit portfolio showcases, or manage client strategy pipeline.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 text-left">
              <div>
                <label className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block mb-1.5">Admin Username / Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-bg-darker border border-white/10 focus:border-brand-red focus:outline-none text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-bg-darker border border-white/10 focus:border-brand-red focus:outline-none text-white text-sm"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(255,0,0,0.4)] cursor-pointer"
              >
                Log In as Owner Admin
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Admin Tabs */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/5 bg-bg-card/30">
              <button
                onClick={() => { resetForm(); setActiveTab('upload'); }}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'upload' && !editingId
                    ? 'border-brand-red text-brand-red'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <FolderPlus className="w-4 h-4" />
                <span>{editingId ? 'Edit Project Work' : '+ Upload New Work'}</span>
              </button>

              <button
                onClick={() => setActiveTab('manage')}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'manage'
                    ? 'border-brand-red text-brand-red'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Manage Portfolio ({projects.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('leads')}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'leads'
                    ? 'border-brand-red text-brand-red'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Client Inquiries ({leads.length})</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1">
              
              {/* TAB 1: UPLOAD / EDIT WORK FORM */}
              {activeTab === 'upload' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">
                        {editingId ? 'Edit Portfolio Project' : 'Upload & Publish New Creation Work'}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Add cinematic shoots, commercials, or short-form reels to instantly show on the website.
                      </p>
                    </div>
                    {editingId && (
                      <button
                        onClick={resetForm}
                        className="px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  {successMsg && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                      <Check className="w-4 h-4" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProject} className="space-y-5">
                    
                    {/* Primary Field: YouTube Link / ID */}
                    <div>
                      <label className="text-xs font-mono tracking-widest text-brand-red uppercase font-semibold block mb-1 flex items-center gap-1.5">
                        <Video className="w-4 h-4" />
                        <span>Paste YouTube Video Link or ID *</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={videoId}
                          onChange={(e) => setVideoId(e.target.value)}
                          placeholder="e.g. https://www.youtube.com/watch?v=9XqfA-4y8Sg or https://youtu.be/..."
                          required
                          className="w-full px-4 py-3.5 rounded-xl bg-bg-darker border-2 border-brand-red/40 focus:border-brand-red focus:outline-none text-white text-sm font-mono placeholder:text-gray-600 shadow-[0_0_15px_rgba(255,0,43,0.1)]"
                        />
                        <span className="absolute right-3.5 top-3.5 text-[10px] bg-brand-red/20 border border-brand-red/40 text-brand-red font-mono font-bold px-2 py-0.5 rounded-md">YouTube Link</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5">Simply paste any YouTube video link or Shorts URL. Thumbnail and video stream automatically!</p>
                    </div>

                    {/* Optional Fields: Title & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block mb-1">Project Title (Optional)</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Red Bull Nitro Series (Default: New YouTube Work)"
                          className="w-full px-4 py-2.5 rounded-xl bg-bg-darker border border-white/10 focus:border-brand-red focus:outline-none text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block mb-1">Category (Optional)</label>
                        <select
                          value={category}
                          onChange={(e: any) => setCategory(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-bg-darker border border-white/10 focus:border-brand-red focus:outline-none text-white text-sm"
                        >
                          <option value="reels" className="bg-bg-dark text-white">Reels & Shorts</option>
                          <option value="youtube" className="bg-bg-dark text-white">YouTube Episode</option>
                          <option value="commercials" className="bg-bg-dark text-white">Commercials & Brand Film</option>
                        </select>
                      </div>
                    </div>

                    {/* Auto Thumbnail Preview */}
                    {extractYouTubeId(videoId) && (
                      <div className="p-3.5 bg-bg-darker border border-brand-red/30 rounded-2xl flex items-center gap-4 animate-fadeIn">
                        <img 
                          src={`https://img.youtube.com/vi/${extractYouTubeId(videoId)}/hqdefault.jpg`} 
                          alt="Thumbnail Preview" 
                          className="w-28 h-16 object-cover rounded-xl border border-white/10 shadow" 
                        />
                        <div className="text-xs space-y-1">
                          <span className="text-brand-red font-mono text-[10px] uppercase font-bold tracking-wider block">✓ Auto Detected Thumbnail</span>
                          <span className="text-white font-bold block">{title || 'New YouTube Work'}</span>
                          <span className="text-gray-400 font-mono text-[10px] block">{getCategoryLabel(category)} • Ready to Add</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 py-4 bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(255,0,0,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{editingId ? 'Update Video' : 'Add Video to Website'}</span>
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* TAB 2: MANAGE EXISTING PORTFOLIO */}
              {activeTab === 'manage' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">Existing Work Showcases ({projects.length})</h4>
                      <p className="text-xs text-gray-400">Click edit or delete to customize live projects displayed on the homepage.</p>
                    </div>
                    <button
                      onClick={clearAllProjects}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All Videos</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((proj) => (
                      <div key={proj.id} className="p-4 bg-bg-darker border border-white/10 rounded-2xl flex gap-4 relative group hover:border-white/20 transition-all">
                        <img src={proj.coverImage} alt={proj.title} className="w-28 h-20 object-cover rounded-xl border border-white/10 flex-shrink-0" />
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono font-bold text-brand-red tracking-wider uppercase">
                                {proj.categoryLabel}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                👁️ {proj.views}
                              </span>
                            </div>
                            <h5 className="text-white font-bold text-sm truncate mt-0.5">{proj.title}</h5>
                            <p className="text-gray-400 text-xs line-clamp-1">{proj.subtitle}</p>
                          </div>

                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                            <button
                              onClick={() => startEditProject(proj)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3 text-brand-red" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => deleteProject(proj.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold border border-red-500/20 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CLIENT LEADS / INQUIRIES */}
              {activeTab === 'leads' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">Client Pipeline Inquiries ({leads.length})</h4>
                      <p className="text-xs text-gray-400">All direct strategy inquiries submitted by visitors via the website contact form.</p>
                    </div>
                  </div>

                  {leads.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 space-y-2">
                      <Mail className="w-8 h-8 mx-auto text-gray-600" />
                      <p className="text-sm">No client strategy submissions yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leads.map((lead, index) => (
                        <div key={index} className="p-4 bg-bg-darker border border-white/10 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-bold text-sm">{lead.name} ({lead.email})</span>
                            <span className="text-brand-red font-mono text-xs font-bold">{lead.budget || 'Not specified'}</span>
                          </div>
                          <p className="text-xs text-gray-400 italic">"{lead.message}"</p>
                          <div className="text-[10px] text-gray-500 font-mono">
                            Category: {lead.projectType || 'General'} • Submitted: {new Date(lead.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-bg-card/50 flex items-center justify-between text-xs text-gray-400">
          <span className="font-mono text-[10px]">ALL RED CREATION - ADMIN CONTENT ENGINE</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors cursor-pointer border border-white/10"
          >
            Close Portal
          </button>
        </div>

      </div>
    </div>
  );
}
