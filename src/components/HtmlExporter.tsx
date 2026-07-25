import React, { useState } from 'react';
import { Copy, Check, FileCode, Download, ExternalLink } from 'lucide-react';

export default function HtmlExporter() {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const singleFileHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Red Creation | Cinematic Video Production & Editing Agency</title>
  
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <!-- Google Fonts: Syne (Display) & Plus Jakarta Sans (Body) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            display: ['Syne', 'sans-serif'],
          },
          colors: {
            brand: {
              red: '#ff0000',
              redDark: '#cc0000',
              redLight: '#ff3333',
            },
            bg: {
              darker: '#050505',
              dark: '#0a0a0a',
              card: '#111111',
              cardHover: '#1c1c1c',
            }
          },
          boxShadow: {
            glow: '0 0 25px rgba(255, 0, 0, 0.2)',
            glowHover: '0 0 35px rgba(255, 0, 0, 0.45)',
          }
        }
      }
    }
  </script>

  <style>
    html {
      scroll-behavior: smooth;
      background-color: #050505;
      color: #f3f4f6;
    }
    
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #050505;
    }
    ::-webkit-scrollbar-thumb {
      background: #27272a;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #ff0000;
    }

    .text-glow {
      text-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
    }
    .glass {
      background: rgba(10, 10, 10, 0.8);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .glass-card {
      background: rgba(17, 17, 17, 0.6);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.04);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .glass-card:hover {
      background: rgba(26, 26, 26, 0.8);
      border-color: rgba(255, 0, 0, 0.3);
      transform: translateY(-4px);
    }
  </style>
</head>
<body class="bg-bg-darker text-gray-100 font-sans selection:bg-brand-red selection:text-white">

  <!-- Floating Noise Effect or Glow Dots -->
  <div class="fixed top-0 left-0 w-full h-full pointer-events-none z-50 opacity-[0.015] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
  <div class="fixed top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-red/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
  <div class="fixed bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-brand-red/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

  <!-- NAVIGATION BAR -->
  <header id="navbar" class="fixed top-0 left-0 w-full z-40 transition-all duration-300 py-5">
    <div class="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
      <!-- Logo -->
      <a href="#" class="flex items-center gap-3.5 group">
        <div class="w-8 h-8 bg-brand-red rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.5)] group-hover:scale-105 transition-all duration-300">
          <div class="-rotate-45 font-display font-black text-xs text-white">AR</div>
        </div>
        <div class="font-display font-extrabold tracking-tighter text-xl text-white uppercase">
          ALL <span class="text-brand-red">RED</span> CREATION
        </div>
      </a>

      <!-- Desktop Links -->
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
        <a href="#portfolio" class="text-gray-400 hover:text-white transition-colors">PORTFOLIO</a>
        <a href="#services" class="text-gray-400 hover:text-white transition-colors">SERVICES</a>
        <a href="#testimonials" class="text-gray-400 hover:text-white transition-colors">TESTIMONIALS</a>
        <a href="#contact" class="text-gray-400 hover:text-white transition-colors">GET IN TOUCH</a>
      </nav>

      <!-- Desktop CTA Button -->
      <div class="hidden md:flex items-center gap-4">
        <a href="#contact" class="px-5 py-2.5 rounded-full bg-brand-red text-white text-xs font-bold tracking-widest uppercase hover:bg-brand-red-hover transition-all duration-300 shadow-[0_0_15px_rgba(255,0,43,0.3)] hover:shadow-[0_0_25px_rgba(255,0,43,0.6)] transform hover:-translate-y-0.5">
          BOOK A CALL
        </a>
      </div>

      <!-- Mobile Menu Button -->
      <button id="mobile-menu-btn" class="md:hidden text-white p-2 focus:outline-none" aria-label="Toggle menu">
        <i class="fa-solid fa-bars text-xl"></i>
      </button>
    </div>

    <!-- Mobile Drawer -->
    <div id="mobile-drawer" class="fixed inset-y-0 right-0 w-64 bg-bg-dark border-l border-white/5 z-50 p-6 flex flex-col gap-8 transform translate-x-full transition-transform duration-300 shadow-2xl md:hidden">
      <div class="flex justify-between items-center">
        <span class="font-display font-bold text-sm tracking-widest text-brand-red">MENU</span>
        <button id="mobile-close-btn" class="text-gray-400 hover:text-white p-1">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>
      <nav class="flex flex-col gap-6 font-display font-bold text-lg">
        <a href="#portfolio" class="mobile-nav-link text-gray-300 hover:text-brand-red transition-colors">Portfolio</a>
        <a href="#services" class="mobile-nav-link text-gray-300 hover:text-brand-red transition-colors">Services</a>
        <a href="#testimonials" class="mobile-nav-link text-gray-300 hover:text-brand-red transition-colors">Testimonials</a>
        <a href="#contact" class="mobile-nav-link text-gray-300 hover:text-brand-red transition-colors">Contact</a>
      </nav>
      <div class="mt-auto">
        <a href="#contact" class="mobile-nav-link w-full py-3 rounded-xl bg-brand-red text-white font-bold text-center block shadow-[0_0_15px_rgba(255,0,43,0.3)]">
          BOOK A CALL
        </a>
      </div>
    </div>
  </header>

  <!-- HERO SECTION -->
  <section class="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden">
    <!-- Ambient Background Media / Graphic -->
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 bg-gradient-to-b from-bg-darker via-transparent to-bg-darker z-10"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-bg-darker via-transparent to-bg-darker z-10"></div>
      <!-- Highly stylized dark mesh pattern + cinematic scale video placeholder -->
      <div class="absolute inset-0 opacity-20 filter grayscale contrast-125 scale-105 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80" alt="Cinematic Background" class="w-full h-full object-cover">
      </div>
    </div>

    <div class="relative z-10 max-w-5xl mx-auto px-6 text-center">
      <!-- Tagline Badge -->
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
        <span class="w-2 h-2 rounded-full bg-brand-red animate-ping"></span>
        <span class="text-xs font-mono tracking-widest text-gray-300 uppercase">HIGH-TICKET VIDEO PRODUCTION AGENCY</span>
      </div>

      <!-- Main Headline -->
      <h1 class="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter text-white uppercase leading-[0.9] mb-8">
        WE DON'T JUST <br>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-brand-red">SHOOT & EDIT.</span> <br>
        WE CREATE <span class="text-brand-red text-glow">MASTERPIECES.</span>
      </h1>

      <!-- Subheadline -->
      <p class="max-w-2xl mx-auto text-gray-400 text-lg sm:text-xl font-light tracking-wide mb-12 leading-relaxed">
        We engineer high-converting commercial reels, YouTube showstoppers, and social media campaigns that command authority, double retention, and sign high-ticket clients for your business.
      </p>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-5">
        <a href="#portfolio" class="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-red text-white font-bold tracking-wider text-sm hover:bg-brand-red-hover transition-all duration-300 shadow-[0_0_30px_rgba(255,0,43,0.4)] hover:shadow-[0_0_45px_rgba(255,0,43,0.7)] flex items-center justify-center gap-3 transform hover:-translate-y-1">
          <span>VIEW PORTFOLIO</span>
          <i class="fa-solid fa-play text-xs"></i>
        </a>
        <a href="#contact" class="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:border-brand-red/30 hover:bg-white/10 text-white font-bold tracking-wider text-sm transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1">
          <span>LET'S WORK TOGETHER</span>
          <i class="fa-solid fa-arrow-right text-xs"></i>
        </a>
      </div>
    </div>

    <!-- Scroll Down Arrow -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-gray-500 animate-bounce">
      <a href="#portfolio" aria-label="Scroll down">
        <i class="fa-solid fa-chevron-down text-xl"></i>
      </a>
    </div>
  </section>

  <!-- SOCIAL PROOF / STATS SECTION -->
  <section class="py-16 bg-bg-dark border-y border-white/5 relative z-10">
    <div class="max-w-7xl mx-auto px-6 md:px-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        <!-- Stat item 1 -->
        <div class="flex flex-col items-center">
          <div class="font-display font-extrabold text-5xl sm:text-6xl text-brand-red mb-3 text-glow">50+</div>
          <div class="text-xs font-mono tracking-widest text-gray-400 uppercase">Projects Delivered Worldwide</div>
        </div>
        <!-- Stat item 2 -->
        <div class="flex flex-col items-center border-y md:border-y-0 md:border-x border-white/5 py-8 md:py-0">
          <div class="font-display font-extrabold text-5xl sm:text-6xl text-white mb-3">10M+</div>
          <div class="text-xs font-mono tracking-widest text-gray-400 uppercase">Combined Social Media Views</div>
        </div>
        <!-- Stat item 3 -->
        <div class="flex flex-col items-center">
          <div class="font-display font-extrabold text-5xl sm:text-6xl text-brand-red mb-3 text-glow">99%</div>
          <div class="text-xs font-mono tracking-widest text-gray-400 uppercase">Client Retention Rate</div>
        </div>
      </div>
    </div>
  </section>

  <!-- PORTFOLIO SHOWCASE -->
  <section id="portfolio" class="py-24 relative z-10 scroll-mt-20">
    <div class="max-w-7xl mx-auto px-6 md:px-12">
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <span class="text-xs font-mono tracking-widest text-brand-red uppercase font-semibold">OUR SHOWREEL</span>
          <h2 class="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl uppercase tracking-tighter text-white mt-2">
            THE WORKS THAT <br>COMMAND ATTENTION
          </h2>
        </div>
        <p class="max-w-md text-gray-400 font-light text-base">
          Our portfolio spans premium promotional films, high-engagement YouTube content, cinematic commercials, and viral vertical shorts.
        </p>
      </div>

      <!-- Portfolio Category Tabs -->
      <div class="flex flex-wrap items-center gap-3 mb-12 border-b border-white/5 pb-6">
        <button class="portfolio-tab active px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all bg-brand-red text-white" data-category="all">
          ALL PROJECTS
        </button>
        <button class="portfolio-tab px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all text-gray-400 hover:text-white" data-category="reels">
          REELS & SHORTS
        </button>
        <button class="portfolio-tab px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all text-gray-400 hover:text-white" data-category="youtube">
          YOUTUBE PRODUCTION
        </button>
        <button class="portfolio-tab px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all text-gray-400 hover:text-white" data-category="commercials">
          COMMERCIALS
        </button>
      </div>

      <!-- Portfolio Grid -->
      <div id="portfolio-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Project 1 (Commercial) -->
        <div class="portfolio-item group relative overflow-hidden rounded-2xl glass-card aspect-video cursor-pointer" data-category="commercials" data-video-id="9XqfA-4y8Sg">
          <img src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80" alt="Nike Speed" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
          
          <!-- Hover Glow Accent -->
          <div class="absolute inset-0 bg-brand-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span class="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center shadow-[0_0_20px_rgba(255,0,43,0.6)] transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <i class="fa-solid fa-play text-white text-xl ml-1"></i>
            </span>
          </div>

          <div class="absolute bottom-6 left-6 right-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-mono tracking-widest text-brand-red uppercase bg-brand-red/10 px-2.5 py-1 rounded-full border border-brand-red/20">COMMERCIALS</span>
              <span class="text-xs font-mono text-gray-300"><i class="fa-solid fa-eye mr-1.5 text-brand-red"></i>2.4M Views</span>
            </div>
            <h3 class="font-display font-extrabold text-xl text-white uppercase">AERO ATHLETICS</h3>
            <p class="text-xs text-gray-400 font-light mt-1">Cinematic Commercial Shoot & Visual Edit</p>
          </div>
        </div>

        <!-- Project 2 (Reels) -->
        <div class="portfolio-item group relative overflow-hidden rounded-2xl glass-card aspect-video cursor-pointer" data-category="reels" data-video-id="z6zD6999Lh4">
          <img src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80" alt="Cyberpunk" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
          
          <div class="absolute inset-0 bg-brand-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span class="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center shadow-[0_0_20px_rgba(255,0,43,0.6)] transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <i class="fa-solid fa-play text-white text-xl ml-1"></i>
            </span>
          </div>

          <div class="absolute bottom-6 left-6 right-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-mono tracking-widest text-brand-red uppercase bg-brand-red/10 px-2.5 py-1 rounded-full border border-brand-red/20">REELS & SHORTS</span>
              <span class="text-xs font-mono text-gray-300"><i class="fa-solid fa-eye mr-1.5 text-brand-red"></i>1.2M Views</span>
            </div>
            <h3 class="font-display font-extrabold text-xl text-white uppercase">NEON STREET BEATS</h3>
            <p class="text-xs text-gray-400 font-light mt-1">VFX Hyper-Editing & Fast Transitions</p>
          </div>
        </div>

        <!-- Project 3 (YouTube) -->
        <div class="portfolio-item group relative overflow-hidden rounded-2xl glass-card aspect-video cursor-pointer" data-category="youtube" data-video-id="ScMzIvxBSi4">
          <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80" alt="Creator Space" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
          
          <div class="absolute inset-0 bg-brand-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span class="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center shadow-[0_0_20px_rgba(255,0,43,0.6)] transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <i class="fa-solid fa-play text-white text-xl ml-1"></i>
            </span>
          </div>

          <div class="absolute bottom-6 left-6 right-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-mono tracking-widest text-brand-red uppercase bg-brand-red/10 px-2.5 py-1 rounded-full border border-brand-red/20">YOUTUBE</span>
              <span class="text-xs font-mono text-gray-300"><i class="fa-solid fa-eye mr-1.5 text-brand-red"></i>850K Views</span>
            </div>
            <h3 class="font-display font-extrabold text-xl text-white uppercase">THE CREATOR JOURNEY</h3>
            <p class="text-xs text-gray-400 font-light mt-1">Full YouTube Episode Production & Strategy</p>
          </div>
        </div>

        <!-- Project 4 (Commercial) -->
        <div class="portfolio-item group relative overflow-hidden rounded-2xl glass-card aspect-video cursor-pointer" data-category="commercials" data-video-id="3z0U5Y5D3r8">
          <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" alt="Tech" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
          
          <div class="absolute inset-0 bg-brand-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span class="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center shadow-[0_0_20px_rgba(255,0,43,0.6)] transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <i class="fa-solid fa-play text-white text-xl ml-1"></i>
            </span>
          </div>

          <div class="absolute bottom-6 left-6 right-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-mono tracking-widest text-brand-red uppercase bg-brand-red/10 px-2.5 py-1 rounded-full border border-brand-red/20">COMMERCIALS</span>
              <span class="text-xs font-mono text-gray-300"><i class="fa-solid fa-eye mr-1.5 text-brand-red"></i>1.8M Views</span>
            </div>
            <h3 class="font-display font-extrabold text-xl text-white uppercase">NEXTGEN VEHICLE LAUNCH</h3>
            <p class="text-xs text-gray-400 font-light mt-1">High-End Product Design Promo Shoot & Grade</p>
          </div>
        </div>

        <!-- Project 5 (Reels) -->
        <div class="portfolio-item group relative overflow-hidden rounded-2xl glass-card aspect-video cursor-pointer" data-category="reels" data-video-id="K8T0Xv4S4gE">
          <img src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80" alt="Action" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
          
          <div class="absolute inset-0 bg-brand-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span class="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center shadow-[0_0_20px_rgba(255,0,43,0.6)] transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <i class="fa-solid fa-play text-white text-xl ml-1"></i>
            </span>
          </div>

          <div class="absolute bottom-6 left-6 right-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-mono tracking-widest text-brand-red uppercase bg-brand-red/10 px-2.5 py-1 rounded-full border border-brand-red/20">REELS & SHORTS</span>
              <span class="text-xs font-mono text-gray-300"><i class="fa-solid fa-eye mr-1.5 text-brand-red"></i>3.1M Views</span>
            </div>
            <h3 class="font-display font-extrabold text-xl text-white uppercase">LIMITLESS MOVEMENT</h3>
            <p class="text-xs text-gray-400 font-light mt-1">Fast-Paced Sound Design & Speed Ramping</p>
          </div>
        </div>

        <!-- Project 6 (YouTube) -->
        <div class="portfolio-item group relative overflow-hidden rounded-2xl glass-card aspect-video cursor-pointer" data-category="youtube" data-video-id="F-9S_Gf9t78">
          <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80" alt="Documentary" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
          
          <div class="absolute inset-0 bg-brand-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span class="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center shadow-[0_0_20px_rgba(255,0,43,0.6)] transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <i class="fa-solid fa-play text-white text-xl ml-1"></i>
            </span>
          </div>

          <div class="absolute bottom-6 left-6 right-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-mono tracking-widest text-brand-red uppercase bg-brand-red/10 px-2.5 py-1 rounded-full border border-brand-red/20">YOUTUBE</span>
              <span class="text-xs font-mono text-gray-300"><i class="fa-solid fa-eye mr-1.5 text-brand-red"></i>1.1M Views</span>
            </div>
            <h3 class="font-display font-extrabold text-xl text-white uppercase">THE WILD EXPLORER</h3>
            <p class="text-xs text-gray-400 font-light mt-1">Cinematic Documentary Grading & Soundscapes</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SERVICES SECTION -->
  <section id="services" class="py-24 bg-bg-dark border-y border-white/5 relative z-10 scroll-mt-20">
    <div class="max-w-7xl mx-auto px-6 md:px-12">
      <!-- Section Header -->
      <div class="max-w-3xl mb-16">
        <span class="text-xs font-mono tracking-widest text-brand-red uppercase font-semibold">OUR CAPABILITIES</span>
        <h2 class="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl uppercase tracking-tighter text-white mt-2">
          ENGINEERED TO GROW <br>YOUR REVENUE & BRAND
        </h2>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Service 1 -->
        <div class="glass-card p-8 md:p-10 rounded-3xl flex flex-col gap-6">
          <div class="w-14 h-14 rounded-2xl bg-brand-red/10 border border-brand-red/25 flex items-center justify-center text-brand-red text-2xl shadow-[0_0_15px_rgba(255,0,43,0.1)]">
            <i class="fa-solid fa-video"></i>
          </div>
          <div>
            <h3 class="font-display font-extrabold text-2xl text-white uppercase tracking-tight mb-3">Cinematic Shooting</h3>
            <p class="text-gray-400 font-light leading-relaxed">
              We shoot high-end commercials, course contents, corporate spotlights, and high-production-value creators on 4K/6K cinema rigs. Our visual aesthetic sets you apart from amateur creators instantly.
            </p>
          </div>
          <ul class="mt-auto space-y-2.5 text-sm font-medium text-gray-300">
            <li><i class="fa-solid fa-circle-check text-brand-red mr-3"></i> RED / Arri Cinema Standard</li>
            <li><i class="fa-solid fa-circle-check text-brand-red mr-3"></i> Direction & On-Set Production</li>
            <li><i class="fa-solid fa-circle-check text-brand-red mr-3"></i> Multi-Camera Dynamic Setups</li>
          </ul>
        </div>

        <!-- Service 2 -->
        <div class="glass-card p-8 md:p-10 rounded-3xl flex flex-col gap-6">
          <div class="w-14 h-14 rounded-2xl bg-brand-red/10 border border-brand-red/25 flex items-center justify-center text-brand-red text-2xl shadow-[0_0_15px_rgba(255,0,43,0.1)]">
            <i class="fa-solid fa-sliders"></i>
          </div>
          <div>
            <h3 class="font-display font-extrabold text-2xl text-white uppercase tracking-tight mb-3">High-End Video Editing</h3>
            <p class="text-gray-400 font-light leading-relaxed">
              Fast, high-retention pacing, narrative pacing optimization, custom SFX overlays, and hyper-engaging animated motion text designed to hold viewer attention for maximum watch time.
            </p>
          </div>
          <ul class="mt-auto space-y-2.5 text-sm font-medium text-gray-300">
            <li><i class="fa-solid fa-circle-check text-brand-red mr-3"></i> Engagement-Driven Editing Pacing</li>
            <li><i class="fa-solid fa-circle-check text-brand-red mr-3"></i> Custom Soundscape Construction</li>
            <li><i class="fa-solid fa-circle-check text-brand-red mr-3"></i> Kinetic Typography & GFX</li>
          </ul>
        </div>

        <!-- Service 3 -->
        <div class="glass-card p-8 md:p-10 rounded-3xl flex flex-col gap-6">
          <div class="w-14 h-14 rounded-2xl bg-brand-red/10 border border-brand-red/25 flex items-center justify-center text-brand-red text-2xl shadow-[0_0_15px_rgba(255,0,43,0.1)]">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <div>
            <h3 class="font-display font-extrabold text-2xl text-white uppercase tracking-tight mb-3">Color Grading & Sound Design</h3>
            <p class="text-gray-400 font-light leading-relaxed">
              We craft professional audio palettes and apply bespoke cinematic color LUTs that give your videos a distinct, memorable atmospheric feel. This is what transforms footage into a premium brand masterwork.
            </p>
          </div>
          <ul class="mt-auto space-y-2.5 text-sm font-medium text-gray-300">
            <li><i class="fa-solid fa-circle-check text-brand-red mr-3"></i> Custom Color Correction & Grading</li>
            <li><i class="fa-solid fa-circle-check text-brand-red mr-3"></i> Audio Polishing & Noise Suppression</li>
            <li><i class="fa-solid fa-circle-check text-brand-red mr-3"></i> 3D Cinematic Audio Spatialization</li>
          </ul>
        </div>

        <!-- Service 4 -->
        <div class="glass-card p-8 md:p-10 rounded-3xl flex flex-col gap-6">
          <div class="w-14 h-14 rounded-2xl bg-brand-red/10 border border-brand-red/25 flex items-center justify-center text-brand-red text-2xl shadow-[0_0_15px_rgba(255,0,43,0.1)]">
            <i class="fa-solid fa-chart-line"></i>
          </div>
          <div>
            <h3 class="font-display font-extrabold text-2xl text-white uppercase tracking-tight mb-3">Social Growth Strategy</h3>
            <p class="text-gray-400 font-light leading-relaxed">
              We construct custom scripts, hooks, viral concept brainstorms, thumbnail designs, and optimized platform-by-platform distributions to make sure your video content actually achieves business KPIs.
            </p>
          </div>
          <ul class="mt-auto space-y-2.5 text-sm font-medium text-gray-300">
            <li><i class="fa-solid fa-circle-check text-brand-red mr-3"></i> Viral Hook Scriptwriting Systems</li>
            <li><i class="fa-solid fa-circle-check text-brand-red mr-3"></i> YouTube & Reels Optimization</li>
            <li><i class="fa-solid fa-circle-check text-brand-red mr-3"></i> Conversion-Focused Funnel Building</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS SECTION -->
  <section id="testimonials" class="py-24 relative z-10 scroll-mt-20">
    <div class="max-w-7xl mx-auto px-6 md:px-12">
      <!-- Section Header -->
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="text-xs font-mono tracking-widest text-brand-red uppercase font-semibold">TESTIMONIALS</span>
        <h2 class="font-display font-extrabold text-4xl sm:text-5xl uppercase tracking-tighter text-white mt-2">
          WHAT OUR CLIENTS SAY
        </h2>
        <p class="text-gray-400 font-light mt-4">
          Read success stories from premium brands and scaling content creators who trusted All Red Creation to scale their visual presence.
        </p>
      </div>

      <!-- Testimonial Slider Wrapper -->
      <div class="relative max-w-4xl mx-auto">
        <!-- Testimonial slides -->
        <div class="overflow-hidden">
          <div id="testimonial-container" class="flex transition-transform duration-500 ease-out" style="transform: translateX(0%);">
            
            <!-- Slide 1 -->
            <div class="w-full flex-shrink-0 px-4">
              <div class="glass-card p-10 md:p-12 rounded-3xl relative">
                <i class="fa-solid fa-quote-left text-brand-red text-6xl opacity-10 absolute top-8 left-8"></i>
                <div class="relative z-10">
                  <div class="flex items-center gap-1 mb-6 text-brand-red">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                  </div>
                  <p class="text-gray-300 text-lg md:text-xl font-light italic leading-relaxed mb-8">
                    "All Red Creation completely revolutionised our organic social marketing. Their hyper-dynamic edit style immediately boosted our Instagram Reels' retention by 42%. We closed three high-ticket consulting clients in the first month from a single viral short!"
                  </p>
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-brand-red/30">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Marcus" class="w-full h-full object-cover">
                    </div>
                    <div>
                      <h4 class="font-display font-extrabold text-white text-base">MARCUS THORNE</h4>
                      <p class="text-xs text-brand-red font-mono uppercase tracking-widest mt-0.5">Founder, Thorne Capital</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Slide 2 -->
            <div class="w-full flex-shrink-0 px-4">
              <div class="glass-card p-10 md:p-12 rounded-3xl relative">
                <i class="fa-solid fa-quote-left text-brand-red text-6xl opacity-10 absolute top-8 left-8"></i>
                <div class="relative z-10">
                  <div class="flex items-center gap-1 mb-6 text-brand-red">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                  </div>
                  <p class="text-gray-300 text-lg md:text-xl font-light italic leading-relaxed mb-8">
                    "Working with ARC was seamless. They understood our premium brand values perfectly. The cinematic color grading and sound design they delivered on our commercial product film felt like a Hollywood production. Absolutely recommended!"
                  </p>
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-brand-red/30">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Elena" class="w-full h-full object-cover">
                    </div>
                    <div>
                      <h4 class="font-display font-extrabold text-white text-base">ELENA ROSTOVA</h4>
                      <p class="text-xs text-brand-red font-mono uppercase tracking-widest mt-0.5">Marketing Director, Velo Lux</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Slide 3 -->
            <div class="w-full flex-shrink-0 px-4">
              <div class="glass-card p-10 md:p-12 rounded-3xl relative">
                <i class="fa-solid fa-quote-left text-brand-red text-6xl opacity-10 absolute top-8 left-8"></i>
                <div class="relative z-10">
                  <div class="flex items-center gap-1 mb-6 text-brand-red">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                  </div>
                  <p class="text-gray-300 text-lg md:text-xl font-light italic leading-relaxed mb-8">
                    "The scripting dynamic they integrated into our YouTube strategy was a complete game-changer. Our subscribers grew from 25k to over 100k in less than 4 months, and the production quality has set a whole new benchmark in our niche."
                  </p>
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-brand-red/30">
                      <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="Sarah" class="w-full h-full object-cover">
                    </div>
                    <div>
                      <h4 class="font-display font-extrabold text-white text-base">SAMUEL KEMP</h4>
                      <p class="text-xs text-brand-red font-mono uppercase tracking-widest mt-0.5">Lead Creator, TechWave HQ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Slider Controls -->
        <div class="flex items-center justify-center gap-4 mt-10">
          <button id="slider-prev" class="w-12 h-12 rounded-full bg-bg-card hover:bg-brand-red border border-white/5 hover:border-brand-red flex items-center justify-center text-white transition-all cursor-pointer">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <div id="slider-dots" class="flex gap-2.5">
            <span class="slider-dot w-2.5 h-2.5 rounded-full bg-brand-red transition-all cursor-pointer" data-index="0"></span>
            <span class="slider-dot w-2.5 h-2.5 rounded-full bg-zinc-700 hover:bg-brand-red/50 transition-all cursor-pointer" data-index="1"></span>
            <span class="slider-dot w-2.5 h-2.5 rounded-full bg-zinc-700 hover:bg-brand-red/50 transition-all cursor-pointer" data-index="2"></span>
          </div>
          <button id="slider-next" class="w-12 h-12 rounded-full bg-bg-card hover:bg-brand-red border border-white/5 hover:border-brand-red flex items-center justify-center text-white transition-all cursor-pointer">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- LEAD CAPTURE / CONTACT FORM -->
  <section id="contact" class="py-24 bg-bg-dark border-t border-white/5 relative z-10 scroll-mt-20">
    <div class="max-w-7xl mx-auto px-6 md:px-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        <!-- Left Side Content -->
        <div class="lg:col-span-5 flex flex-col justify-between">
          <div>
            <span class="text-xs font-mono tracking-widest text-brand-red uppercase font-semibold">LET'S COLLABORATE</span>
            <h2 class="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl uppercase tracking-tighter text-white mt-2 mb-6">
              LET'S CREATE A MASTERPIECE
            </h2>
            <p class="text-gray-400 font-light text-base leading-relaxed mb-8">
              We only accept a limited number of clients monthly to ensure unmatched cinematic detail and hyper-dedicated communication. Lock in your session now.
            </p>
          </div>

          <div class="space-y-6">
            <!-- Contact Detail 1 -->
            <div class="flex items-center gap-4">
              <span class="w-11 h-11 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red text-base">
                <i class="fa-solid fa-envelope"></i>
              </span>
              <div>
                <div class="text-xs font-mono text-gray-500 uppercase tracking-widest">E-mail Us</div>
                <a href="mailto:all.red.gaming.2003@gmail.com" class="text-white hover:text-brand-red transition-colors font-medium">all.red.gaming.2003@gmail.com</a>
              </div>
            </div>

            <!-- Contact Detail 2 -->
            <div class="flex items-center gap-4">
              <span class="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 text-base">
                <i class="fa-brands fa-whatsapp"></i>
              </span>
              <div>
                <div class="text-xs font-mono text-gray-500 uppercase tracking-widest">Chat on WhatsApp</div>
                <a href="https://wa.me/447700900077?text=Hello%20All%20Red%20Creation%2C%20I%20would%20like%20to%20discuss%20a%20video%20production%20project." target="_blank" class="text-white hover:text-green-500 transition-colors font-medium">+44 7700 900077</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side Form -->
        <div class="lg:col-span-7">
          <div class="glass-card p-8 sm:p-10 rounded-3xl relative">
            
            <form id="contact-form" class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <!-- Name -->
                <div class="flex flex-col gap-1.5">
                  <label for="name" class="text-xs font-mono tracking-widest text-gray-400 uppercase">Your Name</label>
                  <input type="text" id="name" required class="w-full px-5 py-3.5 rounded-xl bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-red focus:outline-none text-white text-sm transition-colors" placeholder="e.g. Samuel Green">
                </div>
                <!-- Email -->
                <div class="flex flex-col gap-1.5">
                  <label for="email" class="text-xs font-mono tracking-widest text-gray-400 uppercase">Your Email</label>
                  <input type="email" id="email" required class="w-full px-5 py-3.5 rounded-xl bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-red focus:outline-none text-white text-sm transition-colors" placeholder="e.g. samuel@brand.com">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <!-- Project Type -->
                <div class="flex flex-col gap-1.5">
                  <label for="project-type" class="text-xs font-mono tracking-widest text-gray-400 uppercase">Project Category</label>
                  <select id="project-type" required class="w-full px-5 py-3.5 rounded-xl bg-bg-darker border border-white/10 focus:border-brand-red focus:outline-none text-white text-sm transition-colors">
                    <option value="" disabled selected class="bg-bg-dark text-gray-500">Select Project Type</option>
                    <option value="cinematic-shoot" class="bg-bg-dark text-white">Cinematic Shooting</option>
                    <option value="high-end-editing" class="bg-bg-dark text-white">High-End Video Editing</option>
                    <option value="social-growth" class="bg-bg-dark text-white">Social Media Reels/Shorts Package</option>
                    <option value="full-production" class="bg-bg-dark text-white">Full Commercial Production</option>
                  </select>
                </div>
                <!-- Budget -->
                <div class="flex flex-col gap-1.5">
                  <label for="budget" class="text-xs font-mono tracking-widest text-gray-400 uppercase">Estimated Budget</label>
                  <select id="budget" required class="w-full px-5 py-3.5 rounded-xl bg-bg-darker border border-white/10 focus:border-brand-red focus:outline-none text-white text-sm transition-colors">
                    <option value="" disabled selected class="bg-bg-dark text-gray-500">Select Budget Range</option>
                    <option value="under-2k" class="bg-bg-dark text-white">Under $2,000</option>
                    <option value="2k-5k" class="bg-bg-dark text-white">$2,000 - $5,000</option>
                    <option value="5k-10k" class="bg-bg-dark text-white">$5,000 - $10,000</option>
                    <option value="over-10k" class="bg-bg-dark text-white">$10,000+ (Enterprise)</option>
                  </select>
                </div>
              </div>

              <!-- Message -->
              <div class="flex flex-col gap-1.5">
                <label for="message" class="text-xs font-mono tracking-widest text-gray-400 uppercase">Project Brief</label>
                <textarea id="message" rows="4" required class="w-full px-5 py-3.5 rounded-xl bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-red focus:outline-none text-white text-sm transition-colors resize-none" placeholder="Tell us about your brand, what you want to shoot or edit, and goals..."></textarea>
              </div>

              <!-- CTA Options -->
              <div class="flex flex-col sm:flex-row gap-4 pt-2">
                <button type="submit" class="flex-1 py-4 px-6 rounded-xl bg-brand-red text-white text-sm font-bold tracking-wider hover:bg-brand-red-hover transition-all duration-300 shadow-[0_0_20px_rgba(255,0,43,0.3)] hover:shadow-[0_0_30px_rgba(255,0,43,0.5)] flex items-center justify-center gap-2 cursor-pointer">
                  <span>SEND STRATEGY REQUEST</span>
                  <i class="fa-solid fa-paper-plane text-xs"></i>
                </button>
                <button type="button" id="whatsapp-direct-btn" class="py-4 px-6 rounded-xl border border-green-500/30 hover:bg-green-500/10 text-green-500 text-sm font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <i class="fa-brands fa-whatsapp text-lg"></i>
                  <span>DIRECT CHAT</span>
                </button>
              </div>
            </form>

            <!-- Success State (Hidden by default) -->
            <div id="form-success-overlay" class="absolute inset-0 bg-bg-dark/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center text-center p-8 opacity-0 pointer-events-none transition-all duration-500">
              <span class="w-16 h-16 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red text-3xl mb-6 shadow-[0_0_20px_rgba(255,0,43,0.2)] animate-scale-up">
                <i class="fa-solid fa-check"></i>
              </span>
              <h3 class="font-display font-extrabold text-2xl text-white uppercase tracking-tight mb-2">Strategy Request Received!</h3>
              <p class="text-gray-400 text-sm max-w-sm mb-8 font-light">
                Our lead creative director will review your brief and email you within 12 hours with a custom concept.
              </p>
              <button id="success-reset-btn" class="px-6 py-2.5 rounded-full border border-white/15 hover:border-brand-red text-xs font-bold tracking-widest text-gray-300 hover:text-white transition-colors">
                SEND ANOTHER INQUIRY
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="bg-bg-darker border-t border-white/5 py-12 relative z-10 text-gray-500 text-sm">
    <div class="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-2">
        <span class="w-6 h-6 rounded bg-brand-red flex items-center justify-center font-display font-bold text-white text-xs tracking-tighter">A</span>
        <div class="font-display font-bold text-sm tracking-tight text-white">
          ALL <span class="text-brand-red">RED</span> CREATION
        </div>
      </div>
      
      <p class="text-xs tracking-wide">
        &copy; 2026 All Red Creation. Engineered for High-Ticket Visual Excellence.
      </p>

      <div class="flex items-center gap-5 text-gray-400 text-base">
        <a href="#" class="hover:text-brand-red transition-colors"><i class="fa-brands fa-instagram"></i></a>
        <a href="#" class="hover:text-brand-red transition-colors"><i class="fa-brands fa-youtube"></i></a>
        <a href="#" class="hover:text-brand-red transition-colors"><i class="fa-brands fa-vimeo-v"></i></a>
        <a href="#" class="hover:text-brand-red transition-colors"><i class="fa-brands fa-tiktok"></i></a>
      </div>
    </div>
  </footer>

  <!-- VIDEO EMBED MODAL -->
  <div id="video-modal" class="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 opacity-0 pointer-events-none transition-all duration-300">
    <button id="modal-close-btn" class="absolute top-4 right-4 md:top-8 md:right-8 text-gray-400 hover:text-white p-2 text-3xl focus:outline-none cursor-pointer">
      <i class="fa-solid fa-xmark"></i>
    </button>
    <div class="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-white/10">
      <iframe id="modal-iframe" class="w-full h-full" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
  </div>

  <!-- INLINE JAVASCRIPT -->
  <script>
    // --- NAVBAR COLOR CHANGE ON SCROLL ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('glass', 'shadow-lg');
        navbar.classList.remove('py-5');
        navbar.classList.add('py-3.5');
      } else {
        navbar.classList.remove('glass', 'shadow-lg');
        navbar.classList.add('py-5');
        navbar.classList.remove('py-3.5');
      }
    });

    // --- MOBILE DRAWER MENUS ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileCloseBtn = document.getElementById('mobile-close-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    const openDrawer = () => {
      mobileDrawer.classList.remove('translate-x-full');
    };

    const closeDrawer = () => {
      mobileDrawer.classList.add('translate-x-full');
    };

    mobileMenuBtn.addEventListener('click', openDrawer);
    mobileCloseBtn.addEventListener('click', closeDrawer);
    mobileNavLinks.forEach(link => link.addEventListener('click', closeDrawer));

    // --- PORTFOLIO FILTERING ---
    const tabs = document.querySelectorAll('.portfolio-tab');
    const items = document.querySelectorAll('.portfolio-item');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Toggle Active Class on Tabs
        tabs.forEach(t => {
          t.classList.remove('active', 'bg-brand-red', 'text-white');
          t.classList.add('text-gray-400', 'hover:text-white');
        });
        tab.classList.add('active', 'bg-brand-red', 'text-white');
        tab.classList.remove('text-gray-400', 'hover:text-white');

        // Filter Grid Items
        const category = tab.getAttribute('data-category');
        items.forEach(item => {
          const itemCategory = item.getAttribute('data-category');
          if (category === 'all' || itemCategory === category) {
            item.style.display = 'block';
            setTimeout(() => item.style.opacity = '1', 50);
          } else {
            item.style.opacity = '0';
            setTimeout(() => item.style.display = 'none', 300);
          }
        });
      });
    });

    // --- VIDEO MODAL CONTROL ---
    const videoModal = document.getElementById('video-modal');
    const modalIframe = document.getElementById('modal-iframe');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    portfolioItems.forEach(item => {
      item.addEventListener('click', () => {
        const videoId = item.getAttribute('data-video-id');
        modalIframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
        videoModal.classList.remove('opacity-0', 'pointer-events-none');
      });
    });

    const closeModal = () => {
      videoModal.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        modalIframe.src = '';
      }, 300);
    };

    modalCloseBtn.addEventListener('click', closeModal);
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) {
        closeModal();
      }
    });

    // --- TESTIMONIAL SLIDER ---
    const container = document.getElementById('testimonial-container');
    const slides = container.children;
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dots = document.querySelectorAll('.slider-dot');
    let currentIndex = 0;

    const updateSlider = (index) => {
      currentIndex = index;
      container.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
      
      // Update dots
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add('bg-brand-red');
          dot.classList.remove('bg-zinc-700');
        } else {
          dot.classList.remove('bg-brand-red');
          dot.classList.add('bg-zinc-700');
        }
      });
    };

    nextBtn.addEventListener('click', () => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= slides.length) nextIndex = 0;
      updateSlider(nextIndex);
    });

    prevBtn.addEventListener('click', () => {
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = slides.length - 1;
      updateSlider(prevIndex);
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        updateSlider(index);
      });
    });

    // --- CONTACT FORM & WHATSAPP HANDLING ---
    const contactForm = document.getElementById('contact-form');
    const successOverlay = document.getElementById('form-success-overlay');
    const successResetBtn = document.getElementById('success-reset-btn');
    const whatsappDirectBtn = document.getElementById('whatsapp-direct-btn');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Collect input values
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const projectType = document.getElementById('project-type').value;
      const budget = document.getElementById('budget').value;
      const message = document.getElementById('message').value;

      // Log/Save Inquiry mock
      console.log('New Inquiry Received:', { name, email, projectType, budget, message });

      // Save to localStorage for demo persistent tracking
      const inquiries = JSON.parse(localStorage.getItem('arc_inquiries') || '[]');
      inquiries.push({ name, email, projectType, budget, message, timestamp: new Date().toISOString() });
      localStorage.setItem('arc_inquiries', JSON.stringify(inquiries));

      // Trigger animation event for leads panel if exist in scope
      window.dispatchEvent(new CustomEvent('arcInquirySubmitted'));

      // Show overlay success
      successOverlay.classList.remove('opacity-0', 'pointer-events-none');
    });

    successResetBtn.addEventListener('click', () => {
      contactForm.reset();
      successOverlay.classList.add('opacity-0', 'pointer-events-none');
    });

    whatsappDirectBtn.addEventListener('click', () => {
      const name = document.getElementById('name').value || 'Visitor';
      const projectType = document.getElementById('project-type').value || 'Cinematic Project';
      const budget = document.getElementById('budget').value || 'Not Specified';
      
      const whatsappText = 'Hello All Red Creation! I am ' + name + '. I would like to discuss a ' + projectType + ' with an estimated budget of ' + budget + '.';
      const encodedText = encodeURIComponent(whatsappText);
      window.open('https://wa.me/447700900077?text=' + encodedText, '_blank');
    });
  </script>
