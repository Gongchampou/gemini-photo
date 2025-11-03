export interface Message {
  id: string;
  role: 'user' | 'model';
  prompt?: string; // For user role
  imageUrl?: string; // For model role
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

// FIX: Added missing User interface for authentication component.
export interface User {
  email: string;
}

export type Theme = 'light' | 'dark';

export type AspectRatio = '16:9' | '1:1' | '9:16' | '4:3' | '3:4';

export type ImageResolution = '720p' | '1080p' | '4K' | '8K';

export interface InputImage {
  base64: string;
  mimeType: string;
}
