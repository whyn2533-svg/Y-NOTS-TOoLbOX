
import { GoogleGenAI, Type } from "@google/genai";
import { LogEntry, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeNFCLogs(logs: LogEntry[]): Promise<AnalysisResult> {
  const logContext = logs.map(l => `[${new Date(l.timestamp).toISOString()}] ${l.level}: ${l.message}`).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following NFC transaction logs for security vulnerabilities like PIN bypass, transaction forcing, or relay attacks. 
    Logs:
    ${logContext}`,
    config: {
      systemInstruction: "You are a world-class Cybersecurity Researcher specializing in EMV and NFC security. Return a detailed JSON analysis of the provided logs.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vulnerabilityScore: { type: Type.NUMBER, description: "A score from 0-100 indicating risk." },
          threatType: { type: Type.STRING, description: "Primary classification of the threat detected." },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable defense strategies." },
          summary: { type: Type.STRING, description: "Brief executive summary of findings." }
        },
        required: ["vulnerabilityScore", "threatType", "recommendations", "summary"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}') as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return {
      vulnerabilityScore: 0,
      threatType: "Analysis Failed",
      recommendations: ["Ensure API connectivity", "Check log formatting"],
      summary: "Could not generate analysis at this time."
    };
  }
}

export async function generateDefensiveCode(vulnerability: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Write a clean, documented defensive implementation (e.g., in a secure micro-service language like Rust or C++) to prevent the following vulnerability: ${vulnerability}. 
    Explain the security principle used (e.g., Cryptographic Authentication, Message Authentication Codes).`,
  });

  return response.text || "No code generated.";
}
