import { Router } from 'express';
import { accessibilityService } from '../services/accessibilityService';

const router = Router();

// Endpoint to get security feature guidance (text and optional audio)
router.get('/guidance/:feature', async (req, res) => {
  try {
    const { feature } = req.params;
    const { isDeaf } = req.query;
    
    const isDeafUser = isDeaf === 'true';
    const guidance = await accessibilityService.generateSecurityGuidance(feature, isDeafUser);
    
    res.json(guidance);
  } catch (error) {
    console.error('Error generating security guidance:', error);
    res.status(500).json({ error: 'Failed to generate security guidance' });
  }
});

// Endpoint to get visual guidance steps for a security feature
router.get('/visual-guidance/:feature', async (req, res) => {
  try {
    const { feature } = req.params;
    
    const steps = await accessibilityService.getVisualGuidanceSteps(feature);
    
    res.json({ steps });
  } catch (error) {
    console.error('Error generating visual guidance steps:', error);
    res.status(500).json({ error: 'Failed to generate visual guidance steps' });
  }
});

export default router;