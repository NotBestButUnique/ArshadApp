import React from 'react';
import { Task, Employee } from '../types';
import { CheckCircle2, CalendarClock, ListTodo, ArrowRight, Bell, Sparkles, TrendingUp } from 'lucide-react';

interface DashboardProps {
  currentUser: Employee | null;
  tasks: Task[];
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, tasks, onNavigate }) => {
  // Filter for Current User (Team Member View)
  const myTasks = tasks.filter(t => !t.completed && (t.assignee === currentUser?.id));
  const tasksDueToday = myTasks.filter(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      const today = new Date();
      return due.toDateString() === today.toDateString();
  });
  const upcomingTasks = myTasks.filter(t => t.dueDate && new Date(t.dueDate) > new Date());
  
  // Get greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex-1 h-full bg-slate-50 overflow-y-auto custom-scrollbar p-6 md:p-10">
      
      {/* Header Section */}
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
          {greeting}, {currentUser?.name.split(' ')[0] || 'Team'}
        </h1>
        <p className="text-slate-500 text-lg">
          Here is your personal work dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div 
            onClick={() => onNavigate('VIEW_TASKS')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <ListTodo size={24} />
            </div>
            <span className="text-3xl font-bold text-slate-800">{myTasks.length}</span>
          </div>
          <h3 className="font-semibold text-slate-700">My Pending Tasks</h3>
          <p className="text-xs text-slate-400 mt-1">Assigned to you</p>
        </div>

        <div 
            onClick={() => onNavigate('VIEW_DEADLINES')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
              <CalendarClock size={24} />
            </div>
            <span className="text-3xl font-bold text-slate-800">{tasksDueToday.length}</span>
          </div>
          <h3 className="font-semibold text-slate-700">Due Today</h3>
          <p className="text-xs text-slate-400 mt-1">{upcomingTasks.length} upcoming later</p>
        </div>

        <div 
             onClick={() => onNavigate('VIEW_CHAT')}
             className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 text-white cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-10 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-white/20 rounded-xl">
                 <Bell size={24} />
               </div>
               <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">Active</span>
            </div>
            <h3 className="font-bold text-lg mb-1">Team Updates</h3>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
               <span>Check latest messages</span>
               <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity / Quick Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <TrendingUp size={18} className="text-blue-500"/>
                 High Priority (You)
               </h3>
               <button onClick={() => onNavigate('VIEW_TASKS')} className="text-sm text-blue-600 hover:underline">View All</button>
            </div>
            
            <div className="space-y-3">
               {myTasks.filter(t => t.priority === 'high').slice(0, 3).map(task => (
                 <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-2 h-10 rounded-full bg-red-400"></div>
                    <div className="flex-1">
                       <div className="font-medium text-slate-700 text-sm">{task.title}</div>
                       <div className="text-xs text-slate-400">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</div>
                    </div>
                 </div>
               ))}
               {myTasks.filter(t => t.priority === 'high').length === 0 && (
                   <div className="text-center py-8 text-slate-400 text-sm">No high priority tasks assigned to you.</div>
               )}
            </div>
         </div>

         <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
             <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <Sparkles size={32} className="text-purple-500" />
             </div>
             <h3 className="font-bold text-slate-800 mb-2">AI Task Assistant</h3>
             <p className="text-sm text-slate-500 mb-6">Need help breaking down your work? Use the AI wand on any of your tasks to generate subtasks.</p>
             <button onClick={() => onNavigate('VIEW_TASKS')} className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
                Go to My Tasks
             </button>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;