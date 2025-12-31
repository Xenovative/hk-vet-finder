import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export type AIProvider = "openai" | "gemini";

export async function getAICompletion(
  prompt: string, 
  systemPrompt: string, 
  provider: AIProvider = "openai"
) {
  if (provider === "openai" && openai) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });
    return response.choices[0].message.content;
  }

  if (provider === "gemini" && genAI) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      { text: `System: ${systemPrompt}\n\nUser: ${prompt}` }
    ]);
    const response = await result.response;
    return response.text();
  }

  throw new Error(`AI Provider ${provider} not configured or unavailable`);
}

export async function extractIntent(message: string, language: 'en' | 'tc') {
  const systemPrompt = `
    You are a veterinary assistant in Hong Kong. Extract the user's intent from their message.
    Return a JSON object with:
    - district: The HK district if mentioned (e.g. "Central", "Shatin", "中環")
    - symptoms: Key medical symptoms or issues (e.g. "vomiting", "bleeding", "嘔吐")
    - petType: The type of pet (e.g. "dog", "cat")
    - isEmergency: boolean, true if it sounds like an emergency
    - language: the language of the request ('en' or 'tc')
    
    User message: "${message}"
  `;

  try {
    const provider: AIProvider = process.env.OPENAI_API_KEY ? "openai" : "gemini";
    const completion = await getAICompletion(message, systemPrompt, provider);
    
    // Clean JSON if LLM adds markdown blocks
    const jsonMatch = completion?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("AI Intent Extraction Error:", error);
    return null;
  }
}
