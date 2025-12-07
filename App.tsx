import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Setup from './components/Setup';
import LiveSession from './components/LiveSession';
import Report from './components/Report';
import { AppView, InterviewConfig, InterviewSession, InterviewRound } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [sessionData, setSessionData] = useState<InterviewSession | null>(null);

  // Transition: Landing -> Setup
  const handleStartSetup = () => {
    setView(AppView.SETUP);
  };

  // Transition: Setup -> Interview
  const handleStartInterview = (newConfig: InterviewConfig) => {
    setConfig(newConfig);
    setView(AppView.INTERVIEW);
  };

  // Transition: Interview -> Report
  const handleInterviewComplete = (rounds: InterviewRound[]) => {
    if (!config) return;
    
    // Calculate simple stats locally before the complex report is generated
    const totalScore = rounds.reduce((acc, r) => {
        const roundAvg = r.analysis.reduce((sum, p) => sum + p.score, 0) / (r.analysis.length || 1);
        return acc + roundAvg;
    }, 0);
    
    const overallScore = Math.round(totalScore / rounds.length);

    setSessionData({
        config,
        rounds,
        overallScore,
        summary: '' // Populated inside Report component via API
    });
    setView(AppView.REPORT);
  };

  // Transition: Report -> Setup (Restart)
  const handleRestart = () => {
    setSessionData(null);
    setConfig(null);
    setView(AppView.SETUP);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <div className="relative z-10">
        {view === AppView.LANDING && (
            <LandingPage onStart={handleStartSetup} />
        )}
        
        {view === AppView.SETUP && (
            <Setup onStart={handleStartInterview} />
        )}
        
        {view === AppView.INTERVIEW && config && (
            <LiveSession config={config} onComplete={handleInterviewComplete} />
        )}
        
        {view === AppView.REPORT && sessionData && (
            <Report session={sessionData} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
};

export default App;