'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { AppCatalog } from '@/components/AppCatalog';
import { DeveloperDashboard } from '@/components/DeveloperDashboard';
import { DeveloperProfilePage } from '@/components/DeveloperProfilePage';
import { TesterHub } from '@/components/TesterHub';
import { CommunityFeedbackBoard } from '@/components/CommunityFeedbackBoard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { GoogleAuthModal } from '@/components/GoogleAuthModal';
import { PublishAppModal } from '@/components/PublishAppModal';
import { AppDetailModal } from '@/components/AppDetailModal';
import { BugReportModal } from '@/components/BugReportModal';
import { AutomatedFeedbackModal } from '@/components/AutomatedFeedbackModal';
import { AppListing } from '@/types';
import { 
  Bug, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Smartphone, 
  Heart,
  CheckCircle2,
  Users,
  Building2
} from 'lucide-react';

type AppTab = 'catalog' | 'tester_hub' | 'dev_dashboard' | 'dev_profile' | 'community' | 'analytics';

const Droid88Hub: React.FC = () => {
  const { currentUser, apps, resetToSampleData } = useApp();

  // Navigation state
  const [activeTab, setActiveTab] = useState<AppTab>('catalog');
  const [targetDeveloperId, setTargetDeveloperId] = useState<string | null>(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isBugReportModalOpen, setIsBugReportModalOpen] = useState(false);
  const [bugModalTargetApp, setBugModalTargetApp] = useState<AppListing | null>(null);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackModalApp, setFeedbackModalApp] = useState<AppListing | null>(null);
  const [feedbackModalPhase, setFeedbackModalPhase] = useState<'day_1' | 'day_3' | 'day_7' | 'day_14'>('day_1');

  const [selectedDetailApp, setSelectedDetailApp] = useState<AppListing | null>(null);

  // Handlers
  const handleOpenReportBug = (app?: AppListing) => {
    setBugModalTargetApp(app || null);
    setIsBugReportModalOpen(true);
  };

  const handleOpenFeedback = (app?: AppListing, phase?: 'day_1' | 'day_3' | 'day_7' | 'day_14') => {
    setFeedbackModalApp(app || null);
    setFeedbackModalPhase(phase || 'day_1');
    setIsFeedbackModalOpen(true);
  };

  const handleOpenDeveloperProfile = (developerId: string) => {
    setTargetDeveloperId(developerId);
    setActiveTab('dev_profile');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenOwnProfile = () => {
    setTargetDeveloperId(null);
    setActiveTab('dev_profile');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPublish={() => setIsPublishModalOpen(true)}
        onOpenGoogleAuth={() => setIsAuthModalOpen(true)}
        onOpenOwnProfile={handleOpenOwnProfile}
      />

      {/* Floating Quick Action: Report Bug with Screenshot button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <button
          onClick={() => handleOpenReportBug(apps[0])}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl shadow-rose-600/30 flex items-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer"
          title="Report Bug with Screenshot"
        >
          <Bug className="w-4 h-4" />
          <span>Report Bug + Screenshot</span>
        </button>
      </div>

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeTab === 'catalog' && (
          <AppCatalog
            onSelectApp={(app) => setSelectedDetailApp(app)}
            onOpenReportBug={handleOpenReportBug}
            onOpenFeedback={(app) => handleOpenFeedback(app, 'day_1')}
            onOpenPublish={() => setIsPublishModalOpen(true)}
            onSelectDeveloper={handleOpenDeveloperProfile}
          />
        )}

        {activeTab === 'tester_hub' && (
          <TesterHub
            onSelectApp={(app) => setSelectedDetailApp(app)}
            onOpenReportBug={handleOpenReportBug}
            onOpenFeedback={handleOpenFeedback}
            onExploreCatalog={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'dev_dashboard' && (
          <DeveloperDashboard
            onSelectApp={(app) => setSelectedDetailApp(app)}
            onOpenPublish={() => setIsPublishModalOpen(true)}
          />
        )}

        {activeTab === 'dev_profile' && (
          <DeveloperProfilePage
            targetDeveloperId={targetDeveloperId}
            onOpenPublishModal={() => setIsPublishModalOpen(true)}
            onSelectApp={(app) => setSelectedDetailApp(app)}
          />
        )}

        {activeTab === 'community' && (
          <CommunityFeedbackBoard />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 font-display text-base shadow-md shadow-emerald-500/20">
              88
            </div>
            <div>
              <p className="font-bold text-white tracking-tight flex items-center gap-1.5 font-display">
                DROID88
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-medium">
                  Supabase Powered
                </span>
              </p>
              <p className="text-xs text-slate-400">Android Closed Testing Marketplace & Developer Community</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
            <button 
              onClick={() => setActiveTab('catalog')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Browse Apps
            </button>
            <button 
              onClick={() => setActiveTab('tester_hub')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              14-Day Tester Hub
            </button>
            <button 
              onClick={() => setActiveTab('dev_dashboard')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Developer Console
            </button>
            <button 
              onClick={() => setActiveTab('community')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Feature Voting
            </button>
            <button
              onClick={resetToSampleData}
              className="text-slate-400 hover:text-amber-400 transition cursor-pointer"
              title="Reset state to initial mock data"
            >
              Reset Sample Data
            </button>
          </div>

          <div className="text-xs text-slate-400 text-center md:text-right">
            Designed for Google Play 20-tester closed track compliance.
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <PublishAppModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onSuccess={() => {
          setIsPublishModalOpen(false);
          setActiveTab('dev_dashboard');
        }}
      />

      {selectedDetailApp && (
        <AppDetailModal
          app={selectedDetailApp}
          onClose={() => setSelectedDetailApp(null)}
          onOpenReportBug={(app) => {
            setSelectedDetailApp(null);
            handleOpenReportBug(app);
          }}
          onOpenFeedback={(app, phase) => {
            setSelectedDetailApp(null);
            handleOpenFeedback(app, phase);
          }}
          onSelectDeveloper={(devId) => {
            setSelectedDetailApp(null);
            handleOpenDeveloperProfile(devId);
          }}
        />
      )}

      <BugReportModal
        isOpen={isBugReportModalOpen}
        onClose={() => {
          setIsBugReportModalOpen(false);
          setBugModalTargetApp(null);
        }}
        defaultApp={bugModalTargetApp}
      />

      <AutomatedFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setFeedbackModalApp(null);
        }}
        app={feedbackModalApp}
        initialPhase={feedbackModalPhase}
      />
    </div>
  );
};

export default function HomePage() {
  return (
    <AppProvider>
      <Droid88Hub />
    </AppProvider>
  );
}
