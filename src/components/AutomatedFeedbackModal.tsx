import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppListing } from '../types';
import { 
  X, 
  FileText, 
  Star, 
  BatteryCharging, 
  AlertCircle, 
  CheckCircle2, 
  Smile, 
  Zap, 
  Smartphone 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AutomatedFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppListing | null;
  initialPhase?: 'day_1' | 'day_3' | 'day_7' | 'day_14';
}

export const AutomatedFeedbackModal: React.FC<AutomatedFeedbackModalProps> = ({
  isOpen,
  onClose,
  app,
  initialPhase = 'day_1'
}) => {
  const { currentUser, submitAutomatedFeedback, apps } = useApp();

  const [selectedAppId, setSelectedAppId] = useState(app?.id || apps[0]?.id || '');
  const [phase, setPhase] = useState<'day_1' | 'day_3' | 'day_7' | 'day_14' | 'ad_hoc'>(initialPhase);
  const [stabilityRating, setStabilityRating] = useState(5);
  const [batteryImpactRating, setBatteryImpactRating] = useState(2);
  const [uiIntuitivenessRating, setUiIntuitivenessRating] = useState(5);
  const [crashEncountered, setCrashEncountered] = useState(false);
  const [crashDetails, setCrashDetails] = useState('');
  const [favoriteFeatures, setFavoriteFeatures] = useState('');
  const [confusingAreas, setConfusingAreas] = useState('');
  const [netPromoterScore, setNetPromoterScore] = useState(9);
  const [deviceModel, setDeviceModel] = useState(currentUser.deviceInfo?.model || 'Google Pixel 8 Pro');

  if (!isOpen) return null;

  const currentApp = apps.find(a => a.id === selectedAppId) || app || apps[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentApp) return;

    submitAutomatedFeedback({
      appId: currentApp.id,
      appName: currentApp.name,
      phase,
      stabilityRating,
      batteryImpactRating,
      uiIntuitivenessRating,
      crashEncountered,
      crashDetails: crashEncountered ? crashDetails : undefined,
      favoriteFeatures: favoriteFeatures || 'Smooth UI performance and core workflows work as advertised.',
      confusingAreas,
      netPromoterScore,
      deviceModel
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="automated-feedback-modal"
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Automated Beta Feedback Form</h3>
              <p className="text-xs text-slate-300">Continuous telemetry & UX feedback loop for closed testing milestones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Milestone Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 block">
              Testing Milestone Phase
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'day_1', title: 'Day 1', desc: 'Onboarding Check' },
                { id: 'day_3', title: 'Day 3', desc: 'Core Workflows' },
                { id: 'day_7', title: 'Day 7', desc: 'Mid-term & Battery' },
                { id: 'day_14', title: 'Day 14', desc: 'Final Play Signoff' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPhase(item.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    phase === item.id 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold ring-2 ring-indigo-600/20' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="block font-bold">{item.title}</span>
                  <span className="text-[10px] opacity-80 block">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* App Selector */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              App Being Evaluated
            </label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {apps.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.packageName})</option>
              ))}
            </select>
          </div>

          {/* Metric Ratings: Stability & UI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            {/* Stability */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  App Stability Rating
                </span>
                <span className="font-bold text-slate-700">{stabilityRating} / 5</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStabilityRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition"
                  >
                    <Star className={`w-6 h-6 ${star <= stabilityRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 block">
                {stabilityRating === 5 ? 'Rock solid, no glitches' : stabilityRating >= 3 ? 'Minor lag or hiccups' : 'Frequent freezing'}
              </span>
            </div>

            {/* UI Intuitiveness */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-emerald-500" />
                  UI & UX Intuitiveness
                </span>
                <span className="font-bold text-slate-700">{uiIntuitivenessRating} / 5</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUiIntuitivenessRating(star)}
                    className="p-1 text-emerald-500 hover:scale-110 transition"
                  >
                    <Star className={`w-6 h-6 ${star <= uiIntuitivenessRating ? 'fill-emerald-500 text-emerald-500' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 block">
                {uiIntuitivenessRating === 5 ? 'Intuitive Material 3 design' : 'Some buttons hard to find'}
              </span>
            </div>
          </div>

          {/* Battery Drain / Impact */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-emerald-600" />
                <span>Battery Impact on Android Hardware</span>
              </span>
              <span className="font-bold text-slate-800">
                Level {batteryImpactRating} of 5
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={batteryImpactRating}
              onChange={(e) => setBatteryImpactRating(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1: Minimal / Negligible</span>
              <span>3: Moderate</span>
              <span>5: Severe Drain / Phone gets warm</span>
            </div>
          </div>

          {/* Crash Toggle */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Did you experience any app crash or ANR?</span>
                <span className="text-[10px] text-slate-500">Helps pinpoint memory leaks before Play Store launch</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCrashEncountered(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    !crashEncountered ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-600'
                  }`}
                >
                  No Crashes
                </button>
                <button
                  type="button"
                  onClick={() => setCrashEncountered(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    crashEncountered ? 'bg-rose-600 text-white' : 'bg-white border border-slate-300 text-slate-600'
                  }`}
                >
                  Yes, Crashed
                </button>
              </div>
            </div>

            {crashEncountered && (
              <textarea
                value={crashDetails}
                onChange={(e) => setCrashDetails(e.target.value)}
                placeholder="Describe when the crash occurred (e.g. while tapping export or in background)..."
                rows={2}
                className="w-full px-3 py-2 text-xs border border-rose-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            )}
          </div>

          {/* Open Questions */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              What features worked best or stood out?
            </label>
            <textarea
              value={favoriteFeatures}
              onChange={(e) => setFavoriteFeatures(e.target.value)}
              rows={2}
              placeholder="e.g. Fast sync speed, clean graph, responsive dark mode..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Any confusing areas, bottlenecks, or suggestions?
            </label>
            <textarea
              value={confusingAreas}
              onChange={(e) => setConfusingAreas(e.target.value)}
              rows={2}
              placeholder="e.g. The permission popup didn't explain why location is required..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Net Promoter Score */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">
                Likelihood to rate 5 stars on Google Play upon release:
              </span>
              <span className="font-bold text-indigo-700 text-sm">{netPromoterScore} / 10</span>
            </div>
            <div className="flex justify-between gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setNetPromoterScore(score)}
                  className={`flex-1 py-1.5 rounded-md font-bold text-[11px] transition ${
                    netPromoterScore === score
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-700/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Automated Feedback (+40 pts)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
