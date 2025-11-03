import React, { useState, useEffect, useCallback } from 'react';
import Auth from './components/Auth';
import Header from './components/Header';
import ImageGenerator from './components/ImageGenerator';
import HistoryPanel from './components/HistoryPanel';
import SettingsModal from './components/SettingsModal';
import type { User, Theme, ImageGeneration, AspectRatio, ImageResolution, InputImage } from './types';
import { generateImage, generatePromptIdea, editImage } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      if (storedTheme) return storedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [generations, setGenerations] = useState<ImageGeneration[]>([]);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [imageResolution, setImageResolution] = useState<ImageResolution>('1080p');

  // State for ImageGenerator
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [inputImage, setInputImage] = useState<InputImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingIdea, setIsGettingIdea] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const handleLogout = () => {
    setUser(null);
    setGenerations([]);
    setPrompt('');
    setGeneratedImage(null);
    setInputImage(null);
    setError(null);
  };

  const handleAuthSuccess = (authedUser: User) => {
    setUser(authedUser);
  };

  const handleImageGenerated = useCallback((newGeneration: Omit<ImageGeneration, 'id'>) => {
    setGenerations(prev => [
      { ...newGeneration, id: new Date().toISOString() + Math.random() },
      ...prev
    ]);
  }, []);
  
  const handleGenerate = useCallback(async () => {
    if (!prompt || isLoading) return;
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
        let imageUrl: string;
        if (inputImage) {
            imageUrl = await editImage(prompt, inputImage.base64, inputImage.mimeType);
        } else {
            imageUrl = await generateImage(prompt, aspectRatio, imageResolution);
        }
        setGeneratedImage(imageUrl);
        handleImageGenerated({ prompt, imageUrl, timestamp: new Date() });
        setInputImage(null);
    } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  }, [prompt, isLoading, handleImageGenerated, aspectRatio, imageResolution, inputImage]);

  const handleGetIdea = useCallback(async () => {
      setIsGettingIdea(true);
      setError(null);
      try {
          const idea = await generatePromptIdea();
          setPrompt(idea);
      } catch (err: any) {
          setError(err.message || 'Could not fetch an idea.');
      } finally {
          setIsGettingIdea(false);
      }
  }, []);

  const handleSelectGeneration = (generation: ImageGeneration) => {
      setPrompt(generation.prompt);
      setGeneratedImage(generation.imageUrl);
      setInputImage(null);
      setError(null);
      if (window.innerWidth < 768) { // collapse on mobile after selection
        setIsHistoryCollapsed(true);
      }
  };

  const handleClearHistory = () => {
    setGenerations([]);
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-200 dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Header 
            theme={theme} 
            setTheme={setTheme} 
            onLogout={handleLogout}
            onToggleSettings={() => setIsSettingsVisible(!isSettingsVisible)}
        />
        <div className="flex-grow flex overflow-hidden">
            <HistoryPanel 
                generations={generations} 
                onSelectGeneration={handleSelectGeneration}
                isCollapsed={isHistoryCollapsed}
                onToggleCollapse={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <ImageGenerator 
                    prompt={prompt}
                    setPrompt={setPrompt}
                    generatedImage={generatedImage}
                    inputImage={inputImage}
                    setInputImage={setInputImage}
                    isLoading={isLoading}
                    isGettingIdea={isGettingIdea}
                    error={error}
                    handleGenerate={handleGenerate}
                    handleGetIdea={handleGetIdea}
                />
            </div>
        </div>
            
        <SettingsModal 
            isOpen={isSettingsVisible}
            onClose={() => setIsSettingsVisible(false)}
            onClearHistory={handleClearHistory}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            imageResolution={imageResolution}
            setImageResolution={setImageResolution}
        />
    </div>
  );
};

export default App;