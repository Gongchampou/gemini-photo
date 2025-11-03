import React from 'react';
import type { ImageGeneration } from '../types';
import { XIcon, HistoryIcon, MenuIcon } from './IconComponents';

interface HistoryPanelProps {
    generations: ImageGeneration[];
    onSelectGeneration: (generation: ImageGeneration) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ generations, onSelectGeneration, isCollapsed, onToggleCollapse }) => {
    return (
        <aside className={`bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-full md:w-80 lg:w-96'}`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                {!isCollapsed && (
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">History</h2>
                )}
                <button 
                    onClick={onToggleCollapse}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    title={isCollapsed ? "Expand history" : "Collapse history"}
                >
                    {isCollapsed ? <MenuIcon className="h-6 w-6" /> : <XIcon className="h-6 w-6" />}
                </button>
            </div>
            <div className="flex-grow overflow-y-auto">
                {generations.length === 0 ? (
                    <div className={`text-center text-gray-500 dark:text-gray-400 mt-8 p-4 ${isCollapsed ? 'hidden' : 'block'}`}>
                        <p>Your generations will appear here.</p>
                    </div>
                ) : (
                    <div className={`space-y-2 p-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                        {generations.map((gen) => (
                            <div 
                                key={gen.id} 
                                className={`p-3 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 w-full ${isCollapsed ? '' : 'bg-white dark:bg-gray-800/50'}`}
                                onClick={() => onSelectGeneration(gen)}
                                title={gen.prompt}
                            >
                                {isCollapsed ? (
                                     <img src={gen.imageUrl} alt="thumbnail" className="w-8 h-8 rounded-md object-cover"/>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                            {gen.prompt}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {gen.timestamp.toLocaleDateString()}
                                        </p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default HistoryPanel;
