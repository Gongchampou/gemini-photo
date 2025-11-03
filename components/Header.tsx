import React from 'react';
import type { Theme } from '../types';
import { SunIcon, MoonIcon, LogoutIcon, CogIcon } from './IconComponents';

interface HeaderProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    onLogout: () => void;
    onToggleSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, onLogout, onToggleSettings }) => {
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <header className="flex items-center justify-between p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
            <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                Pixel Palette
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                </button>
                 <button
                    onClick={onToggleSettings}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Settings"
                >
                    <CogIcon className="h-6 w-6" />
                </button>
                <button
                    onClick={onLogout}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Logout"
                >
                    <LogoutIcon className="h-6 w-6" />
                </button>
            </div>
        </header>
    );
};

export default Header;
