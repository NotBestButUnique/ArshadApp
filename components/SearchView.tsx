
import React from 'react';
import { Task, Group, Employee } from '../types';
// Added missing CheckCircle icon to the lucide-react imports
import { Search, ListTodo, Users, ArrowRight, Calendar, User, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface SearchViewProps {
  query: string;
  tasks: Task[];
  groups: Group[];
  employees: Employee[];
  onNavigateGroup: (id: string) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ query, tasks, groups, employees, onNavigateGroup }) => {
  const normalizedQuery = query.toLowerCase().trim();

  // Recursive task search helper
  const searchTasksRecursive = (taskList: Task[]): Task[] => {
    let results: Task[] = [];
    taskList.forEach(t => {
      if (
        t.title.toLowerCase().includes(normalizedQuery) || 
        t.description?.toLowerCase().includes(normalizedQuery)
      ) {
        results.push(t);
      }
      if (t.subtasks && t.subtasks.length > 0) {
        results = [...results, ...searchTasksRecursive(t.subtasks)];
      }
    });
    return results;
  };

  const filteredTasks = searchTasksRecursive(tasks);
  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(normalizedQuery) || 
    g.description?.toLowerCase().includes(normalizedQuery)
  );

  const isEmpty = filteredTasks.length === 0 && filteredGroups.length === 0;

  return (
    <div className="flex-1 h-full bg-slate-50 overflow-y-auto custom-scrollbar p-6 md:p-10">
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Search size={20} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Search Results</h1>
        </div>
        <p className="text-slate-500 text-lg">
          Showing matches for "<span className="text-slate-900 font-semibold">{query}</span>"
        </p>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={40} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No matches found</h2>
            <p className="text-slate-500 max-w-xs mx-auto">
                We couldn't find any tasks or groups matching your search query. Try different keywords.
            </p>
        </div>
      ) : (
        <div className="space-y-12 pb-20">
          
          {/* Groups Results */}
          {filteredGroups.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Users size={14} /> Work Groups ({filteredGroups.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.map(group => (
                  <div 
                    key={group.id}
                    onClick={() => onNavigateGroup(group.id)}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-${group.color}-100 flex items-center justify-center text-${group.color}-600`}>
                        <Users size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 truncate">{group.name}</h4>
                        <p className="text-xs text-slate-400 truncate">{group.description || 'No description'}</p>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
                        <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <Users size={10} /> {group.memberIds.length} members
                        </div>
                        {group.isRecurring && (
                            <div className="text-[10px] font-bold text-indigo-500 flex items-center gap-1">
                                <RefreshCw size={10} /> Recurring
                            </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Results */}
          {filteredTasks.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <ListTodo size={14} /> Tasks Found ({filteredTasks.length})
              </h3>
              <div className="space-y-3">
                {filteredTasks.map(task => {
                  const group = groups.find(g => g.id === task.groupId);
                  const assignee = employees.find(e => e.id === task.assignee);
                  
                  return (
                    <div 
                      key={task.id}
                      onClick={() => onNavigateGroup(task.groupId)}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all cursor-pointer flex items-center gap-4 group"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${task.completed ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                        {task.completed ? <CheckCircle size={20} /> : <ListTodo size={20} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-slate-800 truncate ${task.completed ? 'line-through opacity-50' : ''}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                            {group && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-${group.color}-50 text-${group.color}-600 border border-${group.color}-100`}>
                                    {group.name}
                                </span>
                            )}
                            {task.dueDate && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                    <Calendar size={10} /> {new Date(task.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                </span>
                            )}
                            {assignee && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                    <User size={10} /> {assignee.name.split(' ')[0]}
                                </span>
                            )}
                        </div>
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                             View in Group
                             <ArrowRight size={12} />
                         </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default SearchView;
