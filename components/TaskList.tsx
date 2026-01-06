
import React, { useState, useRef, useMemo } from 'react';
import { Task, Group, Employee } from '../types';
import TaskItem from './TaskItem';
import { Plus, Sparkles, Calendar, Home, Settings2, RefreshCw, GripVertical, Filter, SortAsc, CheckCircle2, Circle, Flag, Clock } from 'lucide-react';
import { generateMonthlyPlan } from '../services/geminiService';

interface TaskListProps {
  tasks: Task[];
  groups: Group[];
  activeGroup: Group | null;
  employees: Employee[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAssignTask: (taskId: string, assigneeId: string | undefined) => void;
  onAddTasks: (tasks: Omit<Task, 'id'>[]) => void;
  onEditGroup: (group: Group) => void;
  isDeadlineView?: boolean;
  onOpenMobileMenu: () => void;
  onGoHome: () => void;
  onSelectGroup: (groupId: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  onToggleExpand: (id: string) => void;
  onToggleRecurring: (id: string) => void;
  onReorder: (tasks: Task[]) => void; 
  currentUser: Employee | null;
  isMyTasks?: boolean;
}

type SortOption = 'priority' | 'dueDate' | 'alphabetical' | 'manual';
type FilterStatus = 'all' | 'todo' | 'completed';

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  groups, 
  activeGroup, 
  employees, 
  onAddTask, 
  onToggleComplete, 
  onDeleteTask, 
  onAssignTask,
  onAddTasks, 
  onEditGroup, 
  isDeadlineView,
  onOpenMobileMenu,
  onGoHome,
  onAddSubtask,
  onToggleExpand,
  onToggleRecurring,
  onReorder,
  currentUser,
  isMyTasks
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState<string>('');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string | null>(null);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskFrequency, setNewTaskFrequency] = useState<'none' | 'weekly' | 'monthly'>('none');
  const [generating, setGenerating] = useState(false);
  
  const [sortBy, setSortBy] = useState<SortOption>('manual');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const availableEmployees = activeGroup 
    ? employees.filter(e => activeGroup.memberIds.includes(e.id))
    : employees;

  const calculateAutoDate = (targetDay: number) => {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    if (now.getDate() > targetDay) month++;
    return new Date(year, month, targetDay).toISOString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    let finalDate = newTaskDate;
    if (!finalDate && activeGroup?.defaultDueDay) {
        finalDate = calculateAutoDate(activeGroup.defaultDueDay);
    }
    
    onAddTask({
      title: newTaskTitle,
      dueDate: finalDate || undefined,
      isRecurring: newTaskFrequency !== 'none',
      recurringFrequency: newTaskFrequency !== 'none' ? newTaskFrequency : undefined,
      groupId: activeGroup ? activeGroup.id : 'g1',
      completed: false,
      priority: newTaskPriority,
      assignee: newTaskAssignee || undefined,
      subtasks: []
    });
    setNewTaskTitle('');
    setNewTaskDate('');
    setNewTaskAssignee(null);
    setNewTaskPriority('medium');
    setNewTaskFrequency('none');
    setIsAdding(false);
  };

  const handleGeneratePlan = async () => {
    if (!activeGroup) return;
    setGenerating(true);
    const suggestedTasks = await generateMonthlyPlan(activeGroup.name, activeGroup.description || "compliance work");
    const autoDate = activeGroup.defaultDueDay ? calculateAutoDate(activeGroup.defaultDueDay) : new Date().toISOString();
    const formattedTasks = suggestedTasks.map(t => ({
        title: t.title || "New Task",
        description: t.description,
        isRecurring: activeGroup.isRecurring ?? true,
        recurringFrequency: 'monthly' as const,
        groupId: activeGroup.id,
        completed: false,
        priority: t.priority || 'medium',
        dueDate: autoDate,
        subtasks: []
    }));
    onAddTasks(formattedTasks);
    setGenerating(false);
  };

  const processedTasks = useMemo(() => {
    let filtered = activeGroup ? tasks.filter(t => t.groupId === activeGroup.id) : tasks;
    if (isMyTasks && currentUser) filtered = filtered.filter(t => t.assignee === currentUser.id);
    
    if (filterStatus === 'todo') filtered = filtered.filter(t => !t.completed);
    if (filterStatus === 'completed') filtered = filtered.filter(t => t.completed);

    if (sortBy === 'manual') return filtered;

    return [...filtered].sort((a, b) => {
      if (sortBy === 'priority') {
        const pMap = { high: 3, medium: 2, low: 1 };
        const diff = pMap[b.priority] - pMap[a.priority];
        if (diff !== 0) return diff;
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return a.title.localeCompare(b.title);
    });
  }, [tasks, activeGroup, isMyTasks, currentUser, filterStatus, sortBy]);

  // Separate for sectioning in UI if needed, but dragging uses processedTasks
  const incompleteTasks = processedTasks.filter(t => !t.completed);
  const completedTasks = processedTasks.filter(t => t.completed);

  const handleDragStart = (e: React.DragEvent, position: number) => { 
    if (sortBy !== 'manual' || filterStatus === 'completed') return;
    dragItem.current = position; 
  };
  
  const handleDragEnter = (e: React.DragEvent, position: number) => { 
    if (sortBy !== 'manual' || filterStatus === 'completed') return;
    dragOverItem.current = position; 
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    const itemsCopy = [...processedTasks];
    const dragItemContent = itemsCopy[dragItem.current];
    itemsCopy.splice(dragItem.current, 1);
    itemsCopy.splice(dragOverItem.current, 0, dragItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    onReorder(itemsCopy);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative font-sans">
      
      {/* Header */}
      <div className="px-6 pt-6 pb-2 bg-white z-10 sticky top-0 border-b border-slate-100/50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
              <button onClick={onGoHome} className="p-2 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Dashboard">
                <Home size={22} />
              </button>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                {isDeadlineView ? 'Deadlines' : (activeGroup ? activeGroup.name : (isMyTasks ? 'My Tasks' : 'All Tasks'))}
                {activeGroup && (
                    <button onClick={() => onEditGroup(activeGroup)} className="text-slate-400 hover:text-blue-600">
                        <Settings2 size={18} />
                    </button>
                )}
              </h1>
          </div>

          {activeGroup && (
            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-full text-xs font-bold transition-all shadow-lg shadow-indigo-200"
            >
              <Sparkles size={14} className={generating ? "animate-spin" : ""} />
              <span>AI GENERATE PLAN</span>
            </button>
          )}
        </div>

        {/* View Options Bar */}
        <div className="flex items-center justify-between py-2 border-t border-slate-50 mt-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button 
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${filterStatus === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  ALL
                </button>
                <button 
                  onClick={() => setFilterStatus('todo')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${filterStatus === 'todo' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  ACTIVE
                </button>
                <button 
                  onClick={() => setFilterStatus('completed')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${filterStatus === 'completed' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  DONE
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <SortAsc size={14} className="text-slate-400" />
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="text-[10px] font-bold text-slate-500 bg-transparent outline-none cursor-pointer hover:text-blue-600 uppercase tracking-wider"
                    >
                        <option value="manual">Custom Order</option>
                        <option value="priority">Priority</option>
                        <option value="dueDate">Due Date</option>
                        <option value="alphabetical">Name</option>
                    </select>
                </div>
            </div>
        </div>
      </div>

      {!isDeadlineView && (
        <div className="px-6 py-2 mt-4">
            {!isAdding ? (
            <button 
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center gap-3 text-slate-500 hover:text-blue-600 transition-colors py-4 px-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30"
            >
                <Plus size={18} className="text-blue-600" />
                <span className="font-bold text-sm tracking-tight">Add an urgent task...</span>
            </button>
            ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-5 animate-in fade-in zoom-in-95 duration-200 space-y-4">
                <input autoFocus type="text" placeholder="Task title..." className="w-full text-lg font-bold text-slate-800 outline-none" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
                
                <div className="flex flex-wrap items-center gap-4 py-4 border-y border-slate-50">
                  {/* Due Date */}
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Calendar size={14} className="text-blue-500" />
                    <input type="date" className="text-xs font-bold bg-transparent outline-none text-slate-600" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} />
                  </div>

                  {/* Priority */}
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Flag size={14} className={newTaskPriority === 'high' ? 'text-red-500' : 'text-slate-400'} />
                    <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as any)} className="text-xs font-bold bg-transparent outline-none text-slate-600">
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  {/* Recurring */}
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <RefreshCw size={14} className={newTaskFrequency !== 'none' ? 'text-indigo-500' : 'text-slate-400'} />
                    <select value={newTaskFrequency} onChange={(e) => setNewTaskFrequency(e.target.value as any)} className="text-xs font-bold bg-transparent outline-none text-slate-600">
                      <option value="none">One-time</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign:</span>
                    {availableEmployees.length > 0 && (
                        <div className="flex -space-x-1">
                          {availableEmployees.map(emp => (
                            <button key={emp.id} type="button" onClick={() => setNewTaskAssignee(newTaskAssignee === emp.id ? null : emp.id)} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white transition-all ring-2 ring-white ${emp.color} ${newTaskAssignee === emp.id ? 'ring-blue-500 scale-110 z-10 shadow-lg' : 'opacity-70'}`}>
                                {emp.initials}
                            </button>
                          ))}
                        </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                      <button type="button" onClick={() => setIsAdding(false)} className="text-xs font-bold text-slate-400 px-4 py-2 hover:bg-slate-50 rounded-lg">CANCEL</button>
                      <button type="submit" disabled={!newTaskTitle} className="text-xs font-bold bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-30 shadow-lg shadow-blue-100">SAVE TASK</button>
                  </div>
                </div>
            </form>
            )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 pb-20 custom-scrollbar mt-4 space-y-1">
        {processedTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <CheckCircle2 size={48} strokeWidth={1} />
                <p className="mt-4 font-bold text-sm tracking-widest uppercase">Cleared for now</p>
            </div>
        )}

        {/* Main Draggable List (handles 'all' and 'todo') */}
        {processedTasks.map((task, index) => {
            // Only allow dragging of the main items
            const isDraggable = sortBy === 'manual' && filterStatus !== 'completed';
            
            return (
                <div 
                  key={task.id} 
                  draggable={isDraggable} 
                  onDragStart={(e) => handleDragStart(e, index)} 
                  onDragEnter={(e) => handleDragEnter(e, index)} 
                  onDragEnd={handleDragEnd} 
                  onDragOver={(e) => e.preventDefault()} 
                  className={`flex items-start gap-2 group/dnd ${task.completed ? 'opacity-60' : ''}`}
                >
                    <div className={`pt-4 transition-opacity ${isDraggable ? 'opacity-0 group-hover/dnd:opacity-30 cursor-grab active:cursor-grabbing' : 'opacity-0'}`}>
                        <GripVertical size={16} />
                    </div>
                    <div className="flex-1">
                        <TaskItem task={task} onToggleComplete={onToggleComplete} onDelete={onDeleteTask} onAssign={onAssignTask} onAddSubtask={onAddSubtask} onToggleExpand={onToggleExpand} onToggleRecurring={onToggleRecurring} group={groups.find(g => g.id === task.groupId)} assignee={employees.find(e => e.id === task.assignee)} availableEmployees={availableEmployees} />
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default TaskList;
