import React from 'react';
import { Group, Employee } from '../types';
import { LayoutGrid, Users, Briefcase, Home, Plus, FileText, Percent, Building2, MessageSquare, RefreshCw, Settings2, Lock, Unlock, LogOut, X, ListTodo, CalendarClock, BarChart3, Search, UserPlus, ChevronDown } from 'lucide-react';

interface SidebarProps {
  groups: Group[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string | null) => void;
  onAddGroup: () => void;
  onManageTeam: () => void;
  onEditGroup: (group: Group) => void;
  isAdmin?: boolean;
  onToggleRestriction?: (groupId: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  currentUser: Employee | null;
  allAccounts: Employee[];
  onSwitchAccount: (id: string) => void;
  onAddAccount: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  groups, 
  selectedGroupId, 
  onSelectGroup, 
  onAddGroup, 
  onManageTeam, 
  onEditGroup,
  isAdmin,
  onToggleRestriction,
  isOpen = false,
  onClose,
  onLogout,
  onSearch,
  searchQuery,
  currentUser,
  allAccounts,
  onSwitchAccount,
  onAddAccount
}) => {
  const [showAccounts, setShowAccounts] = React.useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase size={20} />;
      case 'Home': return <Home size={20} />;
      case 'Users': return <Users size={20} />;
      case 'FileText': return <FileText size={20} />;
      case 'Percent': return <Percent size={20} />;
      case 'Building': return <Building2 size={20} />;
      default: return <LayoutGrid size={20} />;
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-slate-50 border-r border-slate-200 
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex flex-col h-full
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        
        {/* Header with Account Switcher */}
        <div className="p-6 pb-2">
          <div className="relative">
              <button 
                onClick={() => setShowAccounts(!showAccounts)}
                className="w-full flex items-center gap-3 p-2 hover:bg-slate-200/50 rounded-xl transition-all group"
              >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm ${currentUser?.color || 'bg-blue-600'}`}>
                      {currentUser?.initials || 'TF'}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                      <h2 className="text-sm font-bold text-slate-800 truncate leading-tight">{currentUser?.name || 'TaskFlow'}</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{currentUser?.email || 'AI Assistant'}</p>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${showAccounts ? 'rotate-180' : ''}`} />
              </button>

              {showAccounts && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                    <p className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50 mb-1">Switch Account</p>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {allAccounts.map(acc => (
                            <button
                                key={acc.id}
                                onClick={() => { onSwitchAccount(acc.id); setShowAccounts(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${currentUser?.id === acc.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white ${acc.color}`}>
                                    {acc.initials}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="text-xs font-bold text-slate-700 truncate">{acc.name}</div>
                                    <div className="text-[10px] text-slate-400 truncate">{acc.email}</div>
                                </div>
                                {currentUser?.id === acc.id && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                            </button>
                        ))}
                    </div>
                    <div className="border-t border-slate-50 mt-1 pt-1">
                        <button 
                            onClick={() => { onAddAccount(); setShowAccounts(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-blue-600 hover:bg-blue-50 transition-colors font-bold text-xs"
                        >
                            <UserPlus size={16} />
                            <span>Add Another Account</span>
                        </button>
                    </div>
                </div>
              )}
          </div>
        </div>

        {/* Global Search Input */}
        <div className="px-4 mt-2 mb-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Search tasks, groups..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1.5 custom-scrollbar">
          
          <div className="pb-2">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Menu</p>
            
            <button
              onClick={() => onSelectGroup('VIEW_HOME')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                selectedGroupId === 'VIEW_HOME'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <LayoutGrid size={20} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onSelectGroup('VIEW_TASKS')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                selectedGroupId === 'VIEW_TASKS'
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <ListTodo size={20} />
              <span>My Tasks</span>
            </button>

            <button
              onClick={() => onSelectGroup('VIEW_DEADLINES')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                selectedGroupId === 'VIEW_DEADLINES'
                  ? 'bg-orange-50 text-orange-700 shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <CalendarClock size={20} />
              <span>Upcoming</span>
            </button>

            <button
              onClick={() => onSelectGroup('VIEW_REPORTS')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                selectedGroupId === 'VIEW_REPORTS'
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <BarChart3 size={20} />
              <span>Work Reports</span>
            </button>

            <button
              onClick={() => onSelectGroup('VIEW_CHAT')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                selectedGroupId === 'VIEW_CHAT'
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <MessageSquare size={20} />
              <span>Team Chat</span>
            </button>
          </div>

          <div className="pt-4 pb-2 px-4 flex items-center justify-between border-t border-slate-200/60">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Work Groups</span>
              <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full">{groups.length}</span>
          </div>

          {groups.map((group) => (
            <div
              key={group.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectGroup(group.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectGroup(group.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group relative overflow-hidden cursor-pointer ${
                selectedGroupId === group.id
                  ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              {selectedGroupId === group.id && (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
              )}
              <span className={`${selectedGroupId === group.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors ml-1`}>
                {group.isRestricted ? <Lock size={20} className="text-red-400" /> : getIcon(group.icon)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate text-sm flex items-center gap-2">
                  {group.name}
                  {group.isRecurring && (
                    <span title="Monthly Recurring">
                         <RefreshCw size={10} className="text-indigo-400" />
                    </span>
                  )}
                </div>
                {selectedGroupId === group.id && group.memberIds.length > 0 && (
                   <div className="text-[10px] text-blue-500 font-medium mt-0.5 flex items-center gap-1">
                     <Users size={10} /> {group.memberIds.length} members
                   </div>
                )}
              </div>

              {/* Quick Actions for Admin */}
              {isAdmin && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10 bg-white/80 backdrop-blur-sm pl-2 rounded-l-lg">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleRestriction) onToggleRestriction(group.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${group.isRestricted ? 'text-red-500 hover:bg-red-50' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'}`}
                    title={group.isRestricted ? "Unlock Group" : "Restrict Group"}
                  >
                    {group.isRestricted ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditGroup(group);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 rounded-lg"
                    title="Edit Group Settings"
                  >
                    <Settings2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-slate-200/50 space-y-2">
           {isAdmin && (
             <button 
              onClick={onAddGroup}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all font-semibold border border-slate-200 hover:border-blue-200 shadow-sm"
            >
              <Plus size={18} />
              <span>Create New Group</span>
            </button>
           )}
          
          {isAdmin && (
            <button 
              onClick={onManageTeam}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all font-medium text-sm"
            >
              <Users size={16} />
              <span>Manage Team</span>
            </button>
          )}

          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;