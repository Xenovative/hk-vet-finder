import { NextResponse } from "next/server";
import { findRecommendedVets } from "@/lib/ai/recommendation";
import { extractIntent, getAICompletion } from "@/lib/ai/service";

export async function POST(req: Request) {
  try {
    const { message, petType, language } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Try to extract intent using LLM (OpenAI or Gemini)
    const intent = await extractIntent(message, language);
    
    // 2. Use extracted intent or fallback to raw message for recommendations
    const searchDistrict = intent?.district || "";
    const searchSymptoms = intent?.symptoms || "";
    const contextualQuery = intent 
      ? `${searchSymptoms} ${searchDistrict} ${intent.petType || petType || ''}`
      : `${message} ${petType || ''}`;
    
    const recommendations = findRecommendedVets(contextualQuery);

    // 3. Generate a conversational response
    let responseText = "";
    const hasKeys = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    if (hasKeys) {
      const systemPrompt = `
        You are a highly professional Hong Kong veterinary assistant. 
        A user has asked: "${message}". 
        We found ${recommendations.length} veterinarian matches in our database.

        Your goal is to provide:
        1. A brief, empathetic acknowledgment of the situation.
        2. **Basic Assessment**: Based on the symptoms described, provide a preliminary medical assessment. 
           (CRITICAL: Always include a disclaimer that you are an AI assistant and this is not a substitute for professional veterinary advice).
        3. **Immediate Actions**: List 2-3 specific steps the user can do right now to help their pet (e.g., "Keep them hydrated", "Restrict movement", "Check their gums").
        4. **Professional Guidance**: Explain why the recommended vets below are a good fit for this specific situation.
        5. **Emergency Status**: If the symptoms sound life-threatening, use a bold "URGENT" tag and tell them to call an emergency clinic immediately.

        Respond in ${language === 'tc' ? 'Traditional Chinese' : 'English'}. Keep the tone calm, professional, and helpful.
      `;
      
      const provider = process.env.OPENAI_API_KEY ? "openai" : "gemini";
      responseText = await getAICompletion(message, systemPrompt, provider as any) || "";
    } else {
      // Fallback response if no API keys
      if (language === 'tc') {
        responseText = recommendations.length > 0 
          ? `根據您的描述，我為您找到了 ${recommendations.length} 位獸醫。以下是為您的${petType === 'dog' ? '狗狗' : petType === 'cat' ? '貓貓' : '寵物'}推薦的結果：`
          : "我目前無法識別具體需求，您可以嘗試描述症狀或地區。";
      } else {
        responseText = recommendations.length > 0
          ? `Based on your description, I found ${recommendations.length} vets. Here are the recommendations for your ${petType || 'pet'}:`
          : "I couldn't identify specific needs. Try describing symptoms or a district.";
      }
    }

    return NextResponse.json({
      text: responseText,
      recommendations,
      intent // Optional: return for debugging/UI feedback
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
