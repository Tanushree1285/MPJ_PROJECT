import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Wallet, 
  User, 
  Settings, 
  ShieldCheck, 
  LogOut,
  X,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Transactions', icon: ArrowRightLeft, path: '/transactions' },
    { name: 'My Accounts', icon: Wallet, path: '/accounts' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  if (user?.role === 'ADMIN' ) {
    menuItems.push({ name: 'Admin Panel', icon: ShieldCheck, path: '/admin' });
  }

  if (user?.role === 'AUDITOR' || user?.role === 'ADMIN') {
    menuItems.push({ name: 'Auditor Panel', icon: ClipboardList, path: '/auditor' });
  }

  return (
    <aside className="h-full flex flex-col bg-white border-r border-slate-200 w-64">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-display font-bold text-xl shadow-lg shadow-primary-500/20">
            FH
          </div>
          <span className="text-xl font-display font-bold tracking-tight text-slate-900">FinanceHub</span>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
