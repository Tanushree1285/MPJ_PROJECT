import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { User, Shield, Users, FileText, ChevronRight, Activity, Trash2, Key } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('fhPendingAccounts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await api.get('/users/all');
        setUsers(usersRes.data);
        const logsRes = await api.get('/logs/all');
        setLogs(logsRes.data.slice(0, 50));
      } catch (err: any) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (request: any) => {
    try {
      await api.post('/accounts/create', {
        userId: request.userId,
        accountType: request.accountType
      });
      
      const updated = pendingRequests.filter(r => r.id !== request.id);
      setPendingRequests(updated);
      localStorage.setItem('fhPendingAccounts', JSON.stringify(updated));
      toast.success('Account approved and created successfully!');
    } catch (err: any) {
      toast.error('Failed to approve account: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = (id: number) => {
    const updated = pendingRequests.filter(r => r.id !== id);
    setPendingRequests(updated);
    localStorage.setItem('fhPendingAccounts', JSON.stringify(updated));
    toast.error('Account request rejected');
  };

  return (
    <DashboardLayout title="Admin Panel">
      <div className="space-y-8">
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl bg-white shadow-premium">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                <Users size={20} />
              </div>
              <span className="text-green-500 text-xs font-bold">+12%</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-display font-bold text-slate-900">{users.length}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl bg-white shadow-premium">
             <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Shield size={20} />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">System Staff</p>
            <p className="text-2xl font-display font-bold text-slate-900">
              {users.filter(u => u.role !== 'CUSTOMER').length}
            </p>
          </div>
          <div className="glass-card p-6 rounded-2xl bg-white shadow-premium">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Activity size={20} />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Recent Logs</p>
            <p className="text-2xl font-display font-bold text-slate-900">{logs.length}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl bg-white shadow-premium">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                <FileText size={20} />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Account Requests</p>
            <p className="text-2xl font-display font-bold text-slate-900">{pendingRequests.length}</p>
          </div>
        </div>

        {/* Account Requests Section */}
        {pendingRequests.length > 0 && (
          <section className="space-y-4">
             <h3 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-orange-500" size={20} />
              Pending Account Applications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map(req => {
                const reqUser = users.find(u => u.id === req.userId);
                return (
                  <div key={req.id} className="glass-card p-6 rounded-3xl bg-white border border-orange-100 shadow-premium">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-bold">
                        {reqUser?.fullName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{reqUser?.fullName || 'Unknown User'}</p>
                        <p className="text-xs text-slate-500 font-medium">{req.accountType} Account</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleApprove(req)}
                        className="flex-1 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-all"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(req.id)}
                        className="flex-1 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Management */}
          <section className="space-y-4">
            <h3 className="text-xl font-display font-bold text-slate-900">User Management</h3>
            <div className="glass-card rounded-2xl overflow-hidden border-none shadow-premium bg-white">
              <div className="divide-y divide-slate-50">
                {users.slice(0, 6).map((u) => (
                  <div key={u.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{u.fullName}</p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{u.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 text-slate-400">
                      <button className="p-2 hover:bg-white hover:text-primary-600 rounded-lg transition-all shadow-sm">
                        <Key size={14} />
                      </button>
                      <button className="p-2 hover:bg-white hover:text-red-600 rounded-lg transition-all shadow-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 text-center text-sm font-bold text-slate-500 hover:text-primary-600 bg-slate-50/50 hover:bg-slate-50 transition-all border-t border-slate-50">
                View All Users
              </button>
            </div>
          </section>

          {/* System Logs */}
          <section className="space-y-4">
            <h3 className="text-xl font-display font-bold text-slate-900">Recent Logs</h3>
            <div className="glass-card rounded-2xl overflow-hidden border-none shadow-premium bg-white">
              <div className="divide-y divide-slate-50">
                {logs.slice(0, 6).map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-bold text-slate-800">{log.action}</p>
                        <p className="text-[10px] text-slate-500 font-medium lowercase">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-mono text-slate-400">{log.ipAddress}</p>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 text-center text-sm font-bold text-slate-500 hover:text-primary-600 bg-slate-50/50 hover:bg-slate-50 transition-all border-t border-slate-50">
                View All Activity
              </button>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
