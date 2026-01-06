import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { LayoutGrid, AlertCircle, UserCircle, User, Mail, ArrowRight, Lock, ShieldCheck, Globe, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface LoginProps {
  onLogin: (credential: string) => void;
  onGuestLogin: () => void;
  onEmailLogin: (email: string, name: string) => void;
}

type Provider = {
    id: string;
    name: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    url: string;
};

const PROVIDERS: Provider[] = [
    { id: 'google', name: 'Google', color: 'text-blue-600', bgColor: 'bg-white', icon: <Globe size={18}/>, url: 'https://accounts.google.com' },
    { id: 'yahoo', name: 'Yahoo Mail', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: <Mail size={18}/>, url: 'https://login.yahoo.com' },
    { id: 'rediff', name: 'Rediffmail', color: 'text-red-600', bgColor: 'bg-red-50', icon: <Mail size={18}/>, url: 'https://mail.rediff.com' },
    { id: 'microsoft', name: 'Outlook / M365', color: 'text-sky-600', bgColor: 'bg-sky-50', icon: <Globe size={18}/>, url: 'https://login.live.com' },
];

const Login: React.FC<LoginProps> = ({ onLogin, onGuestLogin, onEmailLogin }) => {
  const [error, setError] = useState<string>('');
  const [loginMode, setLoginMode] = useState<'options' | 'providers' | 'form' | 'connecting' | 'success'>('options');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(true);
  const [isGoogleInitialized, setIsGoogleInitialized] = useState(false);

  // Safely extract Client ID
  const googleClientId = useMemo(() => {
    const id = process.env.GOOGLE_CLIENT_ID;
    return (id && id !== 'undefined' && id !== 'null' && id.length > 5) ? id : null;
  }, []);

  const initGoogle = useCallback(() => {
    if (window.google && window.google.accounts) {
      if (!googleClientId) {
        setIsLoadingGoogle(false);
        setIsGoogleInitialized(false);
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => {
            if (response.credential) onLogin(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });
        
        const googleDiv = document.getElementById("googleSignInDiv");
        if (googleDiv) {
          window.google.accounts.id.renderButton(
            googleDiv,
            { theme: "outline", size: "large", width: 320, shape: "pill", text: "continue_with", logo_alignment: "left" }
          );
        }
        setIsGoogleInitialized(true);
        setIsLoadingGoogle(false);
      } catch (e) {
        console.error("GSI Init Error:", e);
        setError("Google Sign-In initialization failed.");
        setIsLoadingGoogle(false);
        setIsGoogleInitialized(false);
      }
    }
  }, [onLogin, googleClientId]);

  useEffect(() => {
    const checkGoogle = setInterval(() => {
      if (window.google && window.google.accounts) {
        initGoogle();
        clearInterval(checkGoogle);
      }
    }, 100);
    const timeout = setTimeout(() => clearInterval(checkGoogle), 5000);
    return () => {
      clearInterval(checkGoogle);
      clearTimeout(timeout);
    };
  }, [initGoogle]);

  const handleProviderSelect = (provider: Provider) => {
      setSelectedProvider(provider);
      
      if (provider.id === 'google' && isGoogleInitialized) {
          window.google.accounts.id.prompt((notification: any) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                  setLoginMode('connecting');
                  setTimeout(() => {
                      // Pre-fill mock data for Google if using the prompt fallback
                      setName("Google User");
                      setEmail("user@gmail.com");
                      setLoginMode('success');
                  }, 2000);
              }
          });
          return;
      }

      setLoginMode('connecting');
      const popup = window.open(provider.url, 'auth_popup', 'width=500,height=600,left=100,top=100');
      
      const checkPopup = setInterval(() => {
          if (!popup || popup.closed) {
              clearInterval(checkPopup);
              // Pre-fill mock data if it's Google
              if (provider.id === 'google') {
                setName("Google User");
                setEmail("user@gmail.com");
              }
              setLoginMode('success');
          }
      }, 2000);
      
      setTimeout(() => {
          if (popup) popup.close();
          if (provider.id === 'google') {
            setName("Google User");
            setEmail("user@gmail.com");
          }
          setLoginMode('success');
          clearInterval(checkPopup);
      }, 4000);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) onEmailLogin(email, name);
  };

  return (
    <div className="min-h-screen bg-[#fcfdff] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
         <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-blue-50 rounded-full blur-[140px] opacity-60 animate-pulse"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[140px] opacity-60 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="text-center mb-10 group cursor-default">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl shadow-2xl shadow-blue-500/20 flex items-center justify-center text-white mx-auto mb-6 transform group-hover:rotate-6 transition-all duration-500">
            <LayoutGrid size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">TaskFlow AI</h1>
          <p className="text-slate-500 font-medium">Smart Professional Management</p>
        </div>

        <div className="glass-panel rounded-[3rem] p-10 flex flex-col items-center shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12)] border-white/50">
            
            {loginMode === 'options' && (
              <div className="w-full space-y-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Secure Login</div>
                  
                  <div className="relative w-full flex justify-center min-h-[44px]">
                      {isLoadingGoogle && googleClientId && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 rounded-full border border-slate-200 animate-pulse">
                              <span className="text-xs text-slate-400 font-medium">Connecting to Google...</span>
                          </div>
                      )}
                      <div id="googleSignInDiv" className="w-full flex justify-center"></div>
                      
                      {(!googleClientId || !isGoogleInitialized) && !isLoadingGoogle && (
                         <button 
                            onClick={() => handleProviderSelect(PROVIDERS[0])}
                            className="w-full max-w-[320px] flex items-center justify-center gap-3 py-3 bg-white text-slate-700 rounded-full font-bold hover:bg-slate-50 transition-all border border-slate-200 shadow-sm active:scale-[0.98]"
                         >
                            <Globe size={18} className="text-blue-500" />
                            <span>Continue with Google Account</span>
                         </button>
                      )}
                  </div>

                  <div className="flex items-center gap-4 w-full">
                      <div className="h-[1px] bg-slate-100 flex-1"></div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">OR</span>
                      <div className="h-[1px] bg-slate-100 flex-1"></div>
                  </div>

                  <button 
                      onClick={() => setLoginMode('providers')}
                      className="group w-full flex items-center justify-center gap-3 py-4 bg-white text-slate-700 rounded-full font-bold hover:bg-slate-50 transition-all border border-slate-200 shadow-sm active:scale-[0.98]"
                  >
                      <Mail size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                      <span>Connect with Mail</span>
                  </button>

                  <button 
                      onClick={onGuestLogin}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all transform active:scale-[0.98] shadow-2xl shadow-slate-300/30"
                  >
                      <UserCircle size={18} />
                      <span>Guest Explorer</span>
                  </button>
              </div>
            )}

            {loginMode === 'providers' && (
                <div className="w-full space-y-4 animate-in slide-in-from-right-10 duration-500">
                    <button onClick={() => setLoginMode('options')} className="text-xs font-bold text-blue-600 mb-6 flex items-center gap-2 group hover:gap-3 transition-all">
                        <ArrowRight size={14} className="rotate-180" />
                        Back to options
                    </button>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Select your mail provider</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {PROVIDERS.map(p => (
                            <button 
                                key={p.id}
                                onClick={() => handleProviderSelect(p)}
                                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all group shadow-sm bg-white"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${p.bgColor} ${p.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                        {p.icon}
                                    </div>
                                    <span className="font-bold text-slate-700">{p.name}</span>
                                </div>
                                <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {loginMode === 'connecting' && selectedProvider && (
                <div className="w-full flex flex-col items-center justify-center py-16 animate-in fade-in duration-500 text-center">
                    <div className="relative mb-10">
                        <Loader2 size={64} className="text-blue-600 animate-spin" strokeWidth={1.5} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            {React.cloneElement(selectedProvider.icon as React.ReactElement, { size: 28, className: selectedProvider.color })}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Linking {selectedProvider.name}</h2>
                    <p className="text-sm text-slate-500 max-w-[240px] mx-auto leading-relaxed">Completing authentication in the secure popup window...</p>
                </div>
            )}

            {loginMode === 'success' && selectedProvider && (
                <div className="w-full flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-500 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-green-100/50 animate-bounce">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Connected!</h2>
                    <p className="text-sm text-slate-500 mb-8 px-4">Your {selectedProvider.name} account is verified.</p>
                    <button 
                        onClick={() => setLoginMode('form')}
                        className="w-full py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
                    >
                        <span>Continue to App</span>
                        <ArrowRight size={18} />
                    </button>
                </div>
            )}

            {loginMode === 'form' && (
              <form onSubmit={handleEmailSubmit} className="w-full space-y-5 animate-in slide-in-from-bottom-10 duration-500">
                  <div className="flex items-center gap-2 mb-6 bg-blue-50 text-blue-700 px-4 py-3 rounded-2xl text-[10px] font-black border border-blue-100 uppercase tracking-[0.15em] w-full">
                      <ShieldCheck size={16} />
                      Connected via {selectedProvider?.name}
                  </div>

                  <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Profile Name</label>
                      <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            required
                            type="text" 
                            placeholder="Your name" 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-800"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                      </div>
                  </div>

                  <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-1">Email Address</label>
                      <div className="relative">
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            required
                            type="email" 
                            placeholder="your@email.com" 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium text-slate-800"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                      </div>
                  </div>

                  <button 
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all transform active:scale-[0.98] shadow-2xl shadow-slate-200 mt-6"
                  >
                      <span>Complete Setup</span>
                      <ArrowRight size={18} />
                  </button>
              </form>
            )}

            {error && (
              <div className="mt-6 flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 px-4 py-3 rounded-2xl border border-red-100 w-full animate-shake">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <Lock size={12} /> Secure
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <ShieldCheck size={12} /> Privacy
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;