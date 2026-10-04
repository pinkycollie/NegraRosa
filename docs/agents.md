# MBTQ Ecosystem AI Agents

## Overview

The MBTQ ecosystem uses pathway-based AI agents called "Magicians" to provide specialized assistance for different user journeys. Each magician is optimized for Deaf and hard-of-hearing users with visual-first responses.

## Pathway Magicians

### 🧑‍💼 Job Magician
**Pathway:** JOB  
**Provider:** OpenAI GPT-4-Turbo  
**Max GENERATIVE UNITS:** 1,000/month

**Capabilities:**
- Resume review and optimization
- Interview preparation (video relay, in-person accommodations)
- Job search strategies
- Workplace accommodation advice
- Career path guidance

**System Prompt Context:**
- Focuses on accessibility in workplace
- Provides accommodation request templates
- Avoids audio-only job suggestions
- Includes VRS/VRI interview tips

**Example Usage:**
```typescript
const response = await aiProxyService.createRequest(
  userId,
  'JOB',
  'Help me prepare for a video interview with accommodation needs'
);
```

---

### 💼 Business Magician
**Pathway:** BUSINESS  
**Provider:** OpenAI GPT-4-Turbo  
**Max GENERATIVE UNITS:** 2,000/month

**Capabilities:**
- Business automation strategies
- Client management templates
- Taskade workflow integration
- Proposal and contract drafting
- Marketing for Deaf-owned businesses

**Integration Points:**
- Taskade API for workflow automation
- Visual communication templates
- Client-facing documentation

**Example Usage:**
```typescript
const response = await aiProxyService.createRequest(
  userId,
  'BUSINESS',
  'Create a Taskade workflow for client onboarding with visual checkpoints'
);
```

---

### 👨‍💻 Developer Magician
**Pathway:** DEVELOPER  
**Provider:** Anthropic Claude 3 Sonnet  
**Max GENERATIVE UNITS:** 5,000/month

**Capabilities:**
- Code generation and review
- Visual debugging assistance
- Architecture design
- SDK integration (OpenAI, Vertex AI, AI SDK)
- Accessibility audit for code

**SDK Integration:**
```typescript
// OpenAI SDK
import OpenAI from 'openai';

// Vercel AI SDK
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Google Vertex AI
import { VertexAI } from '@google-cloud/vertexai';
```

**Example Usage:**
```typescript
const response = await aiProxyService.createRequest(
  userId,
  'DEVELOPER',
  'Generate an accessible React component with ARIA labels'
);
```

---

### 🎨 Creative Magician
**Pathway:** CREATIVE  
**Provider:** OpenAI GPT-4-Turbo  
**Max GENERATIVE UNITS:** 3,000/month

**Capabilities:**
- Visual design feedback
- Content creation for Deaf audiences
- VR/AR experience design (vr4deaf.org)
- ASL-friendly video scripting
- Accessible infographics

**Example Usage:**
```typescript
const response = await aiProxyService.createRequest(
  userId,
  'CREATIVE',
  'Design a VR training module for ASL learners'
);
```

---

## AI Provider Configuration

### OpenAI
```typescript
const config = {
  endpoint: 'https://api.openai.com/v1',
  models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'dall-e-3'],
  costPerToken: 0.00003,
};
```

### Google Vertex AI
```typescript
const config = {
  endpoint: 'https://{region}-aiplatform.googleapis.com/v1',
  models: ['gemini-pro', 'gemini-pro-vision', 'text-bison'],
  costPerToken: 0.000025,
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  region: 'us-central1',
};
```

### Anthropic Claude
```typescript
const config = {
  endpoint: 'https://api.anthropic.com/v1',
  models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  costPerToken: 0.000024,
};
```

### Local Ollama
```typescript
const config = {
  endpoint: 'http://localhost:11434/api',
  models: ['llama2', 'mistral', 'codellama'],
  costPerToken: 0, // Free local inference
};
```

---

## GENERATIVE UNITS (GU)

GENERATIVE UNITS are the MBTQ ecosystem's resource allocation system for AI usage:

- **1 GU = $0.001 USD equivalent**
- Protects users from overspending
- Pathway-specific limits prevent abuse
- Fibonacci-based warning thresholds

### Warning Thresholds
| Level | Usage | Action |
|-------|-------|--------|
| 38.2% | Warning | Visual notification |
| 50.0% | Caution | Haptic + visual alert |
| 61.8% | High | Strong visual warning |
| 78.6% | Critical | Requires confirmation |

---

## Accessibility Features

All AI responses include:

1. **Visual Descriptions** - Text alternatives for any visual content
2. **High Contrast Support** - Responses formatted for high contrast displays
3. **Caption Ready** - All content can be displayed as captions
4. **Haptic Patterns** - Warning states include haptic feedback codes
5. **Readability Scores** - Each response rated for readability

### AccessibilityMetadata
```typescript
interface AccessibilityMetadata {
  hasVisualDescription: boolean;
  hasSignLanguageReference: boolean;
  captionAvailable: boolean;
  contrastRatio?: number;      // Target: >= 7.0
  readabilityScore?: number;   // Target: >= 80
}
```

---

## API Endpoints

### Create Request
```
POST /api/v1/ai/request
Content-Type: application/json
Authorization: Bearer <deafauth_token>

{
  "pathway": "DEVELOPER",
  "message": "Help me debug this React component",
  "options": {
    "stream": false,
    "maxTokens": 4096
  },
  "accessibilityPreferences": {
    "highContrast": true,
    "visualDescriptions": true
  }
}
```

### Get Magician Info
```
GET /api/v1/ai/magicians/:pathway
```

### Check Usage
```
GET /api/v1/ai/usage
Authorization: Bearer <deafauth_token>
```

### Generate SDK Code
```
GET /api/v1/ai/sdk/:provider/:pathway
```

---

## Integration with MBTQ Ecosystem

| Service | Integration |
|---------|-------------|
| DeafAUTH | All AI requests require DeafAUTH token |
| PinkSync | AI responses synced across devices |
| FibonacciSecurity | GU consumption tracked and limited |
| Taskade | Business Magician workflow automation |
| vr4deaf.org | Creative Magician VR content |

---

## Environment Variables

```bash
# AI Provider Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# AI Proxy Config
AI_PROXY_DEFAULT_PROVIDER=openai
AI_PROXY_MAX_TOKENS=4096
AI_PROXY_ENABLE_COST_TRACKING=true
```

---

## Security Considerations

1. **Rate Limiting** - Per-user, per-pathway limits
2. **Token Validation** - DeafAUTH required for all requests
3. **Content Filtering** - Responses filtered for appropriateness
4. **Audit Logging** - All AI interactions logged for compliance
5. **VR Compliance** - vr4deaf.org requests use stricter limits
