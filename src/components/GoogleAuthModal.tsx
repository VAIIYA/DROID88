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
    signInWithSupabaseGithub,
    signOutFromSupabase,
    supabaseUser 
  } = useApp();

  const [isSigningIn, setIsSigningIn] = useState<'github' | 'google' | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGithubSignIn = async () => {
    setIsSigningIn('github');
    setAuthError(null);
    try {
      await signInWithSupabaseGithub();
    } catch (err: any) {
      console.error('Supabase GitHub Auth error:', err);
      setAuthError(err.message || 'GitHub Sign-in was cancelled or encountered an error.');
      setIsSigningIn(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn('google');
    setAuthError(null);
    try {
      await signInWithSupabaseGoogle();
    } catch (err: any) {
      console.error('Supabase Google Auth error:', err);
      setAuthError(err.message || 'Google Sign-in was cancelled or encountered an error.');
      setIsSigningIn(null);
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
            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center p-2 shadow-sm border border-slate-700">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                {currentUser ? 'Developer Account' : 'Sign In / Register'}
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
                  onClick={handleGithubSignIn}
                  disabled={isSigningIn !== null}
                  className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition cursor-pointer text-center"
                >
                  {isSigningIn === 'github' ? 'Connecting...' : 'Switch Account'}
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

              {/* Primary GitHub Sign-In Button */}
              <button
                type="button"
                onClick={handleGithubSignIn}
                disabled={isSigningIn !== null}
                className="w-full py-3.5 px-4 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-3 transition cursor-pointer border border-slate-800"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>{isSigningIn === 'github' ? 'Connecting to GitHub...' : 'Continue with GitHub'}</span>
              </button>

              {/* Secondary Google Button */}
              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200"></div>
                <span className="shrink mx-3 text-slate-400 text-[10px] uppercase font-bold tracking-wider">or</span>
                <div className="grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn !== null}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2.5 transition cursor-pointer border border-slate-200"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isSigningIn === 'google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-400 text-center">
                Securely authenticated with Supabase. We only access your public profile and verified email.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
