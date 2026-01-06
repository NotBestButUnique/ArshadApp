import React, { useState, useEffect } from 'react';
import { X, Share, MoreVertical, PlusSquare, Download, Smartphone, ArrowRight, CheckCircle2, Copy, Check } from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream ? 'ios' : 'android'
  );
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentUrl(window.location.href);
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <Smartphone size={20} />
            <h2 className="text-lg font-bold">Install App</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Link Sharing Section */}
        <div className="p-4 bg-slate-50 border-b border-slate-100">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">
                App Link (Send to Phone)
             </label>
             <div className="flex gap-2">
                <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 truncate font-mono">
                    {currentUrl}
                </div>
                <button 
                    onClick={handleCopy}
                    className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-2 font-medium text-sm ${
                        copied 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                    }`}
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
             </div>
             <p className="text-[10px] text-slate-400 mt-2">
                Copy this link and send it to yourself via WhatsApp or Email to open it on your phone.
             </p>
        </div>

        <div className="p-4 flex gap-1 bg-white">
            <button 
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'android' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Android
            </button>
            <button 
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'ios' ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                iOS (iPhone)
            </button>
        </div>

        <div className="p-6 pt-2 bg-white max-h-[40vh] overflow-y-auto custom-scrollbar">
          {activeTab === 'ios' ? (
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 flex-shrink-0">1</div>
                <div>
                    <p className="text-sm text-slate-700 font-medium mb-1">Open in Safari</p>
                    <p className="text-xs text-slate-500">Open the link above in Safari.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 flex-shrink-0">2</div>
                <div>
                    <p className="text-sm text-slate-700 font-medium mb-2">Tap "Share"</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md text-blue-500 border border-slate-200">
                         <Share size={16} />
                    </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 flex-shrink-0">3</div>
                <div>
                    <p className="text-sm text-slate-700 font-medium mb-2">"Add to Home Screen"</p>
                     <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md border border-slate-200">
                         <PlusSquare size={16} className="text-slate-600" />
                    </div>
                </div>
              </div>
            </div>
          ) : (
             <div className="space-y-5">
               <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 flex-shrink-0">1</div>
                <div>
                    <p className="text-sm text-slate-700 font-medium mb-1">Open Menu</p>
                    <p className="text-xs text-slate-500">Tap the 3 dots <MoreVertical size={10} className="inline" /> in the top right of Chrome.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 flex-shrink-0">2</div>
                <div>
                    <p className="text-sm text-slate-700 font-medium mb-2">Install App</p>
                    <div className="flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md border border-slate-200 w-fit">
                            <Download size={14} className="text-slate-600" />
                            <span className="text-xs font-bold text-slate-700">Install App</span>
                        </div>
                    </div>
                </div>
              </div>
             </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-center">
            <button onClick={onClose} className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                Got it
                <ArrowRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default InstallGuideModal;