import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Clock, RefreshCw, Lock, ShieldAlert } from 'lucide-react';
import { Employee, Group } from '../types';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, memberIds: string[], defaultDueDay?: number, isRecurring?: boolean, isRestricted?: boolean) => void;
  employees: Employee[];
  initialData?: Group | null;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onSave, employees, initialData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [defaultDueDay, setDefaultDueDay] = useState<number | ''>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || '');
        setSelectedMembers(initialData.memberIds);
        setDefaultDueDay(initialData.defaultDueDay || '');
        setIsRecurring(initialData.isRecurring || false);
        setIsRestricted(initialData.isRestricted || false);
      } else {
        // Reset for create mode
        setName('');
        setDescription('');
        setSelectedMembers([]);
        setDefaultDueDay('');
        setIsRecurring(false);
        setIsRestricted(false);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave(
        name, 
        description, 
        selectedMembers, 
        defaultDueDay === '' ? undefined : Number(defaultDueDay),
        isRecurring,
        isRestricted
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Work Group' : 'Create Work Group'}</h2>
            <p className="text-xs text-slate-500 mt-1">{initialData ? 'Update settings and members' : 'Define scope, deadline, and team'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Group Name</label>
            <input
              type="text"
              placeholder="e.g., GST Reg, Audit Team..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus={!initialData}
            />
          </div>

          <div className="space-y-2">
             <label className="text-sm font-semibold text-slate-700">Description</label>
             <input
              type="text"
              placeholder="Brief description of responsibilities"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Month-to-Month Compliance Confirmation */}
          <div className={`p-4 rounded-xl border transition-colors duration-300 ${isRecurring ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg transition-colors duration-300 ${isRecurring ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-200 text-slate-400'}`}>
                  <RefreshCw size={20} className={isRecurring ? 'animate-spin-slow' : ''} />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-800 block cursor-pointer select-none" htmlFor="recurring-toggle">
                    Month-to-Month Work
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tasks repeat monthly
                  </p>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="recurring-toggle" 
                  className="sr-only peer"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
                <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
              </label>
            </div>
          </div>

          {/* Restricted Access Toggle */}
          <div className={`p-4 rounded-xl border transition-colors duration-300 ${isRestricted ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg transition-colors duration-300 ${isRestricted ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-200 text-slate-400'}`}>
                  <Lock size={20} />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-800 block cursor-pointer select-none" htmlFor="restricted-toggle">
                    Restricted Access
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Only visible to Admins
                  </p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="restricted-toggle" 
                  className="sr-only peer"
                  checked={isRestricted}
                  onChange={(e) => setIsRestricted(e.target.checked)}
                />
                <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
              </label>
            </div>
          </div>

          {/* Deadline Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Clock size={16} className="text-blue-500" />
              Standard Deadline (Day of Month)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Day of month (e.g., 20)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all pl-12"
                value={defaultDueDay}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1 && val <= 31) setDefaultDueDay(val);
                  else if (e.target.value === '') setDefaultDueDay('');
                }}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Calendar size={18} />
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                Day {defaultDueDay || '1-31'}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 flex justify-between">
              <span>Assign Employees</span>
              <span className="text-xs font-normal text-slate-400">{selectedMembers.length} selected</span>
            </label>
            
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {employees.map(emp => (
                <div 
                  key={emp.id}
                  onClick={() => toggleMember(emp.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                    selectedMembers.includes(emp.id)
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${emp.color}`}>
                    {emp.initials}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${selectedMembers.includes(emp.id) ? 'text-blue-800' : 'text-slate-700'}`}>
                      {emp.name}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">{emp.role}</div>
                  </div>
                  {selectedMembers.includes(emp.id) && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-6 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95"
          >
            {initialData ? 'Update Group' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;