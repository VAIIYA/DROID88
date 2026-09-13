'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  AlertCircle,
  LogOut,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    signInWithSupabaseGoogle, 
    signOutFromSupabase,
    supabaseUser 
  } = useApp();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSupabaseSignIn = async () => {
    setIsSigningIn(true);
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
      setAuthError(err.message || 'Google Sign-in was cancelled or encountered an error.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOutFromSupabase();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="google-auth-modal"
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fadeIn"
      >
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center p-2 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                {currentUser ? 'Your Google Account' : 'Sign In / Register'}
              </h3>
              <p className="text-xs text-slate-300">
                {currentUser ? 'Connected via Supabase Auth' : 'Android Closed Testing Community'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {currentUser ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-12 h-12 rounded-full object-cover border border-slate-300"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {currentUser.developerAccountName || currentUser.name}
                    </span>
                    {currentUser.verifiedDeveloper && (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-mono block truncate">
                    {currentUser.email}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full capitalize">
                      {currentUser.role}
                    </span>
                    <span className="text-slate-500">
                      {currentUser.reputationScore} QA Points
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSupabaseSignIn}
                  disabled={isSigningIn}
                  className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition cursor-pointer text-center"
                >
                  {isSigningIn ? 'Connecting...' : 'Switch Google Account'}
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Visitor: Log in or Register state */
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect with your Google account to publish Android closed testing tracks, recruit 20 verified testers for 14 continuous days, or earn QA reputation by testing indie apps.
              </p>

              {/* Value propositions */}
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Smartphone className="w-3 h-3" />
                  </div>
                  <div className="text-slate-700">
                    <strong className="text-slate-900 block font-semibold">Publish Closed Testing Tracks</strong>
                    Paste Play Console links to recruit 20 beta testers for 14 continuous days.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-3 h-3" />
                  </div>
                  <div className="text-slate-700">
                    <strong className="text-slate-900 block font-semibold">14-Day Tester Streaks</strong>
                    Opt-in to fellow developers' tracks, check in daily, and report bugs with screenshots.
                  </div>
                </div>
              </div>

              {/* One-Click Google Action Button */}
              <button
                type="button"
                onClick={handleSupabaseSignIn}
                disabled={isSigningIn}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-3 transition cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isSigningIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-400 text-center">
                Securely authenticated with Supabase. We only access your public Google profile and verified email.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
