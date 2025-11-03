import React, { useState, useEffect } from 'react';
import { XIcon, TrashIcon } from './IconComponents';
import type { AspectRatio, ImageResolution } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClearHistory: () => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    imageResolution: ImageResolution;
    setImageResolution: (resolution: ImageResolution) => void;
    isHistorySavingEnabled: boolean;
    setIsHistorySavingEnabled: (enabled: boolean) => void;
}

const aspectRatios: { value: AspectRatio; label: string }[] = [
    { value: '16:9', label: 'Widescreen' },
    { value: '1:1', label: 'Square' },
    { value: '9:16', label: 'Portrait' },
    { value: '4:3', label: 'Landscape' },
    { value: '3:4', label: 'Tall' },
];

const imageResolutions: { value: ImageResolution; label: string }[] = [
    { value: '720p', label: '720p' },
    { value: '1080p', label: '1080p' },
    { value: '4K', label: '4K' },
    { value: '8K', label: '8K' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    onClearHistory, 
    aspectRatio, 
    setAspectRatio, 
    imageResolution, 
    setImageResolution,
    isHistorySavingEnabled,
    setIsHistorySavingEnabled
}) => {
    const [localAspectRatio, setLocalAspectRatio] = useState<AspectRatio>(aspectRatio);
    const [localImageResolution, setLocalImageResolution] = useState<ImageResolution>(imageResolution);
    const [localIsHistorySavingEnabled, setLocalIsHistorySavingEnabled] = useState(isHistorySavingEnabled);

    useEffect(() => {
        if (isOpen) {
            setLocalAspectRatio(aspectRatio);
            setLocalImageResolution(imageResolution);
            setLocalIsHistorySavingEnabled(isHistorySavingEnabled);
        }
    }, [isOpen, aspectRatio, imageResolution, isHistorySavingEnabled]);

    if (!isOpen) return null;

    const handleClear = () => {
        if (window.confirm('Are you sure you want to delete all your generation history? This action cannot be undone.')) {
            onClearHistory();
            onClose();
        }
    }

    const handleSave = () => {
        setAspectRatio(localAspectRatio);
        setImageResolution(localImageResolution);
        setIsHistorySavingEnabled(localIsHistorySavingEnabled);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md m-4 transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Image Settings</h3>
                         <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Aspect Ratio</label>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                    {aspectRatios.map(ratio => (
                                        <button 
                                            key={ratio.value}
                                            onClick={() => setLocalAspectRatio(ratio.value)}
                                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${localAspectRatio === ratio.value ? 'bg-purple-600 text-white font-semibold' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                        >
                                            {ratio.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Image Resolution</label>
                                <div className="grid grid-cols-4 gap-2 mt-1">
                                    {imageResolutions.map(res => (
                                        <button 
                                            key={res.value}
                                            onClick={() => setLocalImageResolution(res.value)}
                                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${localImageResolution === res.value ? 'bg-purple-600 text-white font-semibold' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                        >
                                            {res.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Manage Data</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
                            Your generation history and settings are saved in your browser's local storage.
                        </p>
                        <div className="mt-2 flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">Enable History</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Save new generations to the history panel.</p>
                            </div>
                            <button
                                onClick={() => setLocalIsHistorySavingEnabled(!localIsHistorySavingEnabled)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${localIsHistorySavingEnabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                                role="switch"
                                aria-checked={localIsHistorySavingEnabled}
                            >
                                <span className="sr-only">Enable History</span>
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${localIsHistorySavingEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">Clear History</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete all generations.</p>
                            </div>
                            <button 
                                onClick={handleClear}
                                className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
                            >
                                <TrashIcon className="h-4 w-4" />
                                <span>Clear</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;