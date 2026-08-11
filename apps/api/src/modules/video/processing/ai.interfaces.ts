import type { ScriptVerificationResultInput, DocumentVerificationResultInput } from '@repo/contracts';

export type ScriptVerificationResult = ScriptVerificationResultInput & { transcript: string };

export type DocumentVerificationResult = DocumentVerificationResultInput;

export interface VideoAuthenticityResult {
  status: 'likely_real' | 'likely_ai_generated' | 'uncertain';
  confidence: number;
  signals: string[];
}

export interface SpeechToTextProvider {
  transcribe(audioFilePath: string): Promise<string>;
}

export interface ScriptVerificationProvider {
  verifyScript(expectedScript: string, transcript: string): Promise<ScriptVerificationResult>;
}

export interface DocumentVerificationProvider {
  verifyDocument(imagePaths: string[]): Promise<DocumentVerificationResult>;
}

export interface VideoAuthenticityProvider {
  verifyAuthenticity(videoPath: string): Promise<VideoAuthenticityResult>;
}
