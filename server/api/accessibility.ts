import { Router } from 'express';
import OpenAI from "openai";
import { accessibilityService } from '../services/accessibilityService';

const accessibilityRouter = Router();

// Initialize OpenAI client if API key is available
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  console.warn("OPENAI_API_KEY not found, voice guidance features will use fallback responses");
}

// Endpoint to get voice guidance for a specific security feature
accessibilityRouter.get('/guidance/:feature', async (req, res) => {
  try {
    const feature = req.params.feature;
    const isDeaf = req.query.isDeaf === 'true';
    
    // Get guidance text from the accessibility service
    const guidanceResult = await accessibilityService.getGuidanceForFeature(feature, isDeaf);
    
    // If OpenAI is available and user isn't deaf, generate audio
    if (openai && !isDeaf) {
      const audioResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: guidanceResult.text.substring(0, 4000) // TTS has a character limit
      });
      
      // Get the audio as base64
      const buffer = Buffer.from(await audioResponse.arrayBuffer());
      const audioBase64 = buffer.toString('base64');
      
      // Return both text and audio
      res.json({
        ...guidanceResult,
        audioUrl: `data:audio/mp3;base64,${audioBase64}`
      });
    } else {
      // Return only text for deaf users or when OpenAI is unavailable
      res.json(guidanceResult);
    }
  } catch (error) {
    console.error('Error generating guidance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate guidance content',
      error: error.message
    });
  }
});

// Endpoint to get visual guidance steps for a feature
accessibilityRouter.get('/visual-guidance/:feature', async (req, res) => {
  try {
    const feature = req.params.feature;
    
    // Get visual guidance steps from the accessibility service
    const visualSteps = await accessibilityService.getVisualGuidanceSteps(feature);
    
    res.json({
      success: true,
      steps: visualSteps
    });
  } catch (error) {
    console.error('Error generating visual guidance steps:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate visual guidance steps',
      error: error.message
    });
  }
});

// Endpoint to generate a custom guidance explanation
accessibilityRouter.post('/generate-custom-guidance', async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({
        success: false,
        message: 'OpenAI service not available. Custom guidance generation is disabled.'
      });
    }
    
    const { feature, context, isDeaf } = req.body;
    
    if (!feature || !context) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: feature and context'
      });
    }
    
    const customGuidance = await accessibilityService.generateCustomGuidance(
      feature, 
      context, 
      isDeaf || false
    );
    
    res.json({
      success: true,
      guidance: customGuidance
    });
  } catch (error) {
    console.error('Error generating custom guidance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate custom guidance',
      error: error.message
    });
  }
});

export { accessibilityRouter };