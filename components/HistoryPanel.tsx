import React from 'react';
import type { Conversation } from '../types';
import { XIcon, MenuIcon, TrashIcon } from './IconComponents';

interface HistoryPanelProps {
    conversations: Conversation[];
    onSelectConversation: (conversation: Conversation) => void;
    onDeleteConversation: (conversationId: string) => void;
    activeConversationId: string | null;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ conversations, onSelectConversation, onDeleteConversation, activeConversationId, isCollapsed, onToggleCollapse }) => {
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
                {conversations.length === 0 ? (
                    <div className={`text-center text-gray-500 dark:text-gray-400 mt-8 p-4 ${isCollapsed ? 'hidden' : 'block'}`}>
                        <p>Your conversations will appear here.</p>
                    </div>
                ) : (
                    <div className={`space-y-2 p-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                        {conversations.map((convo) => (
                            <div 
                                key={convo.id} 
                                className={`group p-3 rounded-lg cursor-pointer transition-colors duration-200 w-full flex justify-between items-center ${activeConversationId === convo.id ? 'bg-purple-100 dark:bg-purple-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                onClick={() => onSelectConversation(convo)}
                                title={convo.title}
                            >
                                <div className="flex items-center overflow-hidden">
                                    {isCollapsed ? (
                                        <img src={convo.messages.find(m => m.imageUrl)?.imageUrl} alt="thumbnail" className="w-8 h-8 rounded-md object-cover"/>
                                    ) : (
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                                {convo.title}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                {convo.timestamp.toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent selecting the conversation
                                            if (window.confirm('Are you sure you want to delete this conversation?')) {
                                                onDeleteConversation(convo.id);
                                            }
                                        }}
                                        className="p-1.5 rounded-full text-gray-400 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                        title="Delete conversation"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
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
