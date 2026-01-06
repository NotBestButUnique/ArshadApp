import React, { useState, useEffect } from 'react';
import { X, Clock, Droplets } from 'lucide-react';

interface WaterReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInterval: number;
  enabled: boolean;
  onSave: (interval: number, enabled: boolean) => void;
}

const WaterReminderModal: React.FC<WaterReminderModalProps> = ({ isOpen, onClose, currentInterval, enabled, onSave }) => {
  const [localInterval, setLocalInterval] = useState(currentInterval);
  const [localEnabled, setLocalEnabled] = useState(enabled);

  useEffect(() => {
    if (isOpen) {
        setLocalInterval(currentInterval);
        setLocalEnabled(enabled);
    }
  }, [isOpen, currentInterval, enabled]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-50">
            <div className="flex items-center gap-2 text-blue-700">
                <Droplets size={20} />
                <h2 className="text-lg font-bold">Hydration Settings</h2>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-blue-100 rounded-full transition-colors text-blue-400">
                <X size={18} />
            </button>
        </div>
        
        <div className="p-6 space-y-6">
            {/* Toggle */}
            <div className="flex items-center justify-between">
                <div>
                    <span className="font-semibold text-slate-700 block">Enable Reminders</span>
                    <span className="text-xs text-slate-400">Get a sound alert & notification</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={localEnabled}
                        onChange={(e) => setLocalEnabled(e.target.checked)}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
            </div>

            {/* Interval Input */}
            <div className={`space-y-3 transition-opacity duration-200 ${localEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    Reminder Frequency
                </label>
                <div className="flex items-center gap-3">
                    <input 
                        type="range" 
                        min="5" 
                        max="120" 
                        step="5"
                        value={localInterval}
                        onChange={(e) => setLocalInterval(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="w-16 px-2 py-1 bg-slate-100 rounded-lg text-center font-mono font-bold text-slate-700 text-sm border border-slate-200">
                        {localInterval}m
                    </div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>5m</span>
                    <span>1 hour</span>
                    <span>2 hours</span>
                </div>
            </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
             <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
             <button 
                onClick={() => {
                    onSave(localInterval, localEnabled);
                    onClose();
                }}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
                Save Settings
            </button>
        </div>
      </div>
    </div>
  );
};

export default WaterReminderModal;