</body>
</html>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(singleFileHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtmlFile = () => {
    const blob = new Blob([singleFileHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Floating Exporter Panel Button */}
      <div id="html-exporter-button" className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4.5 py-3.5 rounded-full bg-brand-red text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(255,0,43,0.4)] hover:shadow-[0_0_30px_rgba(255,0,43,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer border border-brand-red-light/20"
        >
          <FileCode className="w-5 h-5 group-hover:rotate-6 transition-transform" />
          <span>Get Single-File HTML</span>
        </button>
      </div>

      {/* Export Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-55 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-bg-dark border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-bg-card/50">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red font-bold text-lg">ARC</span>
                <div>
                  <h3 className="font-display font-extrabold text-xl text-white uppercase tracking-tight">Export Code Package</h3>
                  <p className="text-xs text-gray-400">Single-file static build with integrated CDN assets</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-5 rounded-2xl border border-white/5 md:col-span-1 space-y-4">
                  <h4 className="font-display font-bold text-sm tracking-wider text-brand-red uppercase">File Details</h4>
                  <ul className="space-y-3 text-xs text-gray-300 font-mono">
                    <li className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-gray-500">Name:</span>
                      <span className="text-white">index.html</span>
                    </li>
                    <li className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-gray-500">CSS:</span>
                      <span className="text-white">Tailwind v3/v4 CDN</span>
                    </li>
                    <li className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-gray-500">Icons:</span>
                      <span className="text-white">FontAwesome 6.4</span>
                    </li>
                    <li className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-gray-500">JS:</span>
                      <span className="text-white">Embedded Vanilla</span>
                    </li>
                    <li className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-gray-500">Responsive:</span>
                      <span className="text-white">Yes (Mobile/Desktop)</span>
                    </li>
                  </ul>
                  <div className="bg-brand-red/5 border border-brand-red/10 p-4 rounded-xl text-xs text-gray-300 leading-relaxed space-y-2">
                    <p className="font-semibold text-white flex items-center gap-1.5"><Check className="w-4 h-4 text-brand-red" /> Ready to Deploy</p>
                    <p>Simply save this file to any hosting (Netlify, Vercel, GitHub Pages, or Hostinger) and your agency landing page is fully live!</p>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4 flex flex-col h-full">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-sm tracking-wider text-white uppercase">Preview & Control</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-brand-red/10"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                      <button
                        onClick={downloadHtmlFile}
                        className="px-4 py-2 rounded-xl border border-white/10 hover:border-brand-red/30 hover:bg-white/5 text-white text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .html</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 bg-bg-darker border border-white/5 rounded-2xl p-4 overflow-hidden relative group h-72">
                    <pre className="text-xs text-gray-400 font-mono h-full overflow-y-auto overflow-x-auto select-all pr-2 scrollbar-thin">
                      <code>{singleFileHtml}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-bg-card/30 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5 text-brand-red" /> Fulfills requirements exactly for "index.html" deployment</span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Back to Live View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
