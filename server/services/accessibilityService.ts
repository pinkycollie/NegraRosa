import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AccessibilityService {
  // Generate security feature explanation in audio format
  async generateSecurityGuidance(feature: string, isDeaf: boolean = false): Promise<{ text: string, audioUrl?: string }> {
    try {
      // First, generate the text explanation using GPT-4o
      const prompt = isDeaf 
        ? `Create a clear, visual explanation of the "${feature}" security feature for deaf users. Focus on simplified language and visual metaphors. Limit to 3-4 short sentences.`
        : `Explain the "${feature}" security feature in simple, everyday language. Limit to 3-4 short sentences.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "system", content: "You are an accessibility-focused security expert who explains complex security concepts in simple terms." },
                  { role: "user", content: prompt }],
        max_tokens: 150,
      });

      const explanationText = response.choices[0].message.content || "No explanation available.";
      
      // If the user isn't deaf, generate audio guidance
      if (!isDeaf) {
        // Generate speech from text
        const speechResponse = await openai.audio.speech.create({
          model: "tts-1",
          voice: "alloy", // A neutral voice, can be changed to "echo", "fable", "onyx", "nova", or "shimmer"
          input: explanationText,
        });

        // Convert the speech response to a base64 string
        const audioBuffer = await speechResponse.arrayBuffer();
        const audioBase64 = Buffer.from(audioBuffer).toString('base64');
        
        // Return the audio data as a data URL
        const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
        return { text: explanationText, audioUrl };
      }

      // For deaf users, just return the text explanation
      return { text: explanationText };
    } catch (error) {
      console.error("Error generating security guidance:", error);
      return { text: `Unable to generate guidance for ${feature}. Please try again later.` };
    }
  }

  // Get visual guidance steps for a security feature
  async getVisualGuidanceSteps(feature: string): Promise<{ step: string, visualDescription: string }[]> {
    try {
      const prompt = `Create a step-by-step visual guide for using the "${feature}" security feature. For each step, provide a clear visual description of what the user should see or do. Return the response as a JSON array with 'step' and 'visualDescription' properties. Limit to 3-5 steps total.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a security UX expert who creates visual guidance for security features." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      const content = response.choices[0].message.content || '{"steps":[]}';
      const parsedResponse = JSON.parse(content);
      
      return Array.isArray(parsedResponse.steps) ? parsedResponse.steps : [];
    } catch (error) {
      console.error("Error generating visual guidance steps:", error);
      return [{ step: "Error", visualDescription: "Unable to generate visual guidance. Please try again later." }];
    }
  }
}

// Export singleton instance
export const accessibilityService = new AccessibilityService();