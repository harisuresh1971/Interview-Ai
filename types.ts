export enum AppView {
  LANDING = 'LANDING',
  SETUP = 'SETUP',
  INTERVIEW = 'INTERVIEW',
  REPORT = 'REPORT'
}

export interface InterviewConfig {
  jobRole: string;
  experienceLevel: string;
  focusArea: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AnalysisPoint {
  category: 'Confidence' | 'Clarity' | 'Technical' | 'Relevance';
  score: number;
  feedback: string;
}

export interface InterviewRound {
  question: string;
  userAnswer: string;
  analysis: AnalysisPoint[];
  suggestion: string;
}

export interface InterviewSession {
  config: InterviewConfig;
  rounds: InterviewRound[];
  overallScore: number;
  summary: string;
}
