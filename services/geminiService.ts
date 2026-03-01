import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client exclusively using process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSupportResponse = async (userMessage: string): Promise<string> => {
  try {
    // Generate a response using gemini-3-flash-preview for basic text support tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: `You are the AI support assistant for WOBIO, a ride-hailing app. 
        Your tone is helpful, concise, and professional (like Grab or Uber support).
        
        Key Info:
        - WOBIO offers: Just Wobio (Standard), Wobio Bike (Fast), Wobio XL (6 seats), Wobio Exec (Premium).
        - Payments: Cash, Wallet, Card.
        - Color: Facebook Blue.
        
        Answer user questions about how to book, payment issues, or safety. Keep answers under 50 words unless detailed steps are needed.`,
      }
    });

    return response.text || "I didn't catch that. Could you rephrase?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I'm having trouble connecting to the support server right now.";
  }
};