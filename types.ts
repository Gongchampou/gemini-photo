export interface User {
  email: string;
}

export interface ImageGeneration {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: Date;
}

export type Theme = 'light' | 'dark';

export type AspectRatio = '16:9' | '1:1' | '9:16' | '4:3' | '3:4';

export type ImageResolution = '720p' | '1080p' | '4K' | '8K';

export interface InputImage {
  base64: string;
  mimeType: string;
}
