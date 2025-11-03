import React, { useRef, useEffect } from 'react';
import { WandIcon, PaperAirplaneIcon, DownloadIcon, ImageIcon, XIcon } from './IconComponents';
import type { InputImage, Message } from '../types';

interface ImageGeneratorProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    messages: Message[];
    inputImage: InputImage | null;
    setInputImage: (image: InputImage | null) => void;
    isLoading: boolean;
    isGettingIdea: boolean;
    error: string | null;
    handleGenerate: () => void;
    handleGetIdea: () => void;
}

const LoadingSkeleton = () => (
    <div className="w-full lg:w-3/4">
        <div className="aspect-[16/9] w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center p-4">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Conjuring Pixels...</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">The AI is painting your vision. This can take a moment.</p>
            </div>
        </div>
    </div>
);

const WelcomePlaceholder = () => (
    <div className="text-center p-8 self-center">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
            Pixel Palette AI
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Your creative journey starts here. What will you bring to life today?
        </p>
    </div>
);


const ImageGenerator: React.FC<ImageGeneratorProps> = ({ 
    prompt, setPrompt, messages, inputImage, setInputImage, isLoading, isGettingIdea, error, handleGenerate, handleGetIdea 
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                const base64 = result.split(',')[1];
                setInputImage({ base64, mimeType: file.type });
            };
            reader.readAsDataURL(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };
    
    const canGetIdea = !inputImage && messages.length === 0;

    const getPlaceholderText = () => {
        if (messages.length > 0) {
            return "Describe how you want to refine the image...";
        }
        if (inputImage) {
            return "Describe the edits you want to make...";
        }
        return "A futuristic city skyline at sunset, anime style...";
    };
    
    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800">
            <main className="flex-grow overflow-y-auto p-4 md:p-8">
                <div className="w-full max-w-4xl mx-auto flex flex-col space-y-6">
                    {messages.length === 0 && !isLoading && <WelcomePlaceholder />}
                    
                    {messages.map(message => (
                        <div key={message.id}>
                            {message.role === 'user' && (
                                <div className="flex justify-end">
                                    <div className="bg-purple-600 text-white p-3 rounded-xl max-w-lg shadow-md animate-fade-in-right">
                                        {message.prompt}
                                    </div>
                                </div>
                            )}
                            {message.role === 'model' && message.imageUrl && (
                                <div className="flex justify-start">
                                    <div className="relative group animate-fade-in-left w-full lg:w-3/4">
                                        <img src={message.imageUrl} alt={message.prompt || 'Generated image'} className="aspect-[16/9] w-full object-contain rounded-xl" />
                                        <a
                                            href={message.imageUrl}
                                            download={`pixel-palette-ai-${message.id}.jpeg`}
                                            className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full hover:bg-black/75 transition-all transform scale-0 group-hover:scale-100 duration-200"
                                            title="Download Image"
                                        >
                                            <DownloadIcon className="h-6 w-6" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {isLoading && <LoadingSkeleton />}
                    
                    {error && (
                         <div className="bg-red-100 dark:bg-red-900/50 border border-red-500 text-red-700 dark:text-red-300 rounded-xl flex items-center justify-center p-4">
                            <p><strong>Error:</strong> {error}</p>
                        </div>
                    )}
                     <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="w-full p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="max-w-4xl mx-auto">
                    {inputImage && (
                        <div className="mb-2 relative w-24 h-24 p-1 border border-gray-300 dark:border-gray-600 rounded-md">
                            <img 
                                src={`data:${inputImage.mimeType};base64,${inputImage.base64}`} 
                                alt="Upload preview" 
                                className="w-full h-full object-cover rounded-sm"
                            />
                            <button
                                onClick={() => setInputImage(null)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                title="Remove image"
                            >
                                <XIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                    <div className="flex items-end space-x-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={triggerFileInput}
                            disabled={isLoading}
                            className="p-3 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                            title="Upload an image to edit"
                        >
                            <ImageIcon className="h-6 w-6" />
                        </button>
                        <div className="relative flex-grow">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleGenerate();
                                    }
                                }}
                                placeholder={getPlaceholderText()}
                                className="w-full p-4 pr-12 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-purple-500 focus:ring-0 rounded-[10px] resize-none transition-all leading-snug"
                                rows={1}
                                style={{ minHeight: '52px', maxHeight: '200px' }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = `${target.scrollHeight}px`;
                                }}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleGetIdea}
                                disabled={isLoading || isGettingIdea || !canGetIdea}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                title="Get a prompt idea (only for new conversations)"
                            >
                                <WandIcon className={`h-6 w-6 ${isGettingIdea ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={!prompt || isLoading}
                            className="flex items-center justify-center self-stretch w-12 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 dark:disabled:bg-purple-800 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                            title={messages.length > 0 || inputImage ? "Refine Image" : "Generate Image"}
                        >
                            <PaperAirplaneIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ImageGenerator;
