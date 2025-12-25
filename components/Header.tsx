
import React from 'react';
import { Activity, Settings, HelpCircle, Bell, User, ChevronLeft } from 'lucide-react';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onBack }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {currentView !== 'dashboard' && (
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onBack()}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white logo-container">
            <img src="/Gemini_Generated_Image_q6498vq6498vq649 (1).png" alt="Sonar Logo" className="w-5 h-5 object-contain" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Sonar
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <HelpCircle size={20} />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings size={20} />
        </button>
        <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden md:block"></div>
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
            <User size={18} />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden md:block">Dr. Sterling</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
