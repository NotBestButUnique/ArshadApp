
import React, { useState, useMemo } from 'react';
import { Task, Group, Employee } from '../types';
import { Check, Repeat, Sparkles, Trash2, Calendar, User, ChevronRight, ChevronDown, CornerDownRight, Clock, AlertTriangle } from 'lucide-react';
import { suggestSubtasks } from '../services/geminiService';

interface TaskItemProps {
  task: Task;
  group?: Group;
  assignee?: Employee;
  availableEmployees?: Employee[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAssign?: (taskId: string, assigneeId: string | undefined) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  onToggleExpand: (id: string) => void;
  onToggleRecurring: (id: string) => void;
  depth?: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  group, 
  assignee, 
  availableEmployees, 
  onToggleComplete, 
  onDelete, 
  onAssign,
  onAddSubtask,
  onToggleExpand,
  onToggleRecurring,
  depth = 0
}) => {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  const currentSubtasks = task.subtasks || [];
  const hasSubtasks = currentSubtasks.length > 0;
  const isExpanded = task.isExpanded || false;

  const isNearingDue = useMemo(() => {
    if (task.completed || !task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate <= today;
  }, [task.dueDate, task.completed]);

  const priorityStyles = {
    high: { border: 'border-red-500', text: 'text-red-600', bg: 'bg-red-50', label: 'URGENT' },
    medium: { border: 'border-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', label: 'MEDIUM' },
    low: { border: 'border-slate-300', text: 'text-slate-500', bg: 'bg-slate-50', label: 'LOW' }
  };

  const style = priorityStyles[task.priority] || priorityStyles.low;

  const handleAISubtasks = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasSubtasks) {
      onToggleExpand(task.id);
      return;
    }
    setLoadingAI(true);
    onToggleExpand(task.id);
    const steps = await suggestSubtasks(task.title);
    steps.forEach(step => onAddSubtask(task.id, step));
    setLoadingAI(false);
  };

  const handleManualAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    onAddSubtask(task.id, newSubtask.trim());
    setNewSubtask('');
  };

  return (
    <>
    <div 
      className={`group relative transition-all duration-200 border-l-4 rounded-r-xl border-y border-r border-transparent hover:border-slate-100 hover:shadow-md hover:bg-slate-50 px-3 py-2 mb-1 ${style.border} ${isNearingDue ? 'animate-blink-red' : 'bg-white'}`}
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
            task.completed ? 'bg-green-500 border-green-500 shadow-lg shadow-green-100' : 'border-slate-200 hover:border-blue-400 bg-white'
          }`}
        >
          {task.completed && <Check size={14} className="text-white" strokeWidth={4} />}
        </button>

        <div className="flex-1 min-w-0" onClick={() => onToggleExpand(task.id)}>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <span className={`text-base font-bold text-slate-800 tracking-tight leading-tight ${task.completed ? 'line-through text-slate-300' : ''}`}>
                    {task.title}
                </span>
                {isNearingDue && <AlertTriangle size={14} className="text-red-500 animate-pulse" />}
            </div>
            
            <div className="flex items-center gap-3 mt-2 min-h-[20px] flex-wrap">
              {/* Priority Badge */}
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border} uppercase tracking-widest`}>
                {style.label}
              </span>

              {group && (
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest text-${group.color}-600 bg-${group.color}-50 border border-${group.color}-200`}>
                      {group.name}
                  </span>
              )}

              {/* Recurring Toggle Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleRecurring(task.id); }}
                className={`flex items-center gap-1.5 text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest transition-all ${
                  task.isRecurring 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                    : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 hover:opacity-100'
                }`}
                title={task.isRecurring ? "Currently Monthly Recurring" : "Click to make recurring"}
              >
                <Repeat size={10} className={task.isRecurring ? 'animate-spin-slow' : ''} />
                {task.isRecurring ? 'Recurring' : 'One-time'}
              </button>

              {assignee && (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 pl-0.5 pr-2 py-0.5 rounded-full">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white relative ${assignee.color}`}>
                    {assignee.initials}
                    {assignee.status === 'pending' && <Clock size={6} className="absolute -top-1 -right-1 text-amber-500" />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600">{assignee.name.split(' ')[0]}</span>
                </div>
              )}

              {task.dueDate && (
                 <span className={`flex items-center gap-1 text-[10px] font-bold ${isNearingDue ? 'text-red-600' : 'text-slate-400'}`}>
                   <Calendar size={10} />
                   {new Date(task.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                 </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={handleAISubtasks} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
             <Sparkles size={16} className={loadingAI ? "animate-spin" : ""} />
           </button>
           <button onClick={() => onDelete(task.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              <Trash2 size={16} />
            </button>
            <button onClick={() => onToggleExpand(task.id)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
        </div>
      </div>
    </div>

    {isExpanded && (
        <div className="animate-in slide-in-from-top-2 duration-200 pb-2">
            {currentSubtasks.map((subtask) => (
                <TaskItem key={subtask.id} task={subtask} onToggleComplete={onToggleComplete} onDelete={onDelete} onAddSubtask={onAddSubtask} onToggleExpand={onToggleExpand} onToggleRecurring={onToggleRecurring} depth={depth + 1} />
            ))}
            <form onSubmit={handleManualAddSubtask} className="flex items-center gap-2 mt-1 pr-4" style={{ marginLeft: `${(depth + 1) * 20}px` }}>
                <CornerDownRight size={14} className="text-slate-300" />
                <input type="text" placeholder="Quick subtask..." className="flex-1 text-xs bg-slate-50 border border-transparent focus:border-slate-200 outline-none rounded-lg px-3 py-2 text-slate-600" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} />
            </form>
        </div>
    )}
    </>
  );
};

export default TaskItem;
