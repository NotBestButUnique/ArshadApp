import React, { useEffect, useState } from 'react';
import { Check, Sparkles, Zap, Layout, ArrowRight } from 'lucide-react';

interface IntroProps {
  onComplete: () => void;
}

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const sequence = [
      setTimeout(() => setStage(1), 100),   // Init
      setTimeout(() => setStage(2), 1000),  // Icon expansion
      setTimeout(() => setStage(3), 2000),  // Text reveal
      setTimeout(() => setStage(4), 3500),  // Button reveal
    ];

    return () => sequence.forEach(clearTimeout);
  }, []);

  const handleStart = () => {
    setStage(5); // Exit animation
    setTimeout(onComplete, 800);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-all duration-700 ${stage === 5 ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900/80"></div>
        
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-4">
        
        {/* Logo Mark Animation */}
        <div className={`relative mb-12 transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) ${
          stage >= 2 ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-20'
        }`}>
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-[0_0_80px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full skew-y-12 group-hover:translate-y-[-150%] transition-transform duration-700"></div>
            <Layout size={64} className="text-white relative z-10" strokeWidth={1.5} />
            
            {/* Floating particles */}
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-slate-900 p-2 rounded-full shadow-lg animate-bounce">
              <Sparkles size={16} fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-6">
          <h1 className={`text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight transition-all duration-1000 ${
            stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            Organize Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Regulatory Life
            </span>
          </h1>

          <p className={`text-lg md:text-xl text-slate-400 max-w-xl mx-auto font-light transition-all duration-1000 delay-200 ${
            stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            The ultimate workspace for GST, Income Tax, and Compliance management. 
            Assign, track, and automate with precision.
          </p>
        </div>

        {/* Action Button */}
        <div className={`mt-16 transition-all duration-700 delay-500 ${
          stage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <button 
            onClick={handleStart}
            className="group relative px-10 py-4 bg-white text-slate-900 rounded-full font-bold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-3"
          >
            <span>Get Started</span>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight size={16} />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Intro;