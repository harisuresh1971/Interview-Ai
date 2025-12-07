import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InterviewConfig, InterviewRound } from '../types';
import { generateFirstQuestion, analyzeAnswerAndGetNext } from '../services/geminiService';
import Button from './Button';
import { Mic, MicOff, Camera, Video, VideoOff, Play, Send } from 'lucide-react';

interface LiveSessionProps {
  config: InterviewConfig;
  onComplete: (rounds: InterviewRound[]) => void;
}

const LiveSession: React.FC<LiveSessionProps> = ({ config, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState<string>('Initializing AI...');
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rounds, setRounds] = useState<InterviewRound[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Media (Camera)
  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setPermissionGranted(true);
        
        // Start first question after media is ready
        const q1 = await generateFirstQuestion(config);
        setCurrentQuestion(q1);
        speakText(q1);

      } catch (err) {
        console.error("Error accessing media:", err);
        alert("Camera/Mic permission denied. Please enable them.");
      }
    };
    startMedia();

    // Cleanup tracks on unmount
    return () => {
       if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
       }
    };
  }, [config]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setTranscript(prev => prev + ' ' + finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
          console.error("Speech error", event.error);
          setIsListening(false);
      };
    } else {
      alert("Browser not supported for Speech Recognition. Please use Chrome.");
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript(''); // Clear previous for new answer
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const captureFrame = useCallback((): string | undefined => {
      if (videoRef.current && canvasRef.current) {
          const context = canvasRef.current.getContext('2d');
          if (context) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              context.drawImage(videoRef.current, 0, 0);
              return canvasRef.current.toDataURL('image/jpeg', 0.8);
          }
      }
      return undefined;
  }, []);

  const handleSubmitAnswer = async () => {
    if (isListening) toggleListening();
    if (!transcript.trim()) {
        alert("Please say something first!");
        return;
    }

    setIsProcessing(true);
    const snapshot = captureFrame();

    // Analyze
    try {
        const result = await analyzeAnswerAndGetNext(
            config, 
            currentQuestion, 
            transcript, 
            rounds.length + 1, 
            snapshot
        );

        const newRound: InterviewRound = {
            question: currentQuestion,
            userAnswer: transcript,
            analysis: result.analysis,
            suggestion: result.suggestion
        };

        const updatedRounds = [...rounds, newRound];
        setRounds(updatedRounds);

        if (result.interviewComplete || updatedRounds.length >= 3) {
            onComplete(updatedRounds);
        } else {
            setCurrentQuestion(result.nextQuestion);
            setTranscript('');
            speakText(result.nextQuestion);
        }

    } catch (e) {
        console.error(e);
        alert("Something went wrong with the analysis.");
    } finally {
        setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 gap-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div>
            <h2 className="text-lg font-bold text-white">Question {rounds.length + 1}/3</h2>
            <p className="text-slate-400 text-sm">Role: {config.jobRole}</p>
        </div>
        <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-400 text-xs font-mono uppercase">LIVE RECORDING</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-[400px]">
        {/* Left: Video & AI Avatar Placeholder */}
        <div className="flex flex-col gap-4">
             {/* User Camera */}
             <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-slate-700 aspect-video shadow-2xl">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover transform scale-x-[-1]" 
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full text-xs text-white backdrop-blur-sm">
                    You (Candidate)
                </div>
             </div>
             
             {/* AI Question Box */}
             <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 flex flex-col justify-center min-h-[150px]">
                <p className="text-indigo-200 text-sm uppercase font-semibold mb-2 tracking-wider">Interviewer asks:</p>
                <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">"{currentQuestion}"</p>
                <button onClick={() => speakText(currentQuestion)} className="mt-3 text-indigo-400 hover:text-indigo-300 flex items-center text-sm gap-2">
                    <Play className="w-4 h-4" /> Replay Audio
                </button>
             </div>
        </div>

        {/* Right: Transcript & Controls */}
        <div className="flex flex-col bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Your Answer Transcript</h3>
            </div>
            <div className="flex-grow p-4 overflow-y-auto bg-slate-900/50">
                {transcript ? (
                    <p className="text-lg text-slate-200 leading-relaxed whitespace-pre-wrap">{transcript}</p>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                        <Mic className="w-12 h-12 opacity-20" />
                        <p>Press the microphone to start speaking...</p>
                    </div>
                )}
            </div>
            
            {/* Controls */}
            <div className="p-4 bg-slate-800 border-t border-slate-700 flex flex-col sm:flex-row gap-3">
                <button 
                    onClick={toggleListening}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all ${
                        isListening 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 animate-pulse' 
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                >
                    {isListening ? <><MicOff className="w-5 h-5"/> Stop Speaking</> : <><Mic className="w-5 h-5"/> Start Answer</>}
                </button>

                <Button 
                    onClick={handleSubmitAnswer} 
                    isLoading={isProcessing} 
                    disabled={isListening || transcript.length < 5}
                    className="flex-1"
                >
                    Submit Answer <Send className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSession;