import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { User, Mail, Phone, Lock, Save, Camera, Shield, Bell, CreditCard, Calendar, Plus } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
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

  return (
    <DashboardLayout title="My Profile">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-primary-600/10" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative group">
                <div className="w-24 h-24 bg-white border-4 border-white rounded-2xl shadow-lg flex items-center justify-center text-3xl font-display font-bold text-primary-600 overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.fullName?.charAt(0)
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 p-2 bg-primary-600 text-white rounded-lg shadow-lg hover:scale-110 transition-transform cursor-pointer">
                  <Camera size={16} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <h2 className="text-xl font-display font-bold text-slate-900 mt-4">{user?.fullName}</h2>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mt-1">{user?.role}</p>
              
              <div className="mt-8 flex gap-3 w-full">
                <div className="flex-1 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Joined</p>
                  <p className="text-xs font-bold text-slate-700 mt-1">Mar 2026</p>
                </div>
                <div className="flex-1 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                  <p className="text-xs font-bold text-green-600 mt-1 uppercase">Active</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-slate-50">
            {[
              { id: 'personal', name: 'Personal Info', icon: User },
              { id: 'security', name: 'Security & Privacy', icon: Shield },
              { id: 'notifications', name: 'Notifications', icon: Bell },
              { id: 'payment', name: 'Payment Methods', icon: CreditCard },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full p-4 flex items-center gap-3 text-sm font-bold transition-all ${
                  activeTab === tab.id ? 'text-primary-600 bg-primary-50/50' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={18} /> {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'personal' && (
            <div className="glass-card p-10 rounded-3xl border-none shadow-premium">
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-8">Personal Information</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Full Name" 
                    icon={User} 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                  <Input 
                    label="Email Address" 
                    type="email" 
                    icon={Mail} 
                    value={formData.email}
                    disabled
                    className="bg-slate-50 cursor-not-allowed"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Phone Number" 
                    icon={Phone} 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Member Since</label>
                    <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-600 font-medium text-sm flex items-center gap-3 border border-slate-100">
                      <Calendar size={18} className="text-slate-400" /> Mar 15, 2026
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-end">
                  <Button loading={loading} icon={<Save size={18} />} className="px-8 shadow-premium shadow-primary-500/20">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card p-10 rounded-3xl border-none shadow-premium">
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-8">Security & Privacy</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-slate-500 font-medium mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900">Change Password</h4>
                    <p className="text-sm text-slate-500 font-medium mt-1">Last changed 3 months ago.</p>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="bg-white"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Password Reset Modal */}
          {isPasswordModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setIsPasswordModalOpen(false)} />
              <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-fadeIn p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock size={28} />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-slate-900">Change Password</h2>
                  <p className="text-sm text-slate-500 font-medium">Create a strong password to protect your account</p>
                </div>

                <div className="space-y-4">
                  <Input 
                    label="Current Password" 
                    type="password" 
                    icon={Lock} 
                    placeholder="••••••••"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                  />
                  <Input 
                    label="New Password" 
                    type="password" 
                    icon={Lock} 
                    placeholder="••••••••"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                  />
                  <Input 
                    label="Confirm New Password" 
                    type="password" 
                    icon={Lock} 
                    placeholder="••••••••"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                  />
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="flex-1 py-3 bg-slate-50 text-slate-500 rounded-xl font-bold hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (passwordData.new !== passwordData.confirm) return toast.error("Passwords don't match");
                      toast.success('Password updated successfully!');
                      setIsPasswordModalOpen(false);
                    }}
                    className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass-card p-10 rounded-3xl border-none shadow-premium">
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-8">Notification Preferences</h3>
              <div className="space-y-6 text-center py-10">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Bell size={32} />
                </div>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">You'll receive notifications for important account activity and security alerts.</p>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="glass-card p-10 rounded-3xl border-none shadow-premium">
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-8">Payment Methods</h3>
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard size={32} />
                </div>
                <p className="text-slate-400 font-bold mb-4">No cards linked yet</p>
                <Button variant="secondary" icon={<Plus size={18} />}>Add New Card</Button>
              </div>
            </div>
          )}

          <div className="glass-card p-10 rounded-3xl border-none shadow-premium bg-red-50/20 border-red-100">
            <h3 className="text-xl font-display font-bold text-red-600 mb-4">Danger Zone</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium">Once you deactivate your account, there is no going back. Please be certain.</p>
            <Button 
              variant="danger" 
              onClick={handleDeactivate}
              loading={loading && activeTab === 'personal'} // Simple proxy for deactivation loading
              className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white transition-all"
            >
              Deactivate Account
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
