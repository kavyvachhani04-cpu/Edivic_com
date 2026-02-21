import React from 'react';
import { Globe, Trophy, Zap } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black pt-20 pb-24 selection:bg-gold selection:text-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-300 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-gold mr-3"></span>
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 font-display">
            About <span className="text-gold">EDIVIC</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-light">
            A next-generation SaaS marketplace platform designed to connect video editors with clients worldwide.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="glass p-8 md:p-12 rounded-2xl border border-white/10 mb-12 relative overflow-hidden group hover:border-gold/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            
            <h2 className="text-2xl font-bold text-white mb-6 font-display relative z-10">Who We Are</h2>
            <div className="space-y-6 text-slate-300 text-lg leading-relaxed font-light relative z-10">
                <p>
                    EDIVIC is on a mission to simplify the video editing workflow and create opportunities for creators and businesses.
                </p>
                <p>
                    We believe video content is the future of digital communication, and finding skilled editors should be fast, simple, and secure. EDIVIC provides a professional dashboard for clients to manage projects and for editors to showcase their skills and grow their careers.
                </p>
                <p>
                    Our platform focuses on speed, reliability, and a modern user experience so both clients and editors can work efficiently without technical complexity.
                </p>
            </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-gold/50 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Globe className="h-24 w-24 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-gold mb-4 flex items-center font-display">
                    <Zap className="h-5 w-5 mr-2" /> Our Vision
                </h3>
                <p className="text-white text-lg font-light">
                    To become the leading global marketplace for video editing services.
                </p>
            </div>

            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-gold/50 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trophy className="h-24 w-24 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-gold mb-4 flex items-center font-display">
                    <Trophy className="h-5 w-5 mr-2" /> Our Mission
                </h3>
                <p className="text-white text-lg font-light">
                    To empower creators and businesses with easy access to professional video editing solutions.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;