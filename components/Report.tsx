import React, { useEffect, useState } from 'react';
import { InterviewSession, InterviewRound } from '../types';
import { generateFinalReport } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Button from './Button';
import { CheckCircle, AlertTriangle, Download, RefreshCw } from 'lucide-react';

interface ReportProps {
  session: InterviewSession;
  onRestart: () => void;
}

const Report: React.FC<ReportProps> = ({ session, onRestart }) => {
  const [summary, setSummary] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
        const result = await generateFinalReport(session.rounds);
        setSummary(result);
    };
    fetchSummary();
  }, [session]);

  // Flatten data for the chart - averaging scores across rounds
  const categories = ['Confidence', 'Clarity', 'Technical', 'Relevance'];
  const chartData = categories.map(cat => {
    const total = session.rounds.reduce((acc, round) => {
        const point = round.analysis.find(p => p.category === cat);
        return acc + (point ? point.score : 0);
    }, 0);
    return {
        name: cat,
        score: Math.round(total / session.rounds.length)
    };
  });

  const getScoreColor = (score: number) => {
      if (score >= 80) return '#4ade80'; // green
      if (score >= 60) return '#facc15'; // yellow
      return '#f87171'; // red
  };

  const averageScore = Math.round(chartData.reduce((acc, cur) => acc + cur.score, 0) / 4);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold text-white">Interview Analysis</h2>
        <p className="text-slate-400">Target Role: {session.config.jobRole} ({session.config.experienceLevel})</p>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Overall Score */}
         <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
            <h3 className="text-slate-400 text-sm uppercase font-semibold mb-2">Hireability Score</h3>
            <div className="text-6xl font-black text-white mb-2">{averageScore}%</div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${averageScore > 75 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {averageScore > 75 ? 'STRONG CANDIDATE' : 'NEEDS IMPROVEMENT'}
            </div>
         </div>

         {/* Chart */}
         <div className="md:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700 h-64">
            <h3 className="text-slate-400 text-sm uppercase font-semibold mb-4">Performance Metrics</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                        contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: 'white'}} 
                        cursor={{fill: 'transparent'}}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
         <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-indigo-400 mr-2" /> 
            Executive Summary
         </h3>
         <p className="text-slate-300 leading-relaxed">
            {summary || "Generating comprehensive report..."}
         </p>
      </div>

      {/* Question Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Question Breakdown</h3>
        {session.rounds.map((round, idx) => (
            <div key={idx} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="text-indigo-300 font-medium text-sm uppercase">Question {idx + 1}</h4>
                    <span className="text-slate-500 text-xs">{session.config.focusArea}</span>
                </div>
                <p className="text-white font-medium text-lg mb-3">"{round.question}"</p>
                <div className="bg-slate-900/50 p-4 rounded-lg mb-4">
                    <p className="text-slate-400 text-sm italic">" {round.userAnswer} "</p>
                </div>
                
                <div className="flex items-start gap-3 bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-yellow-200 text-sm font-bold mb-1">AI Suggestion</p>
                        <p className="text-yellow-100/80 text-sm">{round.suggestion}</p>
                    </div>
                </div>
            </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 pt-8 pb-12">
        <Button onClick={onRestart} variant="secondary">
            <RefreshCw className="w-4 h-4 mr-2" /> Start New Session
        </Button>
        <Button onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" /> Save PDF Report
        </Button>
      </div>

    </div>
  );
};

export default Report;