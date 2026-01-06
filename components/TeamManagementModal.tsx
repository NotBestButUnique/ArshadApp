import React, { useState } from 'react';
import { X, Plus, Trash2, User, Briefcase, Users, Mail, UserCheck, Clock, Send } from 'lucide-react';
import { Employee } from '../types';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onAddEmployee: (name: string, role: string, email: string) => void;
  onRemoveEmployee: (id: string) => void;
}

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ 
  isOpen, 
  onClose, 
  employees, 
  onAddEmployee, 
  onRemoveEmployee 
}) => {
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newEmail, setNewEmail] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newRole.trim() && newEmail.trim()) {
      onAddEmployee(newName, newRole, newEmail);
      setNewName('');
      setNewRole('');
      setNewEmail('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Users size={20} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Team Management</h2>
                <p className="text-xs text-slate-500">Only registered users can view shared tasks.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add New Employee Form */}
          <form onSubmit={handleAdd} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
               <Send size={12} /> Send New Invitation
             </h3>
             <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Full Name"
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 relative">
                        <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Designation"
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="email" 
                            placeholder="Registered Mail"
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!newName.trim() || !newRole.trim() || !newEmail.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs gap-2"
                    >
                        <span>Invite</span>
                        <Send size={14} />
                    </button>
                </div>
             </div>
          </form>

          {/* Employee List */}
          <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Team Directory ({employees.length})</h3>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {employees.map(emp => (
                    <div key={emp.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ${emp.color}`}>
                                    {emp.initials}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${emp.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}>
                                    {emp.status === 'active' ? <UserCheck size={8} className="text-white" /> : <Clock size={8} className="text-white" />}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="text-sm font-semibold text-slate-700">{emp.name}</div>
                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${emp.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {emp.status === 'active' ? 'Active' : 'Invited'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-slate-400">{emp.role}</span>
                                  {emp.email && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-[11px] text-slate-400">{emp.email}</span>
                                    </>
                                  )}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => onRemoveEmployee(emp.id)}
                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove Member"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementModal;