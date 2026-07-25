import React, { useState, useEffect } from 'react';
import { Mail, Check, Trash2, Calendar, DollarSign, Briefcase, Sparkles, X, User } from 'lucide-react';
import { fetchLeadsFromFirestore } from '../lib/firebase';

interface Inquiry {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
  timestamp: string;
}

export default function LeadsDashboard({ onClose }: { onClose: () => void }) {
  const [leads, setLeads] = useState<Inquiry[]>([]);

  useEffect(() => {
    // Load leads from Firestore DB with localStorage fallback
    const loadLeads = async () => {
      const fsLeads = await fetchLeadsFromFirestore();
      if (fsLeads && fsLeads.length > 0) {
        const mapped: Inquiry[] = fsLeads.map(l => ({
          name: l.name,
          email: l.email,
          projectType: l.status || 'General',
          budget: l.budget,
          message: l.message,
          timestamp: l.createdAt
        }));
        setLeads(mapped);
      } else {
        const stored = localStorage.getItem('arc_inquiries');
        if (stored) {
          try {
            setLeads(JSON.parse(stored));
          } catch (e) {
            console.error(e);
          }
        }
      }
    };
    loadLeads();

    // Listen for custom submit event
    window.addEventListener('arcInquirySubmitted', loadLeads);
    return () => window.removeEventListener('arcInquirySubmitted', loadLeads);
  }, []);

  const clearLead = (index: number) => {
    const updated = [...leads];
    updated.splice(index, 1);
    setLeads(updated);
    localStorage.setItem('arc_inquiries', JSON.stringify(updated));
  };

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'cinematic-shoot': return 'Cinematic Shooting';
      case 'high-end-editing': return 'High-End Editing';
      case 'social-growth': return 'Social Media Shorts';
      case 'full-production': return 'Full Commercial';
      default: return type || 'General Consultation';
    }
  };

  const getBudgetLabel = (budget: string) => {
    switch (budget) {
      case 'under-2k': return 'Under $2k';
      case '2k-5k': return '$2k - $5k';
      case '5k-10k': return '$5k - $10k';
      case 'over-10k': return '$10k+ (Enterprise)';
      default: return budget || 'Not Specified';
    }
  };

  const addSampleLeads = () => {
    const samples: Inquiry[] = [
      {
        name: 'Alexander Sterling',
        email: 'alex@sterlingwatches.co',
        projectType: 'full-production',
        budget: 'over-10k',
        message: 'Looking for a cinematic luxury commercial shoot for our new ocean chronograph series. Needs dynamic lighting, RED camera work, and high-end sound design.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        name: 'Sophia Thorne',
        email: 'sophia@vanguardgrowth.io',
        projectType: 'social-growth',
        budget: '2k-5k',
        message: 'We want to film a series of 15 high-converting vertical shorts for our founder profile on LinkedIn & TikTok. Script guidance would be ideal.',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString()
      },
      {
        name: 'David Vance',
        email: 'vance@nextgenfinance.com',
        projectType: 'high-end-editing',
        budget: '5k-10k',
        message: 'Need full video editing package for a 10-episode YouTube masterclass series. Clean pacing, sound effects, and professional branding elements required.',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ];
    setLeads(samples);
    localStorage.setItem('arc_inquiries', JSON.stringify(samples));
  };

  return (
    <div className="fixed inset-0 z-55 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-bg-dark border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-bg-card/50">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red font-bold text-lg">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h3 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">ARC Leads CRM Portal</h3>
              <p className="text-xs text-gray-400">Review client pipeline, budget estimates, and production briefs in real-time</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {leads.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800/50 border border-white/5 mx-auto flex items-center justify-center text-gray-500">
                <Mail className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-medium">No strategy inquiries yet</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  When visitors submit the lead form on your homepage, their inquiries will safely log and appear here instantly.
                </p>
              </div>
              <button
                onClick={addSampleLeads}
                className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer border border-white/5"
              >
                Load Dummy Client Leads
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{leads.length} Total Pipeline Leads</span>
                <button
                  onClick={() => {
                    setLeads([]);
                    localStorage.removeItem('arc_inquiries');
                  }}
                  className="text-xs text-brand-red hover:text-brand-red-light transition-colors font-semibold"
                >
                  Clear All Pipeline
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {leads.map((lead, index) => (
                  <div key={index} className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 relative group">
                    <button
                      onClick={() => clearLead(index)}
                      className="absolute top-6 right-6 text-gray-500 hover:text-brand-red p-1.5 rounded-lg hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Remove lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Personal metadata */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-brand-red" />
                          <h4 className="text-white font-bold text-sm uppercase">{lead.name}</h4>
                        </div>
                        <a href={`mailto:${lead.email}`} className="text-xs text-gray-400 hover:text-brand-red transition-colors block font-mono pl-6">
                          {lead.email}
                        </a>
                        <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-mono uppercase tracking-wider pl-6 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(lead.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Project Meta */}
                      <div className="flex flex-col gap-1 md:border-l md:border-white/5 md:pl-6 justify-center">
                        <div className="flex items-center gap-1.5 text-xs text-gray-300">
                          <Briefcase className="w-3.5 h-3.5 text-brand-red" />
                          <span className="font-semibold">{getCategoryLabel(lead.projectType)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-brand-red font-semibold font-mono">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{getBudgetLabel(lead.budget)}</span>
                        </div>
                      </div>

                      {/* Brief */}
                      <div className="md:border-l md:border-white/5 md:pl-6 flex items-center">
                        <p className="text-xs text-gray-400 italic line-clamp-3 leading-relaxed">
                          "{lead.message}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between bg-bg-card/30 text-xs text-gray-400">
          <span className="font-mono text-[10px] text-gray-500">SECURE LOCAL PIPELINE AGENT</span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors cursor-pointer border border-white/10"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
