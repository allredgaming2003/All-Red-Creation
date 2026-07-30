import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ArrowRight, 
  Eye, 
  Check, 
  Mail, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Menu, 
  X, 
  Video, 
  Sliders, 
  Wand2, 
  TrendingUp, 
  Award, 
  Users, 
  CheckCircle, 
  Database,
  ArrowUpRight,
  ShieldCheck,
  PlusCircle,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LeadsDashboard from './components/LeadsDashboard';
import AdminPanel, { Project, extractYouTubeId } from './components/AdminPanel';
import GoogleAuthModal, { UserSession } from './components/GoogleAuthModal';
import AccountSettingsModal from './components/AccountSettingsModal';
import { 
  saveLeadToFirestore, 
  fetchProjectsFromFirestore, 
  fetchLeadsFromFirestore, 
  saveProjectToFirestore,
  saveUserToFirestore,
  auth,
  getRedirectResult
} from './lib/firebase';

// Default Portfolio Projects (Starts empty so owner can add real YouTube videos via Admin Panel)
const DEFAULT_PROJECTS: Project[] = [];

// Custom Type for Testimonials
interface Testimonial {
  name: string;
  role: string;
  stars: number;
  quote: string;
  image: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'all' | 'reels' | 'youtube' | 'commercials'>('all');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Admin & Content Management State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('arc_projects_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_PROJECTS;
  });
  
  // CRM & Leads State
  const [isLeadsOpen, setIsLeadsOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [leadsCount, setLeadsCount] = useState(0);

  // User Authentication State (Google Sign-In)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('all_red_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    return !localStorage.getItem('all_red_user_session');
  });
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState<boolean>(false);

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    localStorage.setItem('all_red_user_session', JSON.stringify(user));
    setIsAuthModalOpen(false);
  };

  // Listen for Google Auth Redirect result on page load
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          const u = result.user;
          const userSession: UserSession = {
            name: u.displayName || u.email?.split('@')[0] || 'Google User',
            email: u.email || '',
            avatarUrl: u.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.email || 'user')}&backgroundColor=dc2626&textColor=ffffff`,
            provider: 'google',
            loggedInAt: new Date().toISOString()
          };
          saveUserToFirestore({
            name: userSession.name,
            email: userSession.email,
            avatarUrl: userSession.avatarUrl,
            provider: 'google'
          }).catch((err) => console.warn('Firestore sync notice:', err));

          handleLoginSuccess(userSession);
        }
      })
      .catch((err) => {
        console.warn('Redirect login result notice:', err);
      });
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('all_red_user_session');
    setIsAuthModalOpen(true);
  };

  const handleProjectsChange = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('arc_projects_data', JSON.stringify(updatedProjects));
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    message: ''
  });

  // Load active leads count initially and on update
  const updateLeadsCount = async () => {
    try {
      const fsLeads = await fetchLeadsFromFirestore();
      if (fsLeads && fsLeads.length > 0) {
        setLeadsCount(fsLeads.length);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const stored = localStorage.getItem('arc_inquiries');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLeadsCount(parsed.length);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    updateLeadsCount();
    window.addEventListener('arcInquirySubmitted', updateLeadsCount);

    // Initial load of portfolio projects from Firestore DB
    async function loadFirestoreProjects() {
      const fsProjects = await fetchProjectsFromFirestore();
      if (fsProjects && fsProjects.length > 0) {
        const mapped: Project[] = fsProjects.map(p => {
          const cleanId = extractYouTubeId(p.videoUrl);
          return {
            id: p.id,
            title: p.title,
            subtitle: p.description || '',
            category: (p.category as any) || 'reels',
            categoryLabel: p.category ? p.category.toUpperCase() : 'PORTFOLIO',
            views: p.views || '10K',
            coverImage: p.thumbnail || `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`,
            videoId: cleanId
          };
        });
        setProjects(mapped);
      }
    }
    loadFirestoreProjects();
    
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavbarScrolled(true);
      } else {
        setNavbarScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('arcInquirySubmitted', updateLeadsCount);
    };
  }, []);

  // Static Testimonials Data

  const testimonials: Testimonial[] = [
    {
      name: 'MARCUS THORNE',
      role: 'Founder, Thorne Capital',
      stars: 5,
      quote: "All Red Creation completely revolutionised our organic social marketing. Their hyper-dynamic edit style immediately boosted our Instagram Reels' retention by 42%. We closed three high-ticket consulting clients in the first month from a single viral short!",
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
    },
    {
      name: 'ELENA ROSTOVA',
      role: 'Marketing Director, Velo Lux',
      stars: 5,
      quote: "Working with ARC was seamless. They understood our premium brand values perfectly. The cinematic color grading and sound design they delivered on our commercial product film felt like a Hollywood production. Absolutely recommended!",
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
    },
    {
      name: 'SAMUEL KEMP',
      role: 'Lead Creator, TechWave HQ',
      stars: 5,
      quote: "The scripting dynamic they integrated into our YouTube strategy was a complete game-changer. Our subscribers grew from 25k to over 100k in less than 4 months, and the production quality has set a whole new benchmark in our niche.",
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80'
    }
  ];

  const filteredProjects = activeTab === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeTab);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.projectType || !formData.budget || !formData.message) return;

    // Save lead to Firestore DB
    await saveLeadToFirestore({
      name: formData.name,
      email: formData.email,
      phone: '',
      budget: formData.budget,
      message: formData.message,
      status: 'New',
      createdAt: new Date().toISOString()
    });

    // Save lead locally as fallback
    const stored = localStorage.getItem('arc_inquiries') || '[]';
    try {
      const parsed = JSON.parse(stored);
      parsed.push({
        ...formData,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('arc_inquiries', JSON.stringify(parsed));
      
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('arcInquirySubmitted'));
    } catch (err) {
      console.error(err);
    }

    setFormSubmitted(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      projectType: '',
      budget: '',
      message: ''
    });
    setFormSubmitted(false);
  };

  const handleWhatsAppRedirect = () => {
    const text = `Hello All Red Creation! I am ${formData.name || 'a visitor'}. I would like to discuss a ${formData.projectType || 'cinematic video'} project with an estimated budget of ${formData.budget || 'not specified'}.`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/447700900077?text=${encoded}`, '_blank');
  };

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-bg-darker text-gray-100 font-sans selection:bg-brand-red selection:text-white relative">
      
      {/* Background Ambience Overlays */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-[0.015] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="fixed top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-red/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse-slow"></div>
      <div className="fixed bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-brand-red/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

      {/* HEADER NAVBAR */}
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${navbarScrolled ? 'glass py-3.5 shadow-lg border-b border-white/5' : 'py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-3.5 group">
            <div className="w-8 h-8 bg-brand-red rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.5)] group-hover:scale-105 transition-all duration-300">
              <div className="-rotate-45 font-display font-black text-xs text-white">AR</div>
            </div>
            <div className="font-display font-extrabold tracking-tighter text-xl text-white uppercase">
              ALL <span className="text-brand-red">RED</span> CREATION
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest">
            <a href="#portfolio" className="text-white/50 hover:text-white transition-colors">PORTFOLIO</a>
            <a href="#services" className="text-white/50 hover:text-white transition-colors">SERVICES</a>
            <a href="#testimonials" className="text-white/50 hover:text-white transition-colors">TESTIMONIALS</a>
            <a href="#contact" className="text-white/50 hover:text-white transition-colors">GET IN TOUCH</a>
          </nav>

          {/* Desktop CTA & Auth Status */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <button
                onClick={() => setIsAccountSettingsOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-200 transition-all cursor-pointer group"
                title="Account Settings"
              >
                <div className="w-5 h-5 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-[10px] overflow-hidden flex-shrink-0">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <span className="font-mono text-[11px] text-gray-300 max-w-[130px] truncate">{currentUser.email}</span>
                <Settings className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-red transition-colors ml-0.5" />
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-brand-red" />
                <span>Sign In</span>
              </button>
            )}

            <a 
              href="#contact" 
              className="px-6 py-2.5 bg-brand-red text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(255,0,0,0.4)] hover:bg-brand-red-dark transition-all duration-300 transform hover:-translate-y-0.5"
            >
              BOOK A CALL
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-white p-2 focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-45 bg-black/60 backdrop-blur-sm md:hidden"
              />
              {/* Drawer */}
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-72 bg-bg-dark border-l border-white/5 z-50 p-6 flex flex-col gap-6 shadow-2xl md:hidden"
              >
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="font-display font-bold text-sm tracking-widest text-brand-red">MENU</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsAccountSettingsOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                      title="Account & Settings"
                    >
                      <Settings className="w-4 h-4 text-brand-red" />
                      <span className="text-[10px] font-mono uppercase text-gray-300">Settings</span>
                    </button>

                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Account Card snippet inside drawer */}
                {currentUser && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-brand-red/40 shadow-sm">
                        {currentUser.avatarUrl ? (
                          <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                        ) : (
                          currentUser.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono truncate">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <nav className="flex flex-col gap-5 font-display font-bold text-lg">
                  <a href="#portfolio" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-brand-red transition-colors">Portfolio</a>
                  <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-brand-red transition-colors">Services</a>
                  <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-brand-red transition-colors">Testimonials</a>
                  <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-brand-red transition-colors">Contact</a>
                </nav>

                <div className="mt-auto">
                  <a 
                    href="#contact" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-4 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white font-bold text-center block shadow-[0_0_15px_rgba(255,0,43,0.3)] text-xs uppercase tracking-widest"
                  >
                    BOOK A CALL
                  </a>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden">
        {/* Cinematic Backdrop Image Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-bg-darker via-transparent to-bg-darker z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-bg-darker via-transparent to-bg-darker z-10"></div>
          <div className="absolute inset-0 opacity-20 filter grayscale contrast-125 scale-105 pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80" 
              alt="Cinematic Background" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-brand-red/20 bg-brand-red/5 rounded-full text-[10px] font-mono font-semibold text-brand-red uppercase tracking-[0.2em] mb-6 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red"></span>
            <span>HIGH-TICKET VIDEO PRODUCTION AGENCY</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-white uppercase leading-[1.15] mb-6">
            WE DON'T JUST <span className="text-gray-300">SHOOT & EDIT.</span> <br />
            WE CREATE <span className="text-brand-red font-extrabold border-b-2 border-brand-red/40 pb-0.5">MASTERPIECES.</span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-lg mx-auto text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed mb-10 font-sans">
            Helping premium brands and creators dominate the market through cinematic storytelling and high-conversion video systems.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <a 
              href="#portfolio" 
              className="w-full sm:w-auto px-8 py-4 bg-brand-red text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(255,0,0,0.4)] hover:bg-brand-red-dark transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1 group"
            >
              <span>VIEW PORTFOLIO</span>
              <Play className="w-3 h-3 fill-white text-white group-hover:scale-110 transition-transform ml-0.5" />
            </a>
            <a 
              href="#contact" 
              className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1 group"
            >
              <span>LET'S WORK TOGETHER</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-gray-500 animate-bounce">
          <a href="#portfolio" aria-label="Scroll down">
            <ChevronDown className="w-6 h-6" />
          </a>
        </div>
      </section>

      {/* SOCIAL PROOF / STATS */}
      <section className="py-16 bg-bg-dark border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            
            <div className="flex flex-col items-center">
              <div className="font-display font-extrabold text-5xl sm:text-6xl text-brand-red mb-3 text-glow">50+</div>
              <div className="text-xs font-mono tracking-widest text-gray-400 uppercase">Projects Delivered Worldwide</div>
            </div>

            <div className="flex flex-col items-center border-y md:border-y-0 md:border-x border-white/5 py-8 md:py-0">
              <div className="font-display font-extrabold text-5xl sm:text-6xl text-white mb-3">10M+</div>
              <div className="text-xs font-mono tracking-widest text-gray-400 uppercase">Combined Social Media Views</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="font-display font-extrabold text-5xl sm:text-6xl text-brand-red mb-3 text-glow">99%</div>
              <div className="text-xs font-mono tracking-widest text-gray-400 uppercase">Client Retention Rate</div>
            </div>

          </div>
        </div>
      </section>

      {/* PORTFOLIO SHOWCASE */}
      <section id="portfolio" className="py-24 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-xs font-mono tracking-[0.2em] text-brand-red uppercase font-semibold">OUR SHOWREEL</span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-white mt-2 leading-snug">
                THE WORKS THAT <br />COMMAND ATTENTION
              </h2>
            </div>
            <p className="max-w-md text-gray-400 font-light text-base leading-relaxed">
              Our portfolio spans premium promotional films, high-engagement YouTube content, cinematic commercials, and viral vertical shorts.
            </p>
          </div>

          {/* Portfolio Category Tabs */}
          <div className="flex flex-wrap items-center gap-3 mb-12 border-b border-white/5 pb-6">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all cursor-pointer ${activeTab === 'all' ? 'bg-brand-red text-white' : 'text-gray-400 hover:text-white'}`}
            >
              ALL PROJECTS
            </button>
            <button 
              onClick={() => setActiveTab('reels')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all cursor-pointer ${activeTab === 'reels' ? 'bg-brand-red text-white' : 'text-gray-400 hover:text-white'}`}
            >
              REELS & SHORTS
            </button>
            <button 
              onClick={() => setActiveTab('youtube')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all cursor-pointer ${activeTab === 'youtube' ? 'bg-brand-red text-white' : 'text-gray-400 hover:text-white'}`}
            >
              YOUTUBE PRODUCTION
            </button>
            <button 
              onClick={() => setActiveTab('commercials')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all cursor-pointer ${activeTab === 'commercials' ? 'bg-brand-red text-white' : 'text-gray-400 hover:text-white'}`}
            >
              COMMERCIALS
            </button>
          </div>

          {/* Portfolio Grid / Empty State */}
          {filteredProjects.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 md:p-14 text-center max-w-xl mx-auto space-y-5 border border-white/10 my-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red mx-auto shadow-[0_0_20px_rgba(255,0,0,0.2)]">
                <Video className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white uppercase tracking-tight">No Real Showcase Videos Added Yet</h3>
                <p className="text-xs text-gray-400 font-sans leading-relaxed max-w-md mx-auto">
                  Sample demo projects have been removed. You can now add your real YouTube video links from your Admin Panel. Videos stream via YouTube with zero storage cost!
                </p>
              </div>
              <button
                onClick={() => setIsAdminOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(255,0,0,0.3)] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Open Admin Dashboard to Add Videos</span>
              </button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setSelectedVideo(project.videoId)}
                    className="group relative overflow-hidden rounded-2xl glass-card aspect-video cursor-pointer"
                  >
                    <img 
                      src={project.coverImage} 
                      alt={project.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
                    
                    {/* Hover Glow Accent */}
                    <div className="absolute inset-0 bg-brand-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center shadow-[0_0_20px_rgba(255,0,43,0.6)] transform scale-90 group-hover:scale-100 transition-transform duration-300 border border-white/10">
                        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                      </span>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase bg-brand-red/10 px-2.5 py-1 rounded-full border border-brand-red/20">{project.categoryLabel}</span>
                        <span className="text-xs font-mono text-gray-300 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-brand-red" />{project.views} Views</span>
                      </div>
                      <h3 className="font-display font-extrabold text-xl text-white uppercase">{project.title}</h3>
                      <p className="text-xs text-gray-400 font-light mt-1">{project.subtitle}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* SERVICES OFFERED */}
      <section id="services" className="py-24 bg-bg-dark border-y border-white/5 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          {/* Section Header */}
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono tracking-widest text-brand-red uppercase font-semibold">OUR CAPABILITIES</span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl uppercase tracking-tighter text-white mt-2">
              ENGINEERED TO GROW <br />YOUR REVENUE & BRAND
            </h2>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Service 1 */}
            <div className="glass-card p-8 md:p-10 rounded-3xl flex flex-col gap-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-red/10 border border-brand-red/25 flex items-center justify-center text-brand-red shadow-[0_0_15px_rgba(255,0,43,0.1)]">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight mb-3">Cinematic Shooting</h3>
                <p className="text-gray-400 font-light leading-relaxed">
                  We shoot high-end commercials, course contents, corporate spotlights, and high-production-value creators on 4K/6K cinema rigs. Our visual aesthetic sets you apart from amateur creators instantly.
                </p>
              </div>
              <ul className="mt-auto space-y-2.5 text-sm font-medium text-gray-300">
                <li className="flex items-center"><Check className="text-brand-red w-4 h-4 mr-3" /> RED / Arri Cinema Standard</li>
                <li className="flex items-center"><Check className="text-brand-red w-4 h-4 mr-3" /> Direction & On-Set Production</li>
                <li className="flex items-center"><Check className="text-brand-red w-4 h-4 mr-3" /> Multi-Camera Dynamic Setups</li>
              </ul>
            </div>

            {/* Service 2 */}
            <div className="glass-card p-8 md:p-10 rounded-3xl flex flex-col gap-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-red/10 border border-brand-red/25 flex items-center justify-center text-brand-red shadow-[0_0_15px_rgba(255,0,43,0.1)]">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight mb-3">High-End Video Editing</h3>
                <p className="text-gray-400 font-light leading-relaxed">
                  Fast, high-retention pacing, narrative pacing optimization, custom SFX overlays, and hyper-engaging animated motion text designed to hold viewer attention for maximum watch time.
                </p>
              </div>
              <ul className="mt-auto space-y-2.5 text-sm font-medium text-gray-300">
                <li className="flex items-center"><Check className="text-brand-red w-4 h-4 mr-3" /> Engagement-Driven Editing Pacing</li>
                <li className="flex items-center"><Check className="text-brand-red w-4 h-4 mr-3" /> Custom Soundscape Construction</li>
                <li className="flex items-center"><Check className="text-brand-red w-4 h-4 mr-3" /> Kinetic Typography & GFX</li>
              </ul>
            </div>

            {/* Service 3 */}
            <div className="glass-card p-8 md:p-10 rounded-3xl flex flex-col gap-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-red/10 border border-brand-red/25 flex items-center justify-center text-brand-red shadow-[0_0_15px_rgba(255,0,43,0.1)]">
                <Wand2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight mb-3">Color Grading & Sound Design</h3>
                <p className="text-gray-400 font-light leading-relaxed">
                  We craft professional audio palettes and apply bespoke cinematic color LUTs that give your videos a distinct, memorable atmospheric feel. This is what transforms footage into a premium brand masterwork.
                </p>
              </div>
              <ul className="mt-auto space-y-2.5 text-sm font-medium text-gray-300">
                <li className="flex items-center"><Check className="text-brand-red w-4 h-4 mr-3" /> Custom Color Correction & Grading</li>
                <li className="flex items-center"><Check className="text-brand-red w-4 h-4 mr-3" /> Audio Polishing & Noise Suppression</li>
                <li className="flex items-center"><Check className="text-brand-red w-4 h-4 mr-3" /> 3D Cinematic Audio Spatialization</li>
              </ul>
            </div>

            {/* Service 4 */}
            <div className="glass-card p-8 md:p-10 rounded-3xl flex flex-col gap-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-red/10 border border-brand-red/25 flex items-center justify-center text-brand-red shadow-[0_0_15px_rgba(255,0,43,0.1)]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight mb-3">Social Growth Strategy</h3>
                <p className="text-gray-400 font-light leading-relaxed">
                  We construct custom scripts, hooks, viral concept brainstorms, thumbnail designs, and optimized platform-by-platform distributions to make sure your video content actually achieves business KPIs.
                </p>
              </div>
              <ul className="mt-auto space-y-2.5 text-sm font-medium text-gray-300">
                <li className="flex items-center"><Check className="text-brand-red w-4 h-4 mr-3" /> Viral Hook Scriptwriting Systems</li>
                <li className="flex items-center"><Check className="text-brand-red w-4 h-4 mr-3" /> YouTube & Reels Optimization</li>
                <li className="flex items-center"><Check className="text-brand-red w-4 h-4 mr-3" /> Conversion-Focused Funnel Building</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS SLIDER */}
      <section id="testimonials" className="py-24 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono tracking-widest text-brand-red uppercase font-semibold">TESTIMONIALS</span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl uppercase tracking-tighter text-white mt-2">
              WHAT OUR CLIENTS SAY
            </h2>
            <p className="text-gray-400 font-light mt-4">
              Read success stories from premium brands and scaling content creators who trusted All Red Creation to scale their visual presence.
            </p>
          </div>

          {/* Testimonial Box */}
          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div 
                key={testimonialIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-10 md:p-12 rounded-3xl relative"
              >
                <div className="absolute top-8 left-8 text-brand-red text-7xl font-serif opacity-10 pointer-events-none">“</div>
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 mb-6 text-brand-red">
                    {[...Array(testimonials[testimonialIndex].stars)].map((_, i) => (
                      <span key={i} className="text-base">★</span>
                    ))}
                  </div>
                  <p className="text-gray-300 text-lg md:text-xl font-light italic leading-relaxed mb-8">
                    "{testimonials[testimonialIndex].quote}"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-brand-red/30">
                      <img 
                        src={testimonials[testimonialIndex].image} 
                        alt={testimonials[testimonialIndex].name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-white text-base">{testimonials[testimonialIndex].name}</h4>
                      <p className="text-xs text-brand-red font-mono uppercase tracking-widest mt-0.5">{testimonials[testimonialIndex].role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Controls */}
            <div className="flex items-center justify-center gap-4 mt-10">
              <button 
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full bg-bg-card hover:bg-brand-red border border-white/5 hover:border-brand-red flex items-center justify-center text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2.5">
                {testimonials.map((_, i) => (
                  <span 
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${i === testimonialIndex ? 'bg-brand-red scale-110' : 'bg-zinc-700 hover:bg-brand-red/50'}`}
                  />
                ))}
              </div>
              <button 
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-bg-card hover:bg-brand-red border border-white/5 hover:border-brand-red flex items-center justify-center text-white transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* CONTACT / LEAD CAPTURE FORM */}
      <section id="contact" className="py-24 bg-bg-dark border-t border-white/5 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left Info Column */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono tracking-widest text-brand-red uppercase font-semibold">LET'S COLLABORATE</span>
                <h2 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl uppercase tracking-tighter text-white mt-2 mb-6">
                  LET'S CREATE A MASTERPIECE
                </h2>
                <p className="text-gray-400 font-light text-base leading-relaxed mb-8">
                  We only accept a limited number of clients monthly to ensure unmatched cinematic detail and hyper-dedicated communication. Lock in your session now.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="w-11 h-11 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red text-base">
                    <Mail className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">E-mail Us</div>
                    <a href="mailto:all.red.gaming.2003@gmail.com" className="text-white hover:text-brand-red transition-colors font-medium">all.red.gaming.2003@gmail.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 text-base">
                    {/* SVG WhatsApp icon to avoid library conflicts */}
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.022-.08-.124-.22-.364-.34-.24-.12-1.418-.7-1.638-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-.992-.367-1.89-1.16-.697-.62-1.168-1.387-1.305-1.625-.137-.238-.015-.367.107-.487.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.195-.47-.393-.406-.54-.414-.14-.007-.3-.008-.46-.008-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.09 3.62.57.25 1.02.4 1.37.51.57.18 1.09.15 1.5.09.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.2-.16-.44-.28zM12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10-10-4.48-10-10 4.48-10 10-10z" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Chat on WhatsApp</div>
                    <a href="https://wa.me/447700900077?text=Hello%20All%20Red%20Creation%2C%20I%20would%20like%20to%20discuss%20a%20video%20production%20project." target="_blank" rel="noreferrer" className="text-white hover:text-green-500 transition-colors font-medium">+44 7700 900077</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7">
              <div className="glass-card p-8 sm:p-10 rounded-3xl relative overflow-hidden">
                
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="name" className="text-xs font-mono tracking-widest text-gray-400 uppercase">Your Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-3.5 rounded-xl bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-red focus:outline-none text-white text-sm transition-colors" 
                        placeholder="e.g. Samuel Green"
                      />
                    </div>
                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="email" className="text-xs font-mono tracking-widest text-gray-400 uppercase">Your Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-5 py-3.5 rounded-xl bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-red focus:outline-none text-white text-sm transition-colors" 
                        placeholder="e.g. samuel@brand.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Project Category */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="project-type" className="text-xs font-mono tracking-widest text-gray-400 uppercase">Project Category</label>
                      <select 
                        id="project-type" 
                        required 
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        className="w-full px-5 py-3.5 rounded-xl bg-bg-darker border border-white/10 focus:border-brand-red focus:outline-none text-white text-sm transition-colors"
                      >
                        <option value="" disabled className="text-gray-500 bg-bg-dark">Select Project Type</option>
                        <option value="cinematic-shoot" className="bg-bg-dark text-white">Cinematic Shooting</option>
                        <option value="high-end-editing" className="bg-bg-dark text-white">High-End Video Editing</option>
                        <option value="social-growth" className="bg-bg-dark text-white">Social Media Reels/Shorts Package</option>
                        <option value="full-production" className="bg-bg-dark text-white">Full Commercial Production</option>
                      </select>
                    </div>
                    {/* Budget */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="budget" className="text-xs font-mono tracking-widest text-gray-400 uppercase">Estimated Budget</label>
                      <select 
                        id="budget" 
                        required 
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full px-5 py-3.5 rounded-xl bg-bg-darker border border-white/10 focus:border-brand-red focus:outline-none text-white text-sm transition-colors"
                      >
                        <option value="" disabled className="text-gray-500 bg-bg-dark">Select Budget Range</option>
                        <option value="under-2k" className="bg-bg-dark text-white">Under $2,000</option>
                        <option value="2k-5k" className="bg-bg-dark text-white">$2,000 - $5,000</option>
                        <option value="5k-10k" className="bg-bg-dark text-white">$5,000 - $10,000</option>
                        <option value="over-10k" className="bg-bg-dark text-white">$10,000+ (Enterprise)</option>
                      </select>
                    </div>
                  </div>

                  {/* Message Brief */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="message" className="text-xs font-mono tracking-widest text-gray-400 uppercase">Project Brief</label>
                    <textarea 
                      id="message" 
                      rows={4} 
                      required 
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-xl bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-red focus:outline-none text-white text-sm transition-colors resize-none" 
                      placeholder="Tell us about your brand, what you want to shoot or edit, and goals..."
                    />
                  </div>

                  {/* Action CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button 
                      type="submit" 
                      className="flex-1 py-4 px-6 rounded-xl bg-brand-red text-white text-sm font-bold tracking-wider hover:bg-brand-red-dark transition-all duration-300 shadow-[0_0_20px_rgba(255,0,43,0.3)] hover:shadow-[0_0_30px_rgba(255,0,43,0.5)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>SEND STRATEGY REQUEST</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button 
                      type="button" 
                      onClick={handleWhatsAppRedirect}
                      className="py-4 px-6 rounded-xl border border-green-500/30 hover:bg-green-500/10 text-green-500 text-sm font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {/* WhatsApp SVG */}
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.01 14.069.99 11.503.99c-5.44 0-9.863 4.37-9.868 9.799-.001 1.77.476 3.499 1.38 5.04L2.002 21.84l6.046-1.586z" />
                      </svg>
                      <span>DIRECT CHAT</span>
                    </button>
                  </div>
                </form>

                {/* Form Success Overlay */}
                <AnimatePresence>
                  {formSubmitted && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-bg-dark/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center text-center p-8 z-10"
                    >
                      <span className="w-16 h-16 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red text-3xl mb-6 shadow-[0_0_20px_rgba(255,0,43,0.2)] animate-pulse">
                        ✓
                      </span>
                      <h3 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight mb-2">Strategy Request Received!</h3>
                      <p className="text-gray-400 text-sm max-w-sm mb-8 font-light leading-relaxed">
                        Our lead creative director will review your brief and email you within 12 hours with a custom concept.
                      </p>
                      <button 
                        onClick={resetForm}
                        className="px-6 py-2.5 rounded-full border border-white/15 hover:border-brand-red text-xs font-bold tracking-widest text-gray-300 hover:text-white transition-colors cursor-pointer"
                      >
                        SEND ANOTHER INQUIRY
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-bg-darker border-t border-white/5 py-12 relative z-10 text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-brand-red rounded-xs rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(255,0,0,0.4)]">
              <div className="-rotate-45 font-display font-black text-[9px] text-white">AR</div>
            </div>
            <div className="font-display font-extrabold tracking-tighter text-sm text-white uppercase">
              ALL <span className="text-brand-red">RED</span> CREATION
            </div>
          </div>
          
          <p className="text-xs tracking-wide">
            &copy; 2026 All Red Creation. Engineered for High-Ticket Visual Excellence.
          </p>

          <div className="flex items-center gap-3">
            {/* Subtle Admin Portal link */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-[11px] text-gray-600 hover:text-gray-400 font-mono flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded hover:bg-white/5"
              title="Admin Content Manager"
            >
              <span>🔒 Admin</span>
            </button>

            {/* Subtle CRM Leads link */}
            <button
              onClick={() => setIsLeadsOpen(true)}
              className="text-[11px] text-gray-600 hover:text-gray-400 font-mono flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded hover:bg-white/5"
              title="Leads Database"
            >
              <span>📊 Leads</span>
              {leadsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-brand-red inline-block"></span>
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
          >
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all text-2xl focus:outline-none cursor-pointer"
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-white/10"
            >
              <iframe 
                className="w-full h-full" 
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`}
                title="Portfolio Video Playback"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Content Manager Modal */}
      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        projects={projects}
        onProjectsChange={handleProjectsChange}
      />

      {/* Leads CRM Dashboard Overlay */}
      {isLeadsOpen && (
        <LeadsDashboard onClose={() => setIsLeadsOpen(false)} />
      )}

      {/* Mandatory Auth Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onLoginSuccess={handleLoginSuccess}
        userEmailDefault="all.red.gaming.2003@gmail.com"
      />

      {/* Account Settings & Profile Modal */}
      <AccountSettingsModal
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
        onUpdateUser={(updatedUser) => {
          setCurrentUser(updatedUser);
          localStorage.setItem('all_red_user_session', JSON.stringify(updatedUser));
        }}
      />

    </div>
  );
}
