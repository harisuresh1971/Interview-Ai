import React from 'react';
import Button from './Button';
import { Camera, Brain, Trophy, ChevronRight, Video, Target, BarChart3 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center py-6 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Video className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">MockMate</span>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition">Features</a>
            <a href="#" className="hover:text-white transition">Pricing</a>
            <a href="#" className="hover:text-white transition">About</a>
        </div>
        <Button onClick={onStart} size="sm" variant="ghost" className="border border-slate-700">Login</Button>
      </nav>

      {/* Hero */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 pt-12 pb-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Now Powered by Gemini 2.5
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 mb-6 leading-tight">
          Master your interview <br/> before you walk in.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
            The world's first AI interviewer that analyzes your <span className="text-white font-medium">answers</span>, <span className="text-white font-medium">speech patterns</span>, and <span className="text-white font-medium">body language</span> in real-time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button onClick={onStart} size="lg" className="group text-lg px-8">
                Start Mock Interview 
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="secondary" size="lg" className="text-lg">
                View Sample Report
            </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
                <div className="w-12 h-12 bg-indigo-900/50 rounded-xl flex items-center justify-center mb-4 text-indigo-400">
                    <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Role-Specific</h3>
                <p className="text-slate-400 leading-relaxed">Configurable personas. From "Senior React Dev" to "Product Manager", get asked the questions that actually matter.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
                <div className="w-12 h-12 bg-purple-900/50 rounded-xl flex items-center justify-center mb-4 text-purple-400">
                    <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Multimodal Analysis</h3>
                <p className="text-slate-400 leading-relaxed">We don't just read your text. We analyze your pacing, eye contact, and confidence levels using video AI.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
                <div className="w-12 h-12 bg-emerald-900/50 rounded-xl flex items-center justify-center mb-4 text-emerald-400">
                    <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Instant Feedback</h3>
                <p className="text-slate-400 leading-relaxed">Get a detailed "Hireability Score" report immediately after your session with actionable improvement tips.</p>
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-600 text-sm border-t border-slate-800">
        © 2024 MockMate AI. Built with Gemini API.
      </footer>
    </div>
  );
};

export default LandingPage;