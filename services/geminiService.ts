import { GoogleGenAI, Type } from "@google/genai";
import { InterviewConfig, AnalysisPoint } from '../types';

// Ensure API Key is available
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelName = 'gemini-2.5-flash';

// Schemas for structured output
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, enum: ['Confidence', 'Clarity', 'Technical', 'Relevance'] },
          score: { type: Type.NUMBER, description: "Score out of 100" },
          feedback: { type: Type.STRING }
        }
      }
    },
    suggestion: { type: Type.STRING, description: "A tip to improve the answer" },
    nextQuestion: { type: Type.STRING, description: "The next interview question to ask" },
    interviewComplete: { type: Type.BOOLEAN, description: "True if 3 questions have been asked" }
  },
  required: ['analysis', 'suggestion', 'nextQuestion', 'interviewComplete']
};

export const generateFirstQuestion = async (config: InterviewConfig): Promise<string> => {
  if (!apiKey) return "Please configure your API Key.";

  const prompt = `
    You are an expert interviewer for a ${config.experienceLevel} ${config.jobRole} position.
    The focus of this interview is ${config.focusArea}.
    Generate a challenging but appropriate opening interview question.
    Just return the question text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    return response.text || "Tell me about yourself.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Tell me about yourself.";
  }
};

export const analyzeAnswerAndGetNext = async (
  config: InterviewConfig,
  currentQuestion: string,
  userAnswer: string,
  questionCount: number,
  snapshotBase64?: string
): Promise<{ analysis: AnalysisPoint[], suggestion: string, nextQuestion: string, interviewComplete: boolean }> => {
  
  if (!apiKey) throw new Error("API Key missing");

  const parts: any[] = [];
  
  // Add visual context if available (simulating body language analysis)
  if (snapshotBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: snapshotBase64.split(',')[1] // Remove data:image/jpeg;base64, prefix
      }
    });
  }

  const promptText = `
    Role: Interviewer for ${config.experienceLevel} ${config.jobRole}.
    Context: Question #${questionCount}.
    Current Question: "${currentQuestion}"
    Candidate Answer: "${userAnswer}"
    
    Task:
    1. Analyze the answer for technical accuracy and relevance.
    2. If an image is provided, analyze the candidate's body language (eye contact, posture) for the 'Confidence' score. If no image, infer from tone/hesitation markers in text.
    3. Provide scores (0-100) and feedback for: Confidence, Clarity, Technical, Relevance.
    4. Provide a specific suggestion for improvement.
    5. Generate the NEXT question. If we have reached 3 questions, set interviewComplete to true and make the nextQuestion a closing remark.
    
    Respond in JSON.
  `;

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      analysis: [],
      suggestion: "Error analyzing response.",
      nextQuestion: "Let's move on. What are your strengths?",
      interviewComplete: false
    };
  }
};

export const generateFinalReport = async (history: any[]): Promise<string> => {
    if (!apiKey) return "API Key missing";
    
    const prompt = `
        Review this interview history: ${JSON.stringify(history)}.
        Write a concise, encouraging, but critical summary of the candidate's performance.
        Highlight 2 major strengths and 2 areas for improvement.
        Keep it under 200 words.
    `;
    
    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt
    });
    
    return response.text || "Analysis unavailable.";
}
