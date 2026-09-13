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
  Users,
  Mail,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    signInWithSupabaseGithub,
    signInWithSupabaseOtp,
    signOutFromSupabase,
    supabaseUser 
  } = useApp();

  const [isSigningIn, setIsSigningIn] = useState<'github' | 'email' | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);
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

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    setIsSigningIn('email');
    setAuthError(null);
    try {
      await signInWithSupabaseOtp(emailInput.trim());
      setEmailSent(true);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error('Supabase Email Sign-in error:', err);
      setAuthError(err.message || 'Could not send login link. Please try again.');
    } finally {
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
                Connect with your GitHub account or Email to publish Android closed testing tracks, recruit 20 verified testers for 14 continuous days, or earn QA reputation by testing indie apps.
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

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200"></div>
                <span className="shrink mx-3 text-slate-400 text-[10px] uppercase font-bold tracking-wider">or email magic link</span>
                <div className="grow border-t border-slate-200"></div>
              </div>

              {/* Email Form */}
              {emailSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-fadeIn">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-emerald-900">Check Your Email</h4>
                  <p className="text-[11px] text-emerald-700">
                    We sent a secure login link to <strong>{emailInput}</strong>. Click it to log in instantly!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEmailSignIn} className="space-y-2">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="developer@yourstudio.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSigningIn !== null}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>{isSigningIn === 'email' ? 'Sending Magic Link...' : 'Send Magic Link'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-400 text-center">
                Securely authenticated with Supabase. Password-free instant login.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
