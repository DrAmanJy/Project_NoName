
export interface ScriptVerificationResult {
  status: 'pass' | 'fail' | 'uncertain';
  confidence: number;
  transcript: string;
  missingSegments: string[];
  extraContent: string[];
}

export interface DocumentVerificationResult {
  status: 'pass' | 'fail' | 'uncertain';
  documentType: 'passport' | 'other' | 'uncertain';
  heldByPerson: boolean;
  confidence: number;
  evidence: string[];
}

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
