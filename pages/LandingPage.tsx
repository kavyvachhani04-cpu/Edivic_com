import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { MonitorPlay, Users, CheckCircle, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-black overflow-hidden min-h-screen font-sans selection:bg-gold selection:text-black">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 lg:pt-48 lg:pb-64 overflow-hidden gold-dust-bg flex items-center justify-center">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-300 text-sm font-medium mb-10">
            <span className="flex h-2 w-2 rounded-full bg-gold mr-3"></span>
            #1 Marketplace for Video Editors
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 leading-[1.1]">
            EDIVIC – The Future of <br />
            <span className="text-gold-gradient">
              Video Editing Marketplace
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto font-light">
            Connect with professional video editors or find clients instantly. 
            Manage projects, collaborate, and get cinematic.
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/signup-client">
              <button className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 rounded font-semibold flex items-center justify-center gap-2 group">
                Get Started as Client
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/signup-editor">
              <button className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 rounded font-semibold">
                Join as Video Editor
              </button>
            </Link>
          </div>
        </div>
        
        {/* Bottom Gold Glow/Horizon Effect */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-gold/10 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-gold to-transparent blur-sm"></div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-black border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Professional Editors", value: "1,000+" },
              { label: "Happy Clients", value: "500+" },
              { label: "Projects Completed", value: "10,000+" },
              { label: "Support Available", value: "24/7" }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-xl text-center hover:border-gold/30 transition-colors">
                <div className="text-3xl md:text-4xl font-bold text-gold mb-2 font-display">{stat.value}</div>
                <div className="text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4 font-display">Our Services</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: "YouTube Video Editing", 
                desc: "Professional long-form YouTube editing with effects & subtitles." 
              },
              { 
                title: "Instagram Reels Editing", 
                desc: "High quality viral reels editing for creators & brands." 
              },
              { 
                title: "Corporate Video Editing", 
                desc: "Business promo, presentations & company videos." 
              },
              { 
                title: "Ads & Commercial Editing", 
                desc: "Facebook, YouTube & Instagram ad video production." 
              }
            ].map((service, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                <h3 className="text-xl font-bold text-gold mb-4 group-hover:text-white transition-colors">{service.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How EDIVIC Works Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4 font-display">How EDIVIC Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                step: "1️⃣", 
                title: "Post Your Project", 
                desc: "Tell us what video you want to edit and your budget." 
              },
              { 
                step: "2️⃣", 
                title: "Editor Starts Editing", 
                desc: "Professional editors work on your video with high quality." 
              },
              { 
                step: "3️⃣", 
                title: "Pay Securely & Download", 
                desc: "Pay after approval and download your final edited video." 
              }
            ].map((item, i) => (
              <div key={i} className="bg-black p-10 rounded-2xl border border-gold/20 text-center hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-300">
                <div className="text-4xl mb-6">{item.step}</div>
                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[#022c22] relative"> {/* Dark Green background from image */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4 font-display">What Our Clients Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                quote: "EDIVIC helped me find amazing editors for my YouTube channel.", 
                author: "- YouTube Creator" 
              },
              { 
                quote: "Fast delivery and professional quality. Highly recommended!", 
                author: "- Business Owner" 
              },
              { 
                quote: "Great platform for editors to earn money from home.", 
                author: "- Professional Editor" 
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-black/40 p-8 rounded-xl border border-gold/10 text-center backdrop-blur-sm">
                <p className="text-white text-lg italic mb-6">"{testimonial.quote}"</p>
                <p className="text-gold font-bold">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface relative overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">Why Choose EDIVIC?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Tailored features for both Creators and Editors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* For Clients */}
            <div className="glass p-8 rounded-xl border border-white/5 hover:border-gold/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 group-hover:border-gold/50 transition-colors">
                        <Users className="h-8 w-8 text-gold" />
                    </div>
                    <h3 className="text-2xl font-bold text-white font-display">For Clients</h3>
                </div>
                <ul className="space-y-6">
                    {[
                        "Hire verified video editors",
                        "Post projects in minutes",
                        "Track project progress easily",
                        "Manage multiple video projects"
                    ].map((feature, i) => (
                        <li key={i} className="flex items-start text-slate-300">
                            <CheckCircle className="h-6 w-6 text-gold mr-3 flex-shrink-0" />
                            <span className="text-lg font-light">{feature}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-10">
                    <Link to="/signup-client">
                        <Button fullWidth variant="outline" className="border-white/20 hover:border-gold hover:text-gold text-slate-300">Hire Editors Now</Button>
                    </Link>
                </div>
            </div>

            {/* For Editors */}
            <div className="glass p-8 rounded-xl border border-white/5 hover:border-gold/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 group-hover:border-gold/50 transition-colors">
                        <MonitorPlay className="h-8 w-8 text-gold" />
                    </div>
                    <h3 className="text-2xl font-bold text-white font-display">For Video Editors</h3>
                </div>
                <ul className="space-y-6">
                    {[
                        "Get high-quality clients",
                        "Accept projects instantly",
                        "Build your professional portfolio",
                        "Earn from your editing skills"
                    ].map((feature, i) => (
                        <li key={i} className="flex items-start text-slate-300">
                            <CheckCircle className="h-6 w-6 text-gold mr-3 flex-shrink-0" />
                            <span className="text-lg font-light">{feature}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-10">
                    <Link to="/signup-editor">
                        <Button fullWidth variant="primary" className="bg-gold hover:bg-gold-dark text-black border-none font-bold">Start Earning</Button>
                    </Link>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;