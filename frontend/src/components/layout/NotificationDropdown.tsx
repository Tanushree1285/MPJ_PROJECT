import React, { useEffect, useState } from 'react';
import { Bell, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Log {
  id: number;
  action: string;
  details: string;
  createdAt: string;
  status: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchLogs();
    }
  }, [isOpen, user?.id]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/logs/user/${user?.id}`);
      // Sort by date descending and take top 5
      const sortedLogs = response.data
        .sort((a: Log, b: Log) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setLogs(sortedLogs);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-0 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fadeIn">
      <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-display font-bold text-slate-900 flex items-center gap-2">
          Notifications
          {logs.length > 0 && <span className="w-2 h-2 bg-primary-500 rounded-full"></span>}
        </h3>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all">
          <X size={16} />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm font-medium">Loading notifications...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
              <Bell size={24} />
            </div>
            <p className="text-slate-500 text-sm font-medium">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors group">
                <div className="flex gap-3">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    log.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {log.status === 'SUCCESS' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                      {log.action.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {log.details}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1 uppercase tracking-wider">
                      <Clock size={10} />
                      {new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <button className="w-full py-2 text-primary-600 text-xs font-bold hover:underline">
          View all activity logs
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
