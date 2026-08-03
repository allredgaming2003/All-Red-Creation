import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Calendar, DollarSign, Briefcase, Sparkles, X, User, Download, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { fetchLeadsFromFirestore, deleteLeadFromFirestore } from '../lib/firebase';

interface Inquiry {
  id?: string;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
  timestamp: string;
}

export default function LeadsDashboard({ onClose }: { onClose: () => void }) {
  const [leads, setLeads] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const fsLeads = await fetchLeadsFromFirestore();
      if (fsLeads && fsLeads.length > 0) {
        const mapped: Inquiry[] = fsLeads.map(l => ({
          id: l.id,
          name: l.name,
          email: l.email,
          projectType: l.status || 'General',
          budget: l.budget,
          message: l.message,
          timestamp: l.createdAt
        }));
        // Sort newest first
        mapped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLeads(mapped);
        localStorage.setItem('arc_inquiries', JSON.stringify(mapped));
      } else {
        const stored = localStorage.getItem('arc_inquiries');
        if (stored) {
          try {
            setLeads(JSON.parse(stored));
          } catch (e) {
            console.error(e);
            setLeads([]);
          }
        } else {
          setLeads([]);
        }
      }
    } catch (err) {
      console.error('Error loading leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();

    // Listen for custom submit event when visitors fill contact form
    window.addEventListener('arcInquirySubmitted', loadLeads);
    return () => window.removeEventListener('arcInquirySubmitted', loadLeads);
  }, []);

  const clearLead = async (index: number) => {
    const leadToDelete = leads[index];
    if (leadToDelete && leadToDelete.id) {
      await deleteLeadFromFirestore(leadToDelete.id);
    }
    const updated = [...leads];
    updated.splice(index, 1);
    setLeads(updated);
    localStorage.setItem('arc_inquiries', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('arcInquirySubmitted'));
  };

  const clearAllLeads = () => {
    if (window.confirm('Are you sure you want to clear all leads?')) {
      setLeads([]);
      localStorage.removeItem('arc_inquiries');
      window.dispatchEvent(new CustomEvent('arcInquirySubmitted'));
    }
  };

  // Excel / CSV Export Generator
  const exportToExcel = () => {
    if (leads.length === 0) return;

    const headers = ['Client Name', 'Email Address', 'Project Type', 'Budget Range', 'Client Message', 'Submission Date'];
    
    const rows = leads.map(lead => [
      `"${(lead.name || '').replace(/"/g, '""')}"`,
      `"${(lead.email || '').replace(/"/g, '""')}"`,
      `"${(getCategoryLabel(lead.projectType) || '').replace(/"/g, '""')}"`,
      `"${(getBudgetLabel(lead.budget) || '').replace(/"/g, '""')}"`,
      `"${(lead.message || '').replace(/"/g, '""')}"`,
      `"${new Date(lead.timestamp).toLocaleString().replace(/"/g, '""')}"`
    ]);

    // UTF-8 BOM prefix (\uFEFF) ensures Excel opens special characters correctly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `ALL_RED_Client_Leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <h3 className="font-display font-extrabold text-xl text-white uppercase tracking-tight flex items-center gap-2">
                <span>ARC Client Leads Portal</span>
              </h3>
              <p className="text-xs text-gray-400">Actual client inquiries & quote submissions logged directly from your website</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {leads.length > 0 && (
              <button
                onClick={exportToExcel}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-900/30"
                title="Download leads as Excel Spreadsheet (.csv)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            )}

            <button
              onClick={loadLeads}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer border border-white/10"
              title="Refresh Leads"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {leads.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800/50 border border-white/5 mx-auto flex items-center justify-center text-gray-500">
                <Mail className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-medium text-base">No Actual Client Leads Yet</h4>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  When real prospective clients submit the quote request form on your website, their actual inquiries will appear here automatically with options to export to Excel.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                    {leads.length} Actual Client {leads.length === 1 ? 'Lead' : 'Leads'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={exportToExcel}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Excel Sheet</span>
                  </button>
                  
                  <span className="text-gray-600">|</span>

                  <button
                    onClick={clearAllLeads}
                    className="text-xs text-brand-red hover:text-brand-red-light transition-colors font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {leads.map((lead, index) => (
                  <div key={index} className="glass-card p-6 rounded-2xl border border-white/10 hover:border-brand-red/30 transition-all space-y-4 relative group bg-bg-card/70">
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
                        <a href={`mailto:${lead.email}`} className="text-xs text-gray-300 hover:text-brand-red transition-colors block font-mono pl-6">
                          {lead.email}
                        </a>
                        <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-mono uppercase tracking-wider pl-6 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(lead.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Project Meta */}
                      <div className="flex flex-col gap-1 md:border-l md:border-white/5 md:pl-6 justify-center">
                        <div className="flex items-center gap-1.5 text-xs text-gray-200">
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
                        <p className="text-xs text-gray-300 italic leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5 w-full">
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
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-mono text-[10px] text-gray-400">LIVE FIRESTORE CLIENT PIPELINE</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors cursor-pointer border border-white/10"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
}
