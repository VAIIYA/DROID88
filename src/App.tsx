import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AppCatalog } from './components/AppCatalog';
import { DeveloperDashboard } from './components/DeveloperDashboard';
import { DeveloperProfilePage } from './components/DeveloperProfilePage';
import { TesterHub } from './components/TesterHub';
import { CommunityFeedbackBoard } from './components/CommunityFeedbackBoard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { PublishAppModal } from './components/PublishAppModal';
import { AppDetailModal } from './components/AppDetailModal';
import { BugReportModal } from './components/BugReportModal';
import { AutomatedFeedbackModal } from './components/AutomatedFeedbackModal';
import { AppListing } from './types';
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

const MainApp: React.FC = () => {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenOwnProfile = () => {
    setTargetDeveloperId(null);
    setActiveTab('dev_profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            onOpenReportBug={(app) => handleOpenReportBug(app)}
            onOpenFeedback={(app) => handleOpenFeedback(app)}
            onOpenPublish={() => setIsPublishModalOpen(true)}
            onSelectDeveloper={handleOpenDeveloperProfile}
          />
        )}

        {/* Dedicated Developer Profile Page */}
        {activeTab === 'dev_profile' && (
          <DeveloperProfilePage
            targetDeveloperId={targetDeveloperId || undefined}
            onSelectApp={(app) => setSelectedDetailApp(app)}
            onOpenPublishModal={() => setIsPublishModalOpen(true)}
            onBackToCatalog={() => {
              setTargetDeveloperId(null);
              setActiveTab('catalog');
            }}
          />
        )}

        {activeTab === 'dev_dashboard' && (
          <DeveloperDashboard
            onSelectApp={(app) => setSelectedDetailApp(app)}
            onOpenPublish={() => setIsPublishModalOpen(true)}
          />
        )}

        {activeTab === 'tester_hub' && (
          <TesterHub
            onSelectApp={(app) => setSelectedDetailApp(app)}
            onOpenReportBug={(app) => handleOpenReportBug(app)}
            onOpenFeedback={(app, phase) => handleOpenFeedback(app, phase)}
            onExploreCatalog={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'community' && (
          <CommunityFeedbackBoard />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}
      </main>

      {/* WordPress / WooCommerce Style Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 text-xs py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="font-display font-black text-base tracking-tight text-white">
                  DROID<span className="text-emerald-400">88</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                WordPress & WooCommerce-style closed testing management community for Android developers and verified beta testers. Powered by Firebase Auth & Cloud Firestore persistence.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Google Play 14-Day Rules</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>20 opted-in testers requirement</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>14 continuous active testing days</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Automated telemetry milestones</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Developer Tools</h4>
              <ul className="space-y-2 text-slate-400">
                <li 
                  onClick={handleOpenOwnProfile}
                  className="hover:text-emerald-400 cursor-pointer flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>My Developer Profile</span>
                </li>
                <li 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hover:text-emerald-400 cursor-pointer"
                >
                  Google Identity & Account Switcher
                </li>
                <li 
                  onClick={() => setIsPublishModalOpen(true)}
                  className="hover:text-emerald-400 cursor-pointer"
                >
                  Publish New 14-Day Track
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Active Developer Account</h4>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                <div className="flex items-center gap-2">
                  <img src={currentUser.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  <span className="font-bold text-slate-200 truncate">
                    {currentUser.developerAccountName || currentUser.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono truncate">{currentUser.email}</span>
                <span className="text-[10px] text-emerald-400 font-bold capitalize block">
                  Role: {currentUser.role} • Cloud Firestore Synced
                </span>
              </div>
              <button
                onClick={resetToSampleData}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Reset Demo Data to Initial State
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} DROID88. Built for Android developers testing on Google Play Console.</p>
            <div className="flex items-center gap-4">
              <span>Firebase Google Sign-in</span>
              <span>•</span>
              <span>Persistent Firestore Profiles</span>
              <span>•</span>
              <span>14-Day Analytics</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <PublishAppModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onSuccess={() => {}}
      />

      <BugReportModal
        isOpen={isBugReportModalOpen}
        onClose={() => setIsBugReportModalOpen(false)}
        defaultApp={bugModalTargetApp}
      />

      <AutomatedFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        app={feedbackModalApp}
        initialPhase={feedbackModalPhase}
      />

      <AppDetailModal
        app={selectedDetailApp}
        isOpen={Boolean(selectedDetailApp)}
        onClose={() => setSelectedDetailApp(null)}
        onOpenBugReport={(app) => handleOpenReportBug(app)}
        onOpenFeedback={(app) => handleOpenFeedback(app)}
        onSelectDeveloper={handleOpenDeveloperProfile}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
