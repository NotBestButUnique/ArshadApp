import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Employee, Group, ChatGroup } from '../types';
import { Send, User, Image as ImageIcon, Paperclip, Hash, LayoutGrid, Archive, Search, Reply, Forward, CheckCheck, X, Plus, Bell, BellOff, MoreVertical } from 'lucide-react';

interface ChatViewProps {
  employees: Employee[];
  currentUser: Employee;
  workGroups: Group[];
  customGroups: ChatGroup[];
  isAdmin: boolean;
  onCreateCustomGroup: (name: string) => void;
  onUpdateCustomGroup: (group: ChatGroup) => void;
  onUpdateWorkGroup: (group: Group) => void;
  playSound: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ 
    employees, currentUser, workGroups, customGroups, isAdmin, 
    onCreateCustomGroup, onUpdateCustomGroup, onUpdateWorkGroup, playSound 
}) => {
  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm1', senderId: 'e1', text: 'Welcome to General Chat', timestamp: new Date(Date.now() - 100000).toISOString(), groupId: 'general', readBy: [] },
  ]);
  
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [forwardingMsg, setForwardingMsg] = useState<ChatMessage | null>(null);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannelId]);

  // --- Helper to get active group details ---
  const activeWorkGroup = workGroups.find(g => g.id === activeChannelId);
  const activeCustomGroup = customGroups.find(g => g.id === activeChannelId);
  
  const isMuted = React.useMemo(() => {
    if (activeWorkGroup) {
        return activeWorkGroup.mutedBy?.includes(currentUser.id) || false;
    }
    if (activeCustomGroup) {
        return activeCustomGroup.mutedBy?.includes(currentUser.id) || false;
    }
    return false; // General chat not mutable in this simplified logic, or treated as always unmuted
  }, [activeWorkGroup, activeCustomGroup, currentUser.id]);

  const toggleMute = () => {
      const currentId = currentUser.id;
      if (activeWorkGroup) {
          const currentMutes = activeWorkGroup.mutedBy || [];
          const newMutes = currentMutes.includes(currentId) 
            ? currentMutes.filter(id => id !== currentId) 
            : [...currentMutes, currentId];
          onUpdateWorkGroup({ ...activeWorkGroup, mutedBy: newMutes });
      } else if (activeCustomGroup) {
          const currentMutes = activeCustomGroup.mutedBy || [];
          const newMutes = currentMutes.includes(currentId) 
            ? currentMutes.filter(id => id !== currentId) 
            : [...currentMutes, currentId];
          onUpdateCustomGroup({ ...activeCustomGroup, mutedBy: newMutes });
      }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      text: inputText,
      timestamp: new Date().toISOString(),
      groupId: activeChannelId,
      image: selectedImage || undefined,
      replyTo: replyingTo ? {
          id: replyingTo.id,
          text: replyingTo.text,
          senderName: employees.find(e => e.id === replyingTo.senderId)?.name || 'Unknown'
      } : undefined,
      readBy: []
    };

    setMessages(prev => [...prev, newMessage]);
    // Feedback sound for sending (optional, usually apps only click, but here we ring)
    if (!isMuted) playSound(); 

    setInputText('');
    setSelectedImage(null);
    setReplyingTo(null);

    // Simulate Reply from others
    const targetChannel = activeChannelId; 
    
    setTimeout(() => {
      const otherEmployees = employees.filter(e => e.id !== currentUser.id);
      if (otherEmployees.length > 0) {
        const randomEmp = otherEmployees[Math.floor(Math.random() * otherEmployees.length)];
        const replyMsg: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          senderId: randomEmp.id,
          text: ["Acknowledged.", "Will check.", "Okay.", "Done.", "On it."][Math.floor(Math.random() * 5)],
          timestamp: new Date().toISOString(),
          groupId: targetChannel,
          readBy: []
        };
        setMessages(prev => [...prev, replyMsg]);
        
        // CHECK IF MUTED before ringing for INCOMING message
        // We need to check the group's status dynamically
        // Since we are inside a timeout, activeWorkGroup/activeCustomGroup refs might be stale if we switched channels
        // But we want to check the mute status of the TARGET channel.
        
        let targetGroupMuted = false;
        const wGroup = workGroups.find(g => g.id === targetChannel);
        if (wGroup) {
            targetGroupMuted = wGroup.mutedBy?.includes(currentUser.id) || false;
        } else {
            const cGroup = customGroups.find(g => g.id === targetChannel);
            if (cGroup) {
                targetGroupMuted = cGroup.mutedBy?.includes(currentUser.id) || false;
            }
        }
        
        // Play sound if NOT muted
        if (!targetGroupMuted) {
             playSound(); 
        }
      }
    }, 2000);
  };

  const handleForward = (targetGroupId: string) => {
      if (!forwardingMsg) return;
      const msg: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          senderId: currentUser.id,
          text: forwardingMsg.text,
          image: forwardingMsg.image,
          timestamp: new Date().toISOString(),
          groupId: targetGroupId,
          isForwarded: true,
          readBy: []
      };
      setMessages(prev => [...prev, msg]);
      setForwardingMsg(null);
      setActiveChannelId(targetGroupId);
      playSound();
  };

  const visibleMessages = messages.filter(msg => {
      if (msg.groupId !== activeChannelId) return false;
      if (searchQuery && !msg.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
  });

  const getActiveGroupName = () => {
      if (activeChannelId === 'general') return "General Chat";
      if (activeWorkGroup) return activeWorkGroup.name;
      if (activeCustomGroup) return activeCustomGroup.name;
      return "Chat";
  };

  return (
    <div className="flex flex-1 h-full bg-[#efeae2] overflow-hidden rounded-tl-2xl relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat'}}></div>

      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col hidden md:flex z-10">
         <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-slate-700">Chats</h2>
            <button onClick={() => setIsNewGroupModalOpen(true)} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200" title="Create New Group"><Plus size={18} /></button>
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-4">
             {/* General */}
             <button onClick={() => setActiveChannelId('general')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg ${activeChannelId === 'general' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}>
                 <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center"><Hash size={20}/></div>
                 <span className="font-semibold">General Chat</span>
             </button>

             {/* Work Groups */}
             <div>
                 <h3 className="text-xs font-bold text-slate-400 uppercase px-3 mb-1">Work Groups</h3>
                 {workGroups.map(g => (
                     <button key={g.id} onClick={() => setActiveChannelId(g.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeChannelId === g.id ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
                         <div className={`w-8 h-8 rounded-full bg-${g.color}-100 flex items-center justify-center text-${g.color}-600`}><LayoutGrid size={14}/></div>
                         <div className="text-left flex-1"><div className="text-sm font-medium">{g.name}</div></div>
                         {g.mutedBy?.includes(currentUser.id) && <BellOff size={12} className="text-slate-400"/>}
                     </button>
                 ))}
             </div>

             {/* Custom Groups */}
             <div>
                 <h3 className="text-xs font-bold text-slate-400 uppercase px-3 mb-1">Social Groups</h3>
                 {customGroups.map(g => (
                     <button key={g.id} onClick={() => setActiveChannelId(g.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeChannelId === g.id ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
                         <div className={`w-8 h-8 rounded-full bg-${g.color}-100 flex items-center justify-center text-${g.color}-600`}><User size={14}/></div>
                         <div className="text-left flex-1"><div className="text-sm font-medium">{g.name}</div></div>
                         {g.mutedBy?.includes(currentUser.id) && <BellOff size={12} className="text-slate-400"/>}
                     </button>
                 ))}
                 <button onClick={() => setIsNewGroupModalOpen(true)} className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <Plus size={12} /> Create new group
                 </button>
             </div>
         </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <div className="bg-white px-4 py-2 flex items-center justify-between shadow-sm h-16">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">{getActiveGroupName()[0]}</div>
                <div>
                    <h1 className="font-bold text-slate-800">{getActiveGroupName()}</h1>
                    <p className="text-xs text-slate-500">
                        {activeWorkGroup || activeCustomGroup 
                            ? `${(activeWorkGroup || activeCustomGroup)?.memberIds.length} members` 
                            : 'All Team'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 {(activeWorkGroup || activeCustomGroup) && (
                     <button onClick={toggleMute} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title={isMuted ? "Unmute Notifications" : "Mute Notifications"}>
                         {isMuted ? <BellOff size={20} className="text-red-500"/> : <Bell size={20}/>}
                     </button>
                 )}
                 {isSearchOpen ? (
                     <div className="flex items-center bg-slate-100 rounded-full px-3 py-1 animate-in slide-in-from-right-10 duration-200">
                        <input autoFocus type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-32" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}><X size={14}/></button>
                     </div>
                 ) : (
                     <button onClick={() => setIsSearchOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"><Search size={20}/></button>
                 )}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {visibleMessages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-1`}>
                        <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                            {msg.isForwarded && <div className="text-[10px] text-slate-500 flex items-center gap-1 italic"><Forward size={10}/> Forwarded</div>}
                            <div className={`relative px-3 py-2 rounded-lg shadow-sm text-sm ${isMe ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
                                {msg.replyTo && (
                                    <div className="bg-black/5 border-l-4 border-green-600 p-1 mb-1 rounded text-xs">
                                        <div className="font-bold text-green-700">{msg.replyTo.senderName}</div>
                                        <div className="truncate text-slate-600">{msg.replyTo.text}</div>
                                    </div>
                                )}
                                {msg.image && <img src={msg.image} className="max-h-60 rounded-lg mb-1"/>}
                                <div className="pr-6">{msg.text}</div>
                                <div className="text-[10px] text-slate-500 text-right mt-1 flex items-center justify-end gap-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                    {isMe && <CheckCheck size={14} className="text-blue-500"/>}
                                </div>
                                <div className="absolute top-0 right-0 -mr-8 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
                                    <button onClick={() => setReplyingTo(msg)} className="p-1 bg-white rounded-full shadow hover:text-blue-600"><Reply size={14}/></button>
                                    <button onClick={() => setForwardingMsg(msg)} className="p-1 bg-white rounded-full shadow hover:text-blue-600"><Forward size={14}/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>

        <div className="bg-[#f0f2f5] px-4 py-3">
             {replyingTo && (
                <div className="flex items-center justify-between bg-white p-2 rounded-t-lg border-l-4 border-blue-500 mb-2 animate-in slide-in-from-bottom-2">
                    <div className="ml-2">
                         <div className="text-xs font-bold text-blue-600">Replying to {employees.find(e => e.id === replyingTo.senderId)?.name}</div>
                         <div className="text-xs text-slate-500 truncate">{replyingTo.text}</div>
                    </div>
                    <button onClick={() => setReplyingTo(null)}><X size={16} /></button>
                </div>
            )}
            {selectedImage && (
                <div className="mb-2 bg-white p-2 rounded-lg w-fit flex items-start gap-2">
                    <img src={selectedImage} className="h-16 w-16 object-cover rounded"/>
                    <button onClick={() => setSelectedImage(null)}><X size={16}/></button>
                </div>
            )}
            <form onSubmit={handleSend} className="flex gap-2 items-center">
                <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { const reader = new FileReader(); reader.onloadend = () => setSelectedImage(reader.result as string); reader.readAsDataURL(file); }
                }} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full"><ImageIcon/></button>
                <div className="flex-1 bg-white rounded-lg px-4 py-2">
                    <input type="text" placeholder="Type a message" className="w-full bg-transparent outline-none text-sm" value={inputText} onChange={(e) => setInputText(e.target.value)} />
                </div>
                <button type="submit" className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-md shadow-green-200"><Send size={18}/></button>
            </form>
        </div>
      </div>

      {/* Modals */}
      {isNewGroupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="font-bold text-lg mb-1 text-slate-800">New Chat Group</h3>
                  <p className="text-xs text-slate-500 mb-4">Create a space for your team to collaborate.</p>
                  
                  <div className="space-y-1 mb-4">
                      <label className="text-xs font-bold text-slate-400 uppercase">Group Name</label>
                      <input autoFocus type="text" placeholder="e.g., Marketing, Lunch Club" className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                  </div>

                  <div className="flex justify-end gap-2">
                      <button onClick={() => setIsNewGroupModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                      <button onClick={() => { if(newGroupName) { onCreateCustomGroup(newGroupName); setIsNewGroupModalOpen(false); setNewGroupName(''); }}} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30">Create Group</button>
                  </div>
              </div>
          </div>
      )}

      {forwardingMsg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 bg-slate-50 font-bold border-b flex justify-between items-center">
                      <span>Forward to...</span>
                      <button onClick={() => setForwardingMsg(null)} className="p-1 hover:bg-slate-200 rounded-full"><X size={18}/></button>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">Work Groups</div>
                      {workGroups.map(g => (
                          <button key={g.id} onClick={() => handleForward(g.id)} className="w-full text-left p-3 hover:bg-blue-50 border-b border-slate-50 transition-colors flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full bg-${g.color}-100 flex items-center justify-center text-${g.color}-600`}><LayoutGrid size={14}/></div>
                              <span className="font-medium text-slate-700">{g.name}</span>
                          </button>
                      ))}
                      <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">Social Groups</div>
                      {customGroups.map(g => (
                          <button key={g.id} onClick={() => handleForward(g.id)} className="w-full text-left p-3 hover:bg-blue-50 border-b border-slate-50 transition-colors flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full bg-${g.color}-100 flex items-center justify-center text-${g.color}-600`}><User size={14}/></div>
                              <span className="font-medium text-slate-700">{g.name}</span>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ChatView;