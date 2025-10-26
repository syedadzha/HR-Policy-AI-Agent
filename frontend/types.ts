export type Tab = 'upload' | 'chat';

export interface PolicyDocument {
  name: string;
  type: string;
  pages: number;
  uploadedAt: Date;
  size: number; // in MB
}

export interface Citation {
  documentName: string;
  page: number;
  snippet: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

// FIX: Add missing GeminiResponse interface used by services/localModelService.ts
export interface GeminiResponse {
  text: string;
  citationSource: PolicyDocument | null;
}
