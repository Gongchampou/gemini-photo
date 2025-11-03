import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ImageGenerator from './components/ImageGenerator';
import HistoryPanel from './components/HistoryPanel';
import SettingsModal from './components/SettingsModal';
import type { Theme, Conversation, Message, AspectRatio, ImageResolution, InputImage } from './types';
import { generateImage, generatePromptIdea, editImage } from './services/geminiService';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme') as Theme;
      if (storedTheme) return storedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
        const item = window.localStorage.getItem('conversationHistory');
        if (item) {
            const parsed = JSON.parse(item);
            // Revive dates and nested message dates
            return parsed.map((convo: any) => ({
                ...convo,
                timestamp: new Date(convo.timestamp),
                messages: convo.messages.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }))
            }));
        }
    } catch (error) {
        console.error("Error reading history from localStorage", error);
    }
    return [];
  });
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [imageResolution, setImageResolution] = useState<ImageResolution>('1080p');
  const [isHistorySavingEnabled, setIsHistorySavingEnabled] = useState(true);

  // State for ImageGenerator
  const [prompt, setPrompt] = useState('');
  const [inputImage, setInputImage] = useState<InputImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingIdea, setIsGettingIdea] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeMessages = conversations.find(c => c.id === activeConversationId)?.messages || [];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isHistorySavingEnabled) return;
    try {
        window.localStorage.setItem('conversationHistory', JSON.stringify(conversations));
    } catch (error) {
        console.error("Error saving history to localStorage", error);
    }
  }, [conversations, isHistorySavingEnabled]);
  
  const handleGenerate = useCallback(async () => {
    if (!prompt || isLoading) return;
    setIsLoading(true);
    setError(null);
    setPrompt('');

    const lastImageUrl = activeMessages.slice().reverse().find(m => m.role === 'model' && m.imageUrl)?.imageUrl;

    try {
        let imageUrl: string;
        const baseImageForEdit = lastImageUrl || (inputImage ? `data:${inputImage.mimeType};base64,${inputImage.base64}` : null);

        if (baseImageForEdit) {
            const parts = baseImageForEdit.split(',');
            const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
            const base64Data = parts[1];
            imageUrl = await editImage(prompt, base64Data, mimeType);
        } else {
            imageUrl = await generateImage(prompt, aspectRatio, imageResolution);
        }
        
        const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', prompt, timestamp: new Date() };
        const modelMessage: Message = { id: `model-${Date.now()}`, role: 'model', imageUrl, timestamp: new Date() };

        if (activeConversationId) {
            setConversations(convos => convos.map(c => 
                c.id === activeConversationId ? { ...c, messages: [...c.messages, userMessage, modelMessage] } : c
            ));
        } else {
            const newConversation: Conversation = {
                id: `convo-${Date.now()}`,
                title: prompt,
                messages: [userMessage, modelMessage],
                timestamp: new Date()
            };
            setConversations(convos => [newConversation, ...convos]);
            setActiveConversationId(newConversation.id);
        }
        
        setInputImage(null);
    } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
}, [prompt, isLoading, activeConversationId, activeMessages, aspectRatio, imageResolution, inputImage, conversations]);

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

  const handleSelectConversation = (conversation: Conversation) => {
      setActiveConversationId(conversation.id);
      setPrompt('');
      setInputImage(null);
      setError(null);
      if (window.innerWidth < 768) {
        setIsHistoryCollapsed(true);
      }
  };

  const handleDeleteConversation = (idToDelete: string) => {
    setConversations(convos => convos.filter(c => c.id !== idToDelete));
    if (activeConversationId === idToDelete) {
        setActiveConversationId(null);
        setPrompt('');
        setInputImage(null);
        setError(null);
    }
  };

  const handleClearHistory = () => {
    setConversations([]);
    setActiveConversationId(null);
    try {
        window.localStorage.removeItem('conversationHistory');
    } catch (error) {
        console.error("Error clearing history from localStorage", error);
    }
  }

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setPrompt('');
    setInputImage(null);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Header 
            theme={theme} 
            setTheme={setTheme} 
            onToggleSettings={() => setIsSettingsVisible(!isSettingsVisible)}
            onNewConversation={handleNewConversation}
        />
        <div className="flex-grow flex overflow-hidden">
            <HistoryPanel 
                conversations={conversations} 
                onSelectConversation={handleSelectConversation}
                onDeleteConversation={handleDeleteConversation}
                activeConversationId={activeConversationId}
                isCollapsed={isHistoryCollapsed}
                onToggleCollapse={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <ImageGenerator 
                    prompt={prompt}
                    setPrompt={setPrompt}
                    messages={activeMessages}
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
            isHistorySavingEnabled={isHistorySavingEnabled}
            setIsHistorySavingEnabled={setIsHistorySavingEnabled}
        />
    </div>
  );
};

export default App;
