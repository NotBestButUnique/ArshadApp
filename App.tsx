
import React, { useState, useEffect } from 'react';
import Intro from './components/Intro';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import ChatView from './components/ChatView';
import Dashboard from './components/Dashboard';
import ReportView from './components/ReportView';
import SearchView from './components/SearchView';
import CreateGroupModal from './components/CreateGroupModal';
import TeamManagementModal from './components/TeamManagementModal';
import WaterReminderModal from './components/WaterReminderModal';
import { Task, Group, ViewState, Employee, ChatGroup } from './types';
import { Settings, Shield, ShieldCheck, Bell, Mail, CheckCircle, Info, Send, UserPlus } from 'lucide-react';
import { jwtDecode } from "jwt-decode";

// --- Desktop Notification Helper ---
const NotificationToast: React.FC<{ message: string; type: 'success' | 'info' | 'email' }> = ({ message, type }) => (
  <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-10 duration-300">
    <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold ${
      type === 'email' ? 'bg-indigo-600 text-white border-indigo-400' : 
      type === 'success' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-white text-slate-800 border-slate-200'
    }`}>
      {type === 'email' ? <Send size={18} /> : type === 'success' ? <CheckCircle size={18} /> : <Info size={18} />}
      <span>{message}</span>
    </div>
  </div>
);

// --- Audio Engine ---
const playSound = (type: 'message' | 'completion' | 'assign' | 'notification') => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            const now = ctx.currentTime;
            if (type === 'message') {
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'completion') {
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.1);
                osc.frequency.setValueAtTime(783.99, now + 0.2);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                osc.start(now);
                osc.stop(now + 0.6);
            } else if (type === 'assign') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.setValueAtTime(1500, now + 0.1);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            } else if (type === 'notification') {
                osc.frequency.setValueAtTime(880, now); 
                gain.gain.setValueAtTime(0.05, now);
                osc.start(now);
                gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.2);
                osc.stop(now + 0.2);
            }
        }
    } catch (e) { console.error("Audio error", e); }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Rahul Sharma', email: 'rahul@taskflow.com', role: 'Tax Consultant', initials: 'RS', color: 'bg-blue-500', status: 'active' },
  { id: 'e2', name: 'Priya Patel', email: 'priya@taskflow.com', role: 'Senior Accountant', initials: 'PP', color: 'bg-emerald-500', status: 'active' },
  { id: 'e3', name: 'Amit Singh', email: 'amit@taskflow.com', role: 'Audit Manager', initials: 'AS', color: 'bg-purple-500', status: 'active' },
  { id: 'e4', name: 'Sneha Gupta', email: 'sneha@taskflow.com', role: 'Compliance Officer', initials: 'SG', color: 'bg-amber-500', status: 'active' },
  { id: 'e5', name: 'Vikram Malhotra', email: 'vikram@taskflow.com', role: 'GST Specialist', initials: 'VM', color: 'bg-rose-500', status: 'active' },
];

const INITIAL_GROUPS: Group[] = [
  { id: 'g1', name: 'Group 1', icon: 'FileText', color: 'blue', description: 'Income Tax Compliance & Filings', memberIds: ['e1', 'e3'], defaultDueDay: 15, isRecurring: true, isRestricted: false, mutedBy: [] },
  { id: 'g2', name: 'Group 2', icon: 'Percent', color: 'purple', description: 'GST Returns & Reconciliations', memberIds: ['e2', 'e5'], defaultDueDay: 20, isRecurring: true, isRestricted: false, mutedBy: [] },
];

const INITIAL_TASKS: Task[] = [
  { 
    id: 't1', 
    title: 'File GSTR-1 for Client Alpha', 
    completed: false, 
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 11).toISOString(), 
    isRecurring: true, 
    recurringFrequency: 'monthly', 
    groupId: 'g2', 
    priority: 'high',
    description: 'Upload B2B invoices and verify e-invoices.',
    subtasks: [
        { id: 'st1', title: 'Download sales register', completed: false, groupId: 'g2', priority: 'medium', isRecurring: false, subtasks: [] },
        { id: 'st2', title: 'Verify e-invoices on portal', completed: false, groupId: 'g2', priority: 'medium', isRecurring: false, subtasks: [] },
        { id: 'st3', title: 'Generate JSON', completed: false, groupId: 'g2', priority: 'medium', isRecurring: false, subtasks: [] }
    ]
  },
  { 
    id: 't2', 
    title: 'Pay Advance Tax Installment', 
    completed: false, 
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString(), 
    isRecurring: true, 
    recurringFrequency: 'monthly', 
    groupId: 'g1', 
    priority: 'high',
    subtasks: []
  },
];

const VIEW_HOME = 'VIEW_HOME';
const VIEW_TASKS = 'VIEW_TASKS';
const VIEW_DEADLINES = 'VIEW_DEADLINES';
const VIEW_CHAT = 'VIEW_CHAT';
const VIEW_REPORTS = 'VIEW_REPORTS';
const VIEW_SEARCH = 'VIEW_SEARCH';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [viewState, setViewState] = useState<ViewState>(ViewState.LOGIN);
  
  // Persistent State Init
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskflow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('taskflow_groups');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_groups', JSON.stringify(groups));
  }, [groups]);

  const [customChatGroups, setCustomChatGroups] = useState<ChatGroup[]>([
    { id: 'c1', name: 'Office Lunch', type: 'social', color: 'orange', memberIds: ['e1', 'e2', 'e3', 'e4', 'e5'], mutedBy: [] }
  ]);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(VIEW_HOME); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isAdmin, setIsAdmin] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [waterInterval, setWaterInterval] = useState(20);
  const [isWaterEnabled, setIsWaterEnabled] = useState(true);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [allAccounts, setAllAccounts] = useState<Employee[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'email' } | null>(null);

  useEffect(() => {
    if (viewState === ViewState.APP && isWaterEnabled) {
        const intervalMs = waterInterval * 60 * 1000;
        const intervalId = setInterval(() => {
             playSound('notification'); 
             if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Hydration Check 💧", { body: "Time to drink water!" });
            }
        }, intervalMs);
        return () => clearInterval(intervalId);
    }
  }, [viewState, isWaterEnabled, waterInterval]);

  const showToast = (message: string, type: 'success' | 'info' | 'email') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const finalizeAccount = (user: Employee) => {
    setAllAccounts(prev => {
        const exists = prev.find(acc => acc.email === user.email);
        if (exists) return prev;
        return [...prev, user];
    });
    setCurrentUser(user);
    setViewState(ViewState.APP);
    setActiveGroupId(VIEW_HOME);
  };

  const handleLogin = (credentialResponse: string) => {
    try {
      const decoded: any = jwtDecode(credentialResponse);
      const email = decoded.email;
      const existingInvite = employees.find(e => e.email?.toLowerCase() === email?.toLowerCase() && e.status === 'pending');

      let user: Employee;
      if (existingInvite) {
          user = { ...existingInvite, status: 'active', name: decoded.name || existingInvite.name };
          setEmployees(prev => prev.map(e => e.id === existingInvite.id ? user : e));
          showToast(`Welcome! Account active and data linked.`, 'success');
      } else {
          user = {
            id: decoded.sub || generateId(),
            name: decoded.name || 'TaskFlow User',
            email: decoded.email,
            role: 'Team Member',
            initials: (decoded.name || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
            color: 'bg-blue-600',
            status: 'active'
          };
          setEmployees(prev => {
            const exists = prev.find(e => e.email === user.email);
            if (exists) return prev;
            return [...prev, user];
          });
          showToast(`Welcome back, ${user.name}!`, 'success');
      }
      finalizeAccount(user);
    } catch (error) {
      console.error("Login Error:", error);
      showToast("Identity verification failed. Try again.", 'info');
    }
  };

  const handleEmailLogin = (email: string, name: string) => {
    const existingInvite = employees.find(e => e.email?.toLowerCase() === email?.toLowerCase() && e.status === 'pending');
    let user: Employee;

    if (existingInvite) {
        user = { ...existingInvite, status: 'active', name: name };
        setEmployees(prev => prev.map(e => e.id === existingInvite.id ? user : e));
        showToast(`Linked! All your work data is ready.`, 'success');
    } else {
        user = {
          id: generateId(),
          name: name,
          email: email,
          role: 'Project Member',
          initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          color: 'bg-indigo-600',
          status: 'active'
        };
        setEmployees(prev => [...prev, user]);
        showToast(`Hello, ${name}!`, 'success');
    }
    finalizeAccount(user);
  };

  const handleGuestLogin = () => {
    const guestUser: Employee = {
      id: 'guest_' + generateId(),
      name: 'Guest Admin',
      email: 'guest@taskflow.local',
      role: 'Project Manager (Guest)',
      initials: 'GA',
      color: 'bg-slate-700',
      status: 'active'
    };
    setEmployees(prev => [...prev, guestUser]);
    setIsAdmin(true); 
    finalizeAccount(guestUser);
    showToast("Entered as Guest Administrator", 'info');
  };

  const handleSwitchAccount = (accountId: string) => {
      const account = allAccounts.find(acc => acc.id === accountId);
      if (account) {
          setCurrentUser(account);
          showToast(`Switched to ${account.name}`, 'info');
      }
  };

  const handleAddAnotherAccount = () => {
      setViewState(ViewState.LOGIN);
  };

  const handleLogout = () => {
    if (currentUser) {
        const remaining = allAccounts.filter(acc => acc.id !== currentUser.id);
        setAllAccounts(remaining);
        if (remaining.length > 0) {
            setCurrentUser(remaining[0]);
            showToast(`Signed out of ${currentUser.name}. Switched to ${remaining[0].name}`, 'info');
        } else {
            setCurrentUser(null);
            setViewState(ViewState.LOGIN);
            showToast("Successfully signed out.", 'info');
        }
    }
  };

  const updateTaskRecursive = (taskList: Task[], taskId: string, updater: (t: Task) => Task): Task[] => {
      return taskList.map(t => {
          if (t.id === taskId) return updater(t);
          if (t.subtasks && t.subtasks.length > 0) return { ...t, subtasks: updateTaskRecursive(t.subtasks, taskId, updater) };
          return t;
      });
  };

  const findTaskById = (taskList: Task[], taskId: string): Task | null => {
      for (const t of taskList) {
          if (t.id === taskId) return t;
          if (t.subtasks) {
              const found = findTaskById(t.subtasks, taskId);
              if (found) return found;
          }
      }
      return null;
  };

  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const task: Task = { ...newTask, id: generateId(), subtasks: [] };
    setTasks(prev => [task, ...prev]);
    if (task.assignee) {
        handleAllotmentNotification(task);
    }
  };

  const handleAllotmentNotification = (task: Task) => {
    const group = groups.find(g => g.id === task.groupId);
    if (!group) return;
    playSound('assign');
    showToast(`Task Allotted: "${task.title}"`, 'success');
    const memberEmails = employees.filter(e => group.memberIds.includes(e.id)).map(e => e.email).filter(Boolean);
    setTimeout(() => { showToast(`Syncing to ${memberEmails.length} member mailboxes.`, 'email'); }, 800);
  };

  const handleAssignTask = (taskId: string, assigneeId: string | undefined) => {
    setTasks(prev => updateTaskRecursive(prev, taskId, (t) => ({ ...t, assignee: assigneeId })));
    if (assigneeId) {
        const task = findTaskById(tasks, taskId);
        if (task) { handleAllotmentNotification({ ...task, assignee: assigneeId }); }
    }
  };

  const handleToggleRecurring = (taskId: string) => {
    setTasks(prev => updateTaskRecursive(prev, taskId, (t) => {
        const newState = !t.isRecurring;
        return {
            ...t,
            isRecurring: newState,
            recurringFrequency: newState ? 'monthly' : undefined
        };
    }));
    showToast("Updated recurring preference", "info");
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev => {
        let newTasks = [...prev];
        const task = findTaskById(newTasks, id);
        if (task) {
            const newStatus = !task.completed;
            if (newStatus) {
                playSound('completion');
                if (task.isRecurring && task.recurringFrequency) {
                    const nextDate = new Date(task.dueDate || new Date());
                    if (task.recurringFrequency === 'monthly') { nextDate.setMonth(nextDate.getMonth() + 1); } 
                    else if (task.recurringFrequency === 'weekly') { nextDate.setDate(nextDate.getDate() + 7); }
                    const nextTask: Task = {
                        ...task, id: generateId(), completed: false, completedAt: undefined,
                        dueDate: nextDate.toISOString(),
                        subtasks: task.subtasks?.map(st => ({ ...st, id: generateId(), completed: false })) || []
                    };
                    newTasks = [nextTask, ...newTasks];
                    showToast(`Recurring task "${task.title}" scheduled for next period.`, 'info');
                }
            }
            return updateTaskRecursive(newTasks, id, (t) => ({ ...t, completed: newStatus, completedAt: newStatus ? new Date().toISOString() : undefined }));
        }
        return newTasks;
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id).map(t => ({...t, subtasks: t.subtasks?.filter(st => st.id !== id)})));
  };

  const handleToggleExpand = (id: string) => {
      setTasks(prev => updateTaskRecursive(prev, id, (t) => ({...t, isExpanded: !t.isExpanded})));
  };

  const handleSaveGroup = (name: string, description: string, memberIds: string[], defaultDueDay?: number, isRecurring?: boolean, isRestricted?: boolean) => {
    if (editingGroup) {
      setGroups(prev => prev.map(g => g.id === editingGroup.id ? { ...g, name, description, memberIds, defaultDueDay, isRecurring, isRestricted, mutedBy: g.mutedBy || [] } : g));
    } else {
      const newGroup: Group = { id: generateId(), name, description, icon: 'Briefcase', color: 'blue', memberIds, defaultDueDay, isRecurring, isRestricted, mutedBy: [] };
      setGroups(prev => [...prev, newGroup]);
      setActiveGroupId(newGroup.id);
    }
  };
  
  const handleToggleRestriction = (gid: string) => { if (!isAdmin) return; setGroups(prev => prev.map(g => g.id === gid ? { ...g, isRestricted: !g.isRestricted } : g)); };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) { setActiveGroupId(VIEW_SEARCH); } 
    else if (activeGroupId === VIEW_SEARCH) { setActiveGroupId(VIEW_HOME); }
  };

  const handleAddEmployee = (name: string, role: string, email: string) => {
      const newEmp: Employee = { id: generateId(), name, role, email, initials: name.substring(0,2).toUpperCase(), color: 'bg-blue-500', status: 'pending' };
      setEmployees(p => [...p, newEmp]);
      playSound('assign');
      showToast(`Invitation sent to ${email}`, 'email');
  };

  const isHome = activeGroupId === VIEW_HOME;
  const isDeadlineView = activeGroupId === VIEW_DEADLINES;
  const isChatView = activeGroupId === VIEW_CHAT;
  const isMyTasks = activeGroupId === VIEW_TASKS;
  const isReportView = activeGroupId === VIEW_REPORTS;
  const isSearchView = activeGroupId === VIEW_SEARCH;
  const activeGroup = !isHome && !isDeadlineView && !isChatView && !isMyTasks && !isReportView && !isSearchView && activeGroupId ? groups.find(g => g.id === activeGroupId) || null : null;

  if (showIntro) {
    return <Intro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <>
      {viewState === ViewState.LOGIN && (
        <Login onLogin={handleLogin} onGuestLogin={handleGuestLogin} onEmailLogin={handleEmailLogin} />
      )}
      {viewState === ViewState.APP && (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative">
          {toast && <NotificationToast message={toast.message} type={toast.type} />}
          <div className="relative z-10 flex h-screen max-w-[1800px] mx-auto overflow-hidden">
            <Sidebar 
              groups={groups} 
              selectedGroupId={activeGroupId} 
              onSelectGroup={(id) => { setActiveGroupId(id); setIsMobileMenuOpen(false); setSearchQuery(''); }}
              onAddGroup={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
              onManageTeam={() => setIsTeamModalOpen(true)}
              onEditGroup={(g) => { setEditingGroup(g); setIsGroupModalOpen(true); }}
              isAdmin={isAdmin}
              onToggleRestriction={handleToggleRestriction}
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
              onLogout={handleLogout}
              onSearch={handleSearch}
              searchQuery={searchQuery}
              currentUser={currentUser}
              allAccounts={allAccounts}
              onSwitchAccount={handleSwitchAccount}
              onAddAccount={handleAddAnotherAccount}
            />
            <main className="flex-1 flex flex-col relative bg-white shadow-2xl md:my-3 md:mr-3 md:rounded-2xl overflow-hidden border border-slate-200/60">
              <div className="absolute top-6 right-8 z-20 flex items-center gap-4">
                 <button onClick={() => setIsWaterModalOpen(true)} className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold border border-blue-100">
                   <Bell size={12} /> <span>{isWaterEnabled ? `Hydration (${waterInterval}m)` : 'Off'}</span>
                 </button>
                 <button onClick={() => setIsAdmin(!isAdmin)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isAdmin ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200'}`}>
                    {isAdmin ? <ShieldCheck size={16} /> : <Shield size={16} />}
                    <span className="text-xs font-medium">{isAdmin ? 'Admin' : 'Viewer'}</span>
                 </button>
              </div>
              
              {isHome ? (
                 <Dashboard currentUser={currentUser} tasks={tasks} onNavigate={(view) => setActiveGroupId(view)} />
              ) : isReportView ? (
                 <ReportView tasks={tasks} employees={employees} groups={groups} />
              ) : isSearchView ? (
                 <SearchView 
                    query={searchQuery} 
                    tasks={tasks} 
                    groups={groups} 
                    onNavigateGroup={(id) => { setActiveGroupId(id); setSearchQuery(''); }}
                    employees={employees}
                 />
              ) : isChatView && currentUser ? (
                  <ChatView 
                    employees={employees} currentUser={currentUser} workGroups={groups} customGroups={customChatGroups} isAdmin={isAdmin}
                    onCreateCustomGroup={(n) => setCustomChatGroups(prev => [...prev, { id: generateId(), name: n, type: 'social', color: 'indigo', memberIds: employees.map(e => e.id), mutedBy: [] }])} 
                    onUpdateCustomGroup={(g) => setCustomChatGroups(p => p.map(x => x.id === g.id ? g : x))} 
                    onUpdateWorkGroup={(g) => setGroups(p => p.map(x => x.id === g.id ? g : x))} 
                    playSound={() => playSound('message')}
                  />
              ) : (
                  <TaskList 
                    tasks={tasks} groups={groups} activeGroup={activeGroup} employees={employees}
                    onAddTask={handleAddTask} onAddTasks={(ts) => ts.forEach(t => handleAddTask(t))} 
                    onToggleComplete={handleToggleComplete} onDeleteTask={handleDeleteTask}
                    onAssignTask={handleAssignTask} onEditGroup={(g) => { setEditingGroup(g); setIsGroupModalOpen(true); }} 
                    isDeadlineView={isDeadlineView} onOpenMobileMenu={() => setIsMobileMenuOpen(true)} onGoHome={() => setActiveGroupId(VIEW_HOME)}
                    onSelectGroup={(id) => { setActiveGroupId(id); setIsMobileMenuOpen(false); }}
                    onAddSubtask={(p, t) => setTasks(prev => updateTaskRecursive(prev, p, (task) => ({...task, subtasks: [...(task.subtasks || []), { id: generateId(), title: t, completed: false, groupId: task.groupId, isRecurring: false, priority: 'medium', subtasks: [] }], isExpanded: true })))}
                    onToggleExpand={handleToggleExpand}
                    onToggleRecurring={handleToggleRecurring}
                    onReorder={(newOrder) => {
                      setTasks(prev => {
                        // Create a map of updated tasks
                        const updatedIds = new Set(newOrder.map(t => t.id));
                        // Keep the rest of the tasks as they were
                        const rest = prev.filter(t => !updatedIds.has(t.id));
                        // Result: Reordered items at top, rest preserved
                        return [...newOrder, ...rest];
                      });
                    }}
                    currentUser={currentUser} isMyTasks={isMyTasks}
                  />
              )}
            </main>
          </div>
        </div>
      )}
      <WaterReminderModal isOpen={isWaterModalOpen} onClose={() => setIsWaterModalOpen(false)} currentInterval={waterInterval} enabled={isWaterEnabled} onSave={(i, e) => { setWaterInterval(i); setIsWaterEnabled(e); }} />
      <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} onSave={handleSaveGroup} employees={employees} initialData={editingGroup} />
      {isAdmin && <TeamManagementModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} employees={employees} onAddEmployee={handleAddEmployee} onRemoveEmployee={(id) => setEmployees(p => p.filter(e => e.id !== id))} />}
    </>
  );
};

export default App;
