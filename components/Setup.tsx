import React, { useState } from 'react';
import { InterviewConfig } from '../types';
import Button from './Button';
import { Briefcase, Code, Terminal, Zap } from 'lucide-react';

interface SetupProps {
  onStart: (config: InterviewConfig) => void;
}

const Setup: React.FC<SetupProps> = ({ onStart }) => {
  const [role, setRole] = useState('Frontend Engineer');
  const [level, setLevel] = useState('Mid-Level');
  const [focus, setFocus] = useState('Technical Skills');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    setIsLoading(true);
    // Simulate short loading for UX
    setTimeout(() => {
        onStart({ jobRole: role, experienceLevel: level, focusArea: focus });
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-xl mb-4">
            <Briefcase className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Configure Your Interview</h2>
        <p className="text-slate-400">Customize the AI persona to match your target job description.</p>
      </div>

      <div className="w-full space-y-6 bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Target Role</label>
          <div className="grid grid-cols-2 gap-3">
             {['Frontend Engineer', 'Product Manager', 'Data Scientist', 'Sales Rep'].map((r) => (
                 <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        role === r 
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' 
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                 >
                    {r}
                 </button>
             ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Experience Level</label>
          <div className="flex space-x-4">
             {['Junior', 'Mid-Level', 'Senior', 'Staff'].map((l) => (
                 <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                        level === l 
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' 
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                 >
                    {l}
                 </button>
             ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Focus Area</label>
          <select 
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option>Technical Skills</option>
            <option>Behavioral (STAR Method)</option>
            <option>System Design</option>
            <option>Culture Fit</option>
          </select>
        </div>

        <div className="pt-4">
            <Button onClick={handleStart} isLoading={isLoading} size="lg" className="w-full">
                Start Interview Session <Zap className="ml-2 w-4 h-4" />
            </Button>
            <p className="text-xs text-center text-slate-500 mt-3">
                MockMate requires camera and microphone permissions.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Setup;