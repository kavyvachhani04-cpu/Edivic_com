import React from 'react';
import { Globe, Trophy, Zap } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">About EDIVIC</h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            A next-generation SaaS marketplace platform designed to connect video editors with clients worldwide.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="glass p-8 md:p-12 rounded-3xl border border-white/10 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Who We Are</h2>
            <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
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
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-primary-500/20 relative overflow-hidden group hover:border-primary-500/40 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Globe className="h-24 w-24 text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-primary-400 mb-4 flex items-center">
                    <Zap className="h-5 w-5 mr-2" /> Our Vision
                </h3>
                <p className="text-white text-lg font-medium">
                    To become the leading global marketplace for video editing services.
                </p>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-2xl border border-purple-500/20 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trophy className="h-24 w-24 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center">
                    <Trophy className="h-5 w-5 mr-2" /> Our Mission
                </h3>
                <p className="text-white text-lg font-medium">
                    To empower creators and businesses with easy access to professional video editing solutions.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;