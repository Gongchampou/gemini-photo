import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio, ImageResolution } from '../types';

// IMPORTANT: This assumes the API_KEY is set in the environment.
// Do not expose this key in client-side code in a real production app.
// This is for demonstration purposes in a sandboxed environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. Please set the API_KEY environment variable.");
}

const getAiClient = () => new GoogleGenAI({ apiKey: API_KEY });

const getResolutionKeywords = (resolution: ImageResolution): string => {
    switch (resolution) {
        case '720p':
            return 'HD, clear image';
        case '1080p':
            return 'Full HD, high resolution, sharp focus';
        case '4K':
            return '4K resolution, photorealistic, hyper-detailed, cinematic lighting';
        case '8K':
            return '8K resolution, ultra-high definition, professional photography, insane detail';
        default:
            return '';
    }
}

export const generateImage = async (prompt: string, aspectRatio: AspectRatio, resolution: ImageResolution): Promise<string> => {
  if (!API_KEY) throw new Error("API key is missing.");
  const ai = getAiClient();
  try {
    const enhancedPrompt = `${prompt}, ${getResolutionKeywords(resolution)}`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image was generated.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};

export const editImage = async (prompt: string, imageData: string, mimeType: string): Promise<string> => {
  if (!API_KEY) throw new Error("API key is missing.");
  const ai = getAiClient();

  try {
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      }
    }
    
    throw new Error("No image was generated from the edit.");

  } catch (error) {
    console.error("Error editing image:", error);
    throw new Error("Failed to edit image. Please try again.");
  }
};

export const generatePromptIdea = async (): Promise<string> => {
  if (!API_KEY) throw new Error("API key is missing.");
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Generate a short, creative, and visually descriptive image generation prompt. Be imaginative and specific. For example: 'A majestic bioluminescent jellyfish floating in a starry night sky, detailed, fantasy art'. Another example: 'An adorable robot serving tea to a cat in a cozy, sunlit library, cinematic, detailed illustration'.",
        config: {
            temperature: 1.0,
            topP: 0.95
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating prompt idea:", error);
    throw new Error("Failed to get a prompt idea. Please try again.");
  }
};