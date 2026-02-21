import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { MonitorPlay, Users, CheckCircle, ArrowRight, Zap, Briefcase, Trophy, Globe } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-56">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-400 text-xs font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary-400 mr-2 animate-pulse"></span>
            The #1 Marketplace for Video Editors
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-8">
            EDIVIC – The Future of <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-sky-400 to-blue-500 neon-text">
              Video Editing Marketplace
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-400 mb-12 leading-relaxed">
            Connect with professional video editors or find clients instantly. 
            Manage projects, collaborate, and get cinematic videos fast.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/signup-client" className="group">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                Get Started as Client
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/signup-editor">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                Join as Video Editor
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Abstract Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
           <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
           <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose EDIVIC?</h2>
            <p className="text-slate-400">Tailored features for both Creators and Editors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* For Clients */}
            <div className="glass p-8 rounded-3xl border border-primary-500/20 hover:border-primary-500/40 transition-colors">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary-500/20 rounded-xl">
                        <Users className="h-8 w-8 text-primary-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">For Clients</h3>
                </div>
                <ul className="space-y-6">
                    {[
                        "Hire verified video editors",
                        "Post projects in minutes",
                        "Track project progress easily",
                        "Manage multiple video projects in one dashboard"
                    ].map((feature, i) => (
                        <li key={i} className="flex items-start text-slate-300">
                            <CheckCircle className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" />
                            <span className="text-lg">{feature}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-10">
                    <Link to="/signup-client">
                        <Button fullWidth variant="outline">Hire Editors Now</Button>
                    </Link>
                </div>
            </div>

            {/* For Editors */}
            <div className="glass p-8 rounded-3xl border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                        <MonitorPlay className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">For Video Editors</h3>
                </div>
                <ul className="space-y-6">
                    {[
                        "Get high-quality clients",
                        "Accept projects instantly",
                        "Build your professional portfolio",
                        "Earn from your editing skills"
                    ].map((feature, i) => (
                        <li key={i} className="flex items-start text-slate-300">
                            <CheckCircle className="h-6 w-6 text-purple-500 mr-3 flex-shrink-0" />
                            <span className="text-lg">{feature}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-10">
                    <Link to="/signup-editor">
                        <Button fullWidth variant="primary" className="bg-gradient-to-r from-purple-500 to-indigo-600 border-none">Start Earning</Button>
                    </Link>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface to-primary-900/20"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to transform your content?</h2>
          <p className="text-xl text-slate-400 mb-10">
            Join thousands of creators and editors building the future of digital media.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link to="/signup-client">
                <Button size="lg" className="w-full sm:w-auto">Get Started as Client</Button>
             </Link>
             <Link to="/signup-editor">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">Join as Video Editor</Button>
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;