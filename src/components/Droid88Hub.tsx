'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { AppCatalog } from '@/components/AppCatalog';
import { DeveloperDashboard } from '@/components/DeveloperDashboard';
import { DeveloperProfilePage } from '@/components/DeveloperProfilePage';
import { TesterHub } from '@/components/TesterHub';
import { CommunityFeedbackBoard } from '@/components/CommunityFeedbackBoard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { GoogleAuthModal } from '@/components/GoogleAuthModal';
import { PublishAppModal } from '@/components/PublishAppModal';
import { BugReportModal } from '@/components/BugReportModal';
import { AutomatedFeedbackModal } from '@/components/AutomatedFeedbackModal';
import { AppDetailPage } from '@/components/AppDetailPage';
import { AppListing, slugify } from '@/types';

export type AppTab = 'catalog' | 'tester_hub' | 'dev_dashboard' | 'dev_profile' | 'community' | 'analytics' | 'app_detail';

export interface Droid88HubProps {
  initialTab?: AppTab;
  initialDeveloperId?: string | null;
  initialAppId?: string | null;
}

export const Droid88Hub: React.FC<Droid88HubProps> = ({
  initialTab = 'catalog',
  initialDeveloperId = null,
  initialAppId = null
}) => {
  const { apps, currentUser, resetToSampleData } = useApp();

  // Navigation state
  const [activeTab, setActiveTab] = useState<AppTab>(initialTab);
  const [targetDeveloperId, setTargetDeveloperId] = useState<string | null>(initialDeveloperId);
  const [targetAppId, setTargetAppId] = useState<string | null>(initialAppId);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isBugReportModalOpen, setIsBugReportModalOpen] = useState(false);
  const [bugModalTargetApp, setBugModalTargetApp] = useState<AppListing | null>(null);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackModalApp, setFeedbackModalApp] = useState<AppListing | null>(null);
  const [feedbackModalPhase, setFeedbackModalPhase] = useState<'day_1' | 'day_3' | 'day_7' | 'day_14'>('day_1');

  // Sync state if props change (e.g. Next.js route navigation)
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
    if (initialDeveloperId !== undefined) setTargetDeveloperId(initialDeveloperId);
    if (initialAppId !== undefined) setTargetAppId(initialAppId);
  }, [initialTab, initialDeveloperId, initialAppId]);

  // Support browser back/forward buttons and query params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check query params if not set by props
    if (!initialDeveloperId && !initialAppId) {
      const searchParams = new URLSearchParams(window.location.search);
      const devParam = searchParams.get('dev') || searchParams.get('profile');
      const appParam = searchParams.get('app');
      const tabParam = searchParams.get('tab') as AppTab;

      if (appParam) {
        setTargetAppId(appParam);
        setActiveTab('app_detail');
      } else if (devParam) {
        setTargetDeveloperId(devParam);
        setActiveTab('dev_profile');
      } else if (tabParam) {
        setActiveTab(tabParam);
      }
    }

    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/app/')) {
        const id = path.replace('/app/', '');
        setTargetAppId(id);
        setActiveTab('app_detail');
      } else if (path.startsWith('/profile/')) {
        const id = path.replace('/profile/', '');
        setTargetDeveloperId(id);
        setActiveTab('dev_profile');
      } else if (path === '/profile') {
        setTargetDeveloperId(null);
        setActiveTab('dev_profile');
      } else {
        const search = new URLSearchParams(window.location.search);
        const tab = search.get('tab') as AppTab;
        setActiveTab(tab || 'catalog');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initialDeveloperId, initialAppId]);

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

  const handleOpenDeveloperProfile = (developerIdentifier: string) => {
    const matchingApp = apps.find(a => 
      a.developerId.toLowerCase() === developerIdentifier.toLowerCase() || 
      slugify(a.developerName) === slugify(developerIdentifier)
    );
    const slug = matchingApp?.developerName ? slugify(matchingApp.developerName) : slugify(developerIdentifier);
    const target = slug || developerIdentifier;

    setTargetDeveloperId(target);
    setActiveTab('dev_profile');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/profile/${target}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenAppDetail = (app: AppListing) => {
    setTargetAppId(app.id);
    setActiveTab('app_detail');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/app/${app.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenOwnProfile = () => {
    const ownSlug = currentUser?.developerAccountName 
      ? slugify(currentUser.developerAccountName) 
      : (currentUser ? slugify(currentUser.name || currentUser.id) : null);

    setTargetDeveloperId(ownSlug || null);
    setActiveTab('dev_profile');
    if (typeof window !== 'undefined') {
      const url = ownSlug ? `/profile/${ownSlug}` : '/profile';
      window.history.pushState({}, '', url);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      if (tab === 'catalog') {
        window.history.pushState({}, '', '/');
      } else if (tab === 'dev_profile') {
        const ownSlug = currentUser?.developerAccountName 
          ? slugify(currentUser.developerAccountName) 
          : (currentUser ? slugify(currentUser.name || currentUser.id) : null);
        const target = targetDeveloperId || ownSlug;
        if (target) {
          window.history.pushState({}, '', `/profile/${target}`);
        } else {
          window.history.pushState({}, '', '/profile');
        }
      } else if (tab === 'app_detail') {
        if (targetAppId) {
          window.history.pushState({}, '', `/app/${targetAppId}`);
        }
      } else {
        window.history.pushState({}, '', `/?tab=${tab}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenPublish={() => setIsPublishModalOpen(true)}
        onOpenGoogleAuth={() => setIsAuthModalOpen(true)}
        onOpenOwnProfile={handleOpenOwnProfile}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeTab === 'catalog' && (
          <AppCatalog
            onSelectApp={handleOpenAppDetail}
            onOpenReportBug={handleOpenReportBug}
            onOpenFeedback={(app) => handleOpenFeedback(app, 'day_1')}
            onOpenPublish={() => setIsPublishModalOpen(true)}
            onSelectDeveloper={handleOpenDeveloperProfile}
          />
        )}

        {activeTab === 'app_detail' && (
          (() => {
            const currentApp = apps.find(a => a.id === targetAppId) || apps[0];
            if (!currentApp) {
              return (
                <div className="max-w-xl mx-auto py-16 text-center">
                  <h2 className="text-lg font-bold text-slate-900">App Not Found</h2>
                  <p className="text-xs text-slate-500 mt-1 mb-4">The requested app could not be located.</p>
                  <button
                    onClick={() => handleTabChange('catalog')}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Back to Catalog
                  </button>
                </div>
              );
            }
            return (
              <AppDetailPage
                app={currentApp}
                onBack={() => handleTabChange('catalog')}
                onOpenReportBug={handleOpenReportBug}
                onOpenFeedback={handleOpenFeedback}
                onSelectDeveloper={handleOpenDeveloperProfile}
              />
            );
          })()
        )}

        {activeTab === 'tester_hub' && (
          <TesterHub
            onSelectApp={handleOpenAppDetail}
            onOpenReportBug={handleOpenReportBug}
            onOpenFeedback={handleOpenFeedback}
            onExploreCatalog={() => handleTabChange('catalog')}
          />
        )}

        {activeTab === 'dev_dashboard' && (
          <DeveloperDashboard
            onSelectApp={handleOpenAppDetail}
            onOpenPublish={() => setIsPublishModalOpen(true)}
          />
        )}

        {activeTab === 'dev_profile' && (
          <DeveloperProfilePage
            targetDeveloperId={targetDeveloperId || undefined}
            onOpenPublishModal={() => setIsPublishModalOpen(true)}
            onSelectApp={handleOpenAppDetail}
            onBackToCatalog={() => handleTabChange('catalog')}
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
              onClick={() => handleTabChange('catalog')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Browse Apps
            </button>
            <button 
              onClick={() => handleTabChange('tester_hub')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              14-Day Tester Hub
            </button>
            <button 
              onClick={() => handleTabChange('dev_dashboard')}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Developer Console
            </button>
            <button 
              onClick={() => handleTabChange('community')}
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
          handleTabChange('dev_dashboard');
        }}
      />

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
