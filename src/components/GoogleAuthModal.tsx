import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, TesterTier } from '../types';
import { 
  X, 
  CheckCircle2, 
  Shield, 
  Smartphone, 
  ArrowRight, 
  UserCheck, 
  Sparkles, 
  RefreshCw,
  Building2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    allUsers, 
    switchUser, 
    loginWithGoogle, 
    updateUserRole, 
    updateTesterTier,
    updateDeveloperProfile,
    signInWithSupabaseGoogle,
    supabaseUser 
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [selectedTier, setSelectedTier] = useState<TesterTier>(currentUser.testerTier);
  const [developerAccountName, setDeveloperAccountName] = useState<string>(currentUser.developerAccountName || `${currentUser.name} Studios`);
  const [customName, setCustomName] = useState(currentUser.name);
  const [customEmail, setCustomEmail] = useState(currentUser.email);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isSigningInSupabase, setIsSigningInSupabase] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSupabaseSignIn = async () => {
    setIsSigningInSupabase(true);
    setAuthError(null);
    try {
      await signInWithSupabaseGoogle();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      onClose();
    } catch (err: any) {
      console.error('Supabase Auth error:', err);
      setAuthError(err.message || 'Supabase Google Sign-in was cancelled or encountered an error.');
    } finally {
      setIsSigningInSupabase(false);
    }
  };

  const handleSwitchAccount = (userId: string) => {
    switchUser(userId);
    onClose();
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCustomMode) {
      loginWithGoogle(
        customEmail, 
        customName, 
        selectedRole, 
        selectedTier, 
        selectedRole === 'developer' ? developerAccountName : undefined
      );
    } else {
      updateUserRole(selectedRole);
      updateTesterTier(selectedTier);
      if (selectedRole === 'developer' && developerAccountName) {
        updateDeveloperProfile({ developerAccountName });
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="google-auth-modal"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Google Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-2 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Google Identity & Developer Profiles</h3>
              <p className="text-xs text-slate-300">Supabase Auth & persistent PostgreSQL cloud profile synchronization</p>
            </div>
          </div>
        </div>

        {/* Primary Real Google Sign-in Action Button */}
        <div className="p-6 pb-2">
          <button
            type="button"
            onClick={handleSupabaseSignIn}
            disabled={isSigningInSupabase}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl border-2 border-slate-300 hover:border-slate-400 shadow-sm flex items-center justify-center gap-3 transition cursor-pointer group"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{isSigningInSupabase ? 'Connecting to Google...' : 'Sign in with Google (Supabase Auth)'}</span>
          </button>

          {authError && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold">or switch saved profiles</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="p-6 pt-0 space-y-5">
          {/* Quick Account Switcher */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Choose Profile
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {allUsers.map((user) => {
                const isSelected = user.id === currentUser.id && !isCustomMode;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setIsCustomMode(false);
                      handleSwitchAccount(user.id);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" 
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {user.developerAccountName || user.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                            user.role === 'developer' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">{user.email}</span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
              >
                {isCustomMode ? 'Use registered account' : '+ Quick add custom Google profile'}
              </button>
            </div>
          </div>

          {/* Custom Google Account Fields */}
          {isCustomMode && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800">New Google Developer Profile</h4>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Owner Full Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  placeholder="e.g. Alex Henderson"
                  required
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Google Account Email</label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  placeholder="e.g. alex.dev@gmail.com"
                  required
                />
              </div>
            </div>
          )}

          {/* Developer Account Name Setting */}
          {selectedRole === 'developer' && (
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200 space-y-1.5 text-xs">
              <label className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Developer Account Name</span>
              </label>
              <input
                type="text"
                value={developerAccountName}
                onChange={(e) => setDeveloperAccountName(e.target.value)}
                placeholder="e.g. Nordic Byte Labs or PixelCraft Devs"
                className="w-full px-3.5 py-2 text-xs bg-white border border-indigo-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                required
              />
              <span className="text-[10px] text-indigo-800/80 block">
                This public developer name is stored in Firestore and shown on all your closed tracks.
              </span>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Current Active Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('developer')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                  selectedRole === 'developer'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide block">Developer</span>
                  <p className="text-[11px] text-slate-600 mt-1">Publish tracks, set developer name, track 20-tester metrics.</p>
                </div>
                {selectedRole === 'developer' && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 self-end mt-2" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('tester')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                  selectedRole === 'tester'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide block">Beta Tester</span>
                  <p className="text-[11px] text-slate-600 mt-1">Enroll in closed tracks, check-in daily, report bugs with screenshots.</p>
                </div>
                {selectedRole === 'tester' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 self-end mt-2" />
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Save & Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
