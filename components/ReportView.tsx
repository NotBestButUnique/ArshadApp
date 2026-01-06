import React, { useState, useMemo } from 'react';
import { Task, Employee, Group } from '../types';
import { FileDown, Search, Filter, Calendar, User, LayoutGrid, CheckCircle, Clock } from 'lucide-react';

interface ReportViewProps {
  tasks: Task[];
  employees: Employee[];
  groups: Group[];
}

const ReportView: React.FC<ReportViewProps> = ({ tasks, employees, groups }) => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get all unique years from tasks
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    tasks.forEach(t => {
      if (t.completedAt) years.add(new Date(t.completedAt).getFullYear().toString());
      if (t.dueDate) years.add(new Date(t.dueDate).getFullYear().toString());
    });
    // Add current year if not present
    years.add(new Date().getFullYear().toString());
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [tasks]);

  const filteredData = useMemo(() => {
    return tasks.filter(task => {
      if (!task.completed || !task.completedAt) return false;
      
      const completionDate = new Date(task.completedAt);
      const matchesYear = completionDate.getFullYear().toString() === selectedYear;
      const matchesEmployee = selectedEmployee === 'all' || task.assignee === selectedEmployee;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesYear && matchesEmployee && matchesSearch;
    }).sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  }, [tasks, selectedYear, selectedEmployee, searchQuery]);

  const exportToCSV = () => {
    const headers = ['Task Title', 'Group', 'Assigned To', 'Due Date', 'Completed At', 'Year', 'Status'];
    const rows = filteredData.map(t => {
      const emp = employees.find(e => e.id === t.assignee)?.name || 'Unassigned';
      const group = groups.find(g => g.id === t.groupId)?.name || 'General';
      const compDate = new Date(t.completedAt!);
      
      return [
        `"${t.title.replace(/"/g, '""')}"`,
        `"${group}"`,
        `"${emp}"`,
        t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A',
        compDate.toLocaleString(),
        compDate.getFullYear().toString(),
        'Completed'
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `TaskFlow_Report_${selectedYear}_${selectedEmployee}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white p-6 border-b border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileDown className="text-blue-600" />
              Work Productivity Report
            </h1>
            <p className="text-sm text-slate-500 mt-1">Audit employee accomplishments and export data for compliance.</p>
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <FileDown size={18} />
            <span>Export to Excel (CSV)</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none appearance-none cursor-pointer"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {availableYears.map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none appearance-none cursor-pointer"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="all">All Employees</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
            <CheckCircle size={16} />
            <span className="text-sm font-bold">{filteredData.length} Tasks Found</span>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Task Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Team Member</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Group</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Completion Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map(task => {
                const emp = employees.find(e => e.id === task.assignee);
                const group = groups.find(g => g.id === task.groupId);
                const compDate = task.completedAt ? new Date(task.completedAt) : null;

                return (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{task.title}</div>
                      {task.dueDate && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                          <Calendar size={10} /> Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {emp ? (
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${emp.color}`}>
                            {emp.initials}
                          </div>
                          <div className="text-sm text-slate-600">{emp.name}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold bg-${group?.color || 'slate'}-50 text-${group?.color || 'slate'}-600 border border-${group?.color || 'slate'}-100`}>
                        <LayoutGrid size={10} />
                        {group?.name || 'General'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {compDate && (
                        <div>
                          <div className="text-sm font-medium text-slate-700">{compDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric'})}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock size={10} /> {compDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-300" />
              </div>
              <h3 className="text-slate-800 font-bold">No results found</h3>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportView;