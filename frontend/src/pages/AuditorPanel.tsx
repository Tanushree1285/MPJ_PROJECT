import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  User as UserIcon,
  Activity,
  Clock,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LogEntry {
  id: number;
  action: string;
  details: string;
  ipAddress: string;
  status: string;
  createdAt: string;
  userId: number;
}

const AuditorPanel: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // Assuming there's a global logs endpoint or an admin one
        const res = await api.get('/logs/all');
        setLogs(res.data);
      } catch (err: any) {
        console.error('Logs fetch error:', err);
        // Fallback for demo if endpoint fails
        toast.error('Failed to load system logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getStatusColor = (status: string) => {
    return status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };
  
  const exportToPDF = () => {
    if (filteredLogs.length === 0) return toast.error('No logs to export');
    
    const doc = new jsPDF();
    
    // Add Brand Header
    doc.setFillColor(30, 41, 59); // slate-800 for Auditor
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('FinanceHub', 14, 25);
    doc.setFontSize(10);
    doc.text('System Audit Logs Report', 14, 32);
    
    // Reset for content
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 50);
    doc.text(`Audit Scope: Full System Activity`, 14, 56);
    doc.text(`Total Events: ${filteredLogs.length}`, 14, 62);
    
    const headers = [['Action', 'User ID', 'Details', 'IP Address', 'Timestamp', 'Status']];
    const rows = filteredLogs.map(log => [
      log.action,
      `#${log.userId}`,
      log.details,
      log.ipAddress,
      new Date(log.createdAt).toLocaleString(),
      log.status
    ]);

    autoTable(doc, {
      startY: 70,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: { 
        fillColor: [30, 41, 59], 
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 8,
        cellPadding: 3 
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    doc.save(`FinanceHub_AuditLogs_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Audit logs exported as PDF!');
  };

  return (
    <DashboardLayout title="Auditor Panel">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl bg-white shadow-premium">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Events</p>
                <p className="text-2xl font-display font-bold text-slate-900">{logs.length}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl bg-white shadow-premium">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <ShieldAlert size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Security Alerts</p>
                <p className="text-2xl font-display font-bold text-slate-900">0</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl bg-white shadow-premium">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Response Time</p>
                <p className="text-2xl font-display font-bold text-slate-900">12ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-primary-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="ALL">All Actions</option>
              <option value="TRANSFER">Transfers</option>
              <option value="USER_LOGIN">Logins</option>
              <option value="USER_REGISTER">Registrations</option>
            </select>
            <button 
              onClick={exportToPDF}
              className="p-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-all flex items-center gap-2 px-3"
            >
              <Download size={18} />
              <span className="text-xs font-bold">Export Logs</span>
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-premium bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Monitoring system activity...</td></tr>
                ) : filteredLogs.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">No logs recorded for this period</td></tr>
                ) : filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="text-slate-400" size={16} />
                        <span className="text-sm font-bold text-slate-900">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">#{log.userId}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{log.details}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={14} />
                        <span className="text-xs font-bold">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditorPanel;
