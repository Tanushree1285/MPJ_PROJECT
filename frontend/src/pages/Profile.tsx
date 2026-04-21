import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { User, Mail, Phone, Lock, Save, Camera, Shield, Bell, CreditCard, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import QrPayments from '../components/features/QrPayments';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = user?.id || (user as any)?.userId;
    if (!uid) return;
    
    setLoading(true);
    try {
      const res = await api.put(`/users/${uid}`, formData);
      login(res.data);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) return;
    
    const uid = user?.id || (user as any)?.userId;
    setLoading(true);
    try {
      await api.delete(`/users/${uid}`);
      toast.success('Account deactivated');
      logout();
    } catch (err: any) {
      toast.error(err.message || 'Failed to deactivate account');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'personal', name: 'Personal Information', icon: User },
    { id: 'security', name: 'Security & Privacy', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'payment', name: 'Payment Methods', icon: CreditCard },
  ];

  return (
    <DashboardLayout title="My Account">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Profile Card & Navigation */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden rounded-[32px] border-none shadow-premium relative group"
          >
            {/* Mesh Gradient Header */}
            <div className="h-32 bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-600 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -mr-16 -mt-16 animate-pulse" />
            </div>

            <div className="px-8 pb-8 -mt-12 relative z-10 text-center">
              <div className="relative inline-block group">
                <div className="w-24 h-24 bg-white rounded-3xl p-1 shadow-2xl ring-4 ring-white/50 transition-all duration-500 group-hover:scale-105">
                  <div className="w-full h-full rounded-[22px] bg-slate-50 flex items-center justify-center text-3xl font-display font-bold text-primary-600 overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.fullName?.charAt(0)
                    )}
                  </div>
                </div>
                <label className="absolute -bottom-1 -right-1 p-2.5 bg-primary-600 text-white rounded-2xl shadow-xl hover:bg-primary-700 hover:scale-110 transition-all cursor-pointer border-2 border-white">
                  <Camera size={16} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>

              <h2 className="text-2xl font-display font-bold text-slate-900 mt-5">{user?.fullName}</h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 bg-primary-50 text-primary-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary-100">
                  {user?.role}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Verified
                </span>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Accounts</p>
                  <p className="text-lg font-display font-bold text-slate-900 mt-1">02</p>
                </div>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Tier</p>
                  <p className="text-lg font-display font-bold text-primary-600 mt-1">Gold</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-[32px] p-3 space-y-1 shadow-premium border-none"
          >
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 ${
                  activeTab === tab.id 
                  ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/30' 
                  : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl transition-colors ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-500'
                  }`}>
                    <tab.icon size={18} />
                  </div>
                  <span className="font-bold text-sm">{tab.name}</span>
                </div>
                {activeTab === tab.id && (
                  <motion.div layoutId="indicator" className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Right Content Section */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'personal' && (
                <div className="glass-card p-10 rounded-[40px] border-none shadow-premium relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                    <User size={180} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-display font-bold text-slate-900 mb-2">Personal Information</h3>
                    <p className="text-slate-500 font-medium mb-10">Manage your identity and contact details</p>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input 
                          label="Full Name" 
                          icon={User} 
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          className="bg-white/50 border-slate-100/50 focus:border-primary-500"
                        />
                        <Input 
                          label="Email Address" 
                          type="email" 
                          icon={Mail} 
                          value={formData.email}
                          disabled
                          className="bg-slate-50/50 cursor-not-allowed opacity-80"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input 
                          label="Phone Number" 
                          icon={Phone} 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="bg-white/50 border-slate-100/50"
                        />
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Member Since</label>
                          <div className="px-5 py-3.5 bg-slate-50/50 rounded-2xl text-slate-700 font-bold text-sm flex items-center gap-3 border border-slate-100/50">
                            <Calendar size={18} className="text-primary-300" /> Mar 15, 2026
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 flex justify-end">
                        <Button 
                          loading={loading} 
                          icon={<Save size={20} />} 
                          className="px-10 py-6 rounded-2xl shadow-2xl shadow-primary-500/20 text-lg"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="glass-card p-10 rounded-[40px] border-none shadow-premium">
                  <h3 className="text-3xl font-display font-bold text-slate-900 mb-2">Security & Privacy</h3>
                  <p className="text-slate-500 font-medium mb-10">Keep your account secure with advanced controls</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[32px] border border-slate-100/50 group hover:border-primary-200 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-sm">
                          <Shield size={28} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-slate-500 font-medium">Enhanced protection for your assets</p>
                        </div>
                      </div>
                      <div className="w-14 h-8 bg-primary-600/10 rounded-full relative p-1 cursor-pointer">
                        <div className="w-6 h-6 bg-primary-600 rounded-full shadow-md ml-auto" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[32px] border border-slate-100/50 group hover:border-primary-200 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                          <Lock size={28} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">Change Password</h4>
                          <p className="text-sm text-slate-500 font-medium whitespace-nowrap">Updated 3 months ago</p>
                        </div>
                      </div>
                      <Button 
                        variant="secondary" 
                        className="bg-white px-8 rounded-xl border-slate-200"
                        onClick={() => setIsPasswordModalOpen(true)}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="glass-card p-10 rounded-[40px] border-none shadow-premium">
                   <div className="text-center py-16">
                    <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-indigo-100 shadow-inner">
                      <Bell size={40} />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">Notification Preferences</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">
                      All system notifications are currently enabled. We'll alert you via email for all important account activity.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-display font-bold text-slate-900 ml-2">My QR & Wallet</h3>
                  <QrPayments />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Danger Zone */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-1.5 bg-red-500/5 rounded-[40px] border border-red-100"
          >
            <div className="glass-card p-10 rounded-[36px] border-none">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex gap-5">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertTriangle size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-red-600">Deactivate Account</h3>
                    <p className="text-slate-500 text-sm font-medium mt-1 max-w-md">
                      This will permanently remove your access and delete your records. This action is irreversible.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="danger" 
                  onClick={handleDeactivate}
                  className="px-8 py-4 bg-red-100 text-red-600 border-none hover:bg-red-600 hover:text-white transition-all font-bold shadow-none"
                >
                  Close Account
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Password Reset Modal - Enhanced */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
              onClick={() => setIsPasswordModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-10 border border-slate-100"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <Lock size={32} />
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-900">Secure Reset</h2>
                <p className="text-sm text-slate-500 font-medium mt-2">Update your authentication credentials</p>
              </div>

              <div className="space-y-5">
                <Input 
                  label="Password Actual" 
                  type="password" 
                  icon={Shield} 
                  placeholder="••••••••"
                  className="bg-slate-50/50"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                />
                <Input 
                  label="Nuevo Password" 
                  type="password" 
                  icon={Lock} 
                  placeholder="••••••••"
                  className="bg-slate-50/50"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                />
                <Input 
                  label="Confirmar" 
                  type="password" 
                  icon={Lock} 
                  placeholder="••••••••"
                  className="bg-slate-50/50"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                />
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                >
                  Volver
                </button>
                <button 
                  onClick={() => {
                    if (passwordData.new !== passwordData.confirm) return toast.error("Passwords don't match");
                    toast.success('Password security verified!');
                    setIsPasswordModalOpen(false);
                  }}
                  className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-xl shadow-primary-500/30 transition-all border-b-4 border-primary-800 active:border-b-0 active:translate-y-1"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Profile;
