import fs from 'fs';
import OpenAI from 'openai';
import { env } from '../../../config/env.js';
import type { 
  SpeechToTextProvider, 
  ScriptVerificationProvider, 
  DocumentVerificationProvider, 
  VideoAuthenticityProvider,
  ScriptVerificationResult,
  DocumentVerificationResult,
  VideoAuthenticityResult
} from './ai.interfaces.js';

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!env.AI_ENABLED) {
    throw new Error('AI is disabled');
  }
  if (!openaiClient) {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is missing');
    }
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return openaiClient;
}

import { ScriptVerificationResultSchema, DocumentVerificationResultSchema } from '@repo/contracts';

export class OpenAIVideoProcessor implements SpeechToTextProvider, ScriptVerificationProvider, DocumentVerificationProvider, VideoAuthenticityProvider {
  async transcribe(audioFilePath: string): Promise<string> {
    if (!env.AI_ENABLED) return 'NOT_RUN';
    const openai = getOpenAI();
    
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: env.OPENAI_TRANSCRIPTION_MODEL,
    });
    
    return response.text;
  }

  async verifyScript(expectedScript: string, transcript: string): Promise<ScriptVerificationResult> {
    if (!env.AI_ENABLED) return { status: 'uncertain', confidence: 0, transcript, missingSegments: [], extraContent: [] };
    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI verifying if a user spoke a required script. You tolerate accents, filler words, and minor deviations, but must detect meaningful omissions or additions. Output JSON matching the schema: { status: "pass"|"fail"|"uncertain", confidence: number, missingSegments: string[], extraContent: string[] }' },
        { role: 'user', content: `Expected script: "${expectedScript}"\n\nActual transcript: "${transcript}"` }
      ],
      response_format: { type: 'json_object' }
    });

    const parsed = ScriptVerificationResultSchema.parse(JSON.parse(response.choices[0]?.message?.content || '{}'));
    return { ...parsed, transcript };
  }

  async verifyDocument(imagePaths: string[]): Promise<DocumentVerificationResult> {
    if (!env.AI_ENABLED) return { status: 'uncertain', documentType: 'uncertain', heldByPerson: false, confidence: 0, evidence: [] };
    const openai = getOpenAI();

    // Limit to 3 frames to save costs
    const samplePaths = imagePaths.slice(0, 3);
    const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [{ type: 'text', text: 'Does this person appear to be holding a passport in any of these frames? Output JSON matching schema: { status: "pass"|"fail"|"uncertain", documentType: "passport"|"other"|"uncertain", heldByPerson: boolean, confidence: number, evidence: string[] }' }];

    for (const path of samplePaths) {
      const b64 = fs.readFileSync(path).toString('base64');
      content.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}`, detail: 'low' } });
    }

    const response = await openai.chat.completions.create({
      model: env.OPENAI_VISION_MODEL,
      messages: [
        { role: 'system', content: 'You are an ID verification AI. You do not extract PII. You only determine if the user is holding a passport.' },
        { role: 'user', content }
      ],
      response_format: { type: 'json_object' }
    });

    return DocumentVerificationResultSchema.parse(JSON.parse(response.choices[0]?.message?.content || '{}'));
  }

  async verifyAuthenticity(_videoPath: string): Promise<VideoAuthenticityResult> {
    // We do not have a dedicated AI authenticity model yet, use not_run or uncertain
    return { status: 'uncertain', confidence: 0, signals: [] };
  }
}
