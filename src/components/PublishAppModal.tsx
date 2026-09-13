import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppCategory, TesterTier } from '../types';
import { 
  X, 
  Sparkles, 
  Smartphone, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PublishAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_ICONS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&auto=format&fit=crop&q=80'
];

export const PublishAppModal: React.FC<PublishAppModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { publishApp } = useApp();

  const [name, setName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [versionName, setVersionName] = useState('1.0.0-rc1');
  const [versionCode, setVersionCode] = useState(1);
  const [category, setCategory] = useState<AppCategory>('Productivity');
  const [icon, setIcon] = useState(DEFAULT_ICONS[0]);
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [testingTrackUrl, setTestingTrackUrl] = useState('');
  const [webOptInUrl, setWebOptInUrl] = useState('');
  const [androidOptInUrl, setAndroidOptInUrl] = useState('');
  const [googleGroupUrl, setGoogleGroupUrl] = useState('');
  const [requiredTier, setRequiredTier] = useState<TesterTier>('tier_1_standard');
  const [targetTesters, setTargetTesters] = useState(20);
  const [testDurationDays, setTestDurationDays] = useState(14);
  const [minAndroidVersion, setMinAndroidVersion] = useState('Android 11 (API 30)+');

  // Auto-detect package name and dual URLs when pasting any Play link
  const handleUrlOrPackageChange = (val: string) => {
    setTestingTrackUrl(val);

    let detectedPkg = '';
    // Format 1: https://play.google.com/apps/testing/<pkg>
    if (val.includes('/apps/testing/')) {
      detectedPkg = val.split('/apps/testing/')[1]?.split('?')[0]?.split('#')[0] || '';
    } 
    // Format 2: https://play.google.com/store/apps/details?id=<pkg>
    else if (val.includes('id=')) {
      try {
        const u = new URL(val);
        detectedPkg = u.searchParams.get('id') || '';
      } catch (e) {
        // ignore
      }
    }
    // Format 3: Raw package name like com.company.app
    else if (/^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)+$/.test(val.trim())) {
      detectedPkg = val.trim();
    }

    if (detectedPkg) {
      if (!packageName) setPackageName(detectedPkg);
      setWebOptInUrl(`https://play.google.com/apps/testing/${detectedPkg}`);
      setAndroidOptInUrl(`https://play.google.com/store/apps/details?id=${detectedPkg}`);
    }
  };
  
  const [focusPoints, setFocusPoints] = useState<string[]>([
    'In-app billing and subscription restore testing',
    'Background sync and push notification reliability'
  ]);
  const [newFocus, setNewFocus] = useState('');

  if (!isOpen) return null;

  const handleAddFocus = () => {
    if (newFocus.trim()) {
      setFocusPoints([...focusPoints, newFocus.trim()]);
      setNewFocus('');
    }
  };

  const handleRemoveFocus = (index: number) => {
    setFocusPoints(focusPoints.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !packageName || !testingTrackUrl) return;

    publishApp({
      name,
      packageName: packageName.trim().toLowerCase(),
      versionName,
      versionCode: Number(versionCode),
      icon,
      category,
      shortDescription,
      fullDescription,
      testingTrackUrl: testingTrackUrl.trim(),
      webOptInUrl: webOptInUrl.trim() || `https://play.google.com/apps/testing/${packageName.trim().toLowerCase()}`,
      androidOptInUrl: androidOptInUrl.trim() || `https://play.google.com/store/apps/details?id=${packageName.trim().toLowerCase()}`,
      googleGroupUrl: googleGroupUrl ? googleGroupUrl.trim() : undefined,
      requiredTier,
      targetTesters: Number(targetTesters) || 20,
      testDurationDays: Number(testDurationDays) || 14,
      testStartDate: new Date().toISOString().split('T')[0],
      testingFocus: focusPoints.length > 0 ? focusPoints : ['General app stability and performance'],
      minAndroidVersion,
      screenshots: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80'
      ]
    });

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="publish-app-modal"
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Publish Android App for Closed Testing</h3>
              <p className="text-xs text-slate-300">Recruit 20 testers for 14 continuous days to satisfy Google Play requirements</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Track URL & Package Name */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Google Play Closed Testing Credentials</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Google Play Track Opt-in or Package Name <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                  Auto-Detects Web & Android Links
                </span>
              </div>
              <input
                type="text"
                value={testingTrackUrl}
                onChange={(e) => handleUrlOrPackageChange(e.target.value)}
                placeholder="Paste Play Console URL or package name (e.g. com.company.app)"
                className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Paste either link from Play Console &gt; Closed Testing &gt; Testers ("Join on Android" or "Join on the Web"). We will generate both automatically!
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Package Name (Application ID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => {
                    const pkg = e.target.value.trim();
                    setPackageName(pkg);
                    if (pkg && !testingTrackUrl) {
                      handleUrlOrPackageChange(pkg);
                    }
                  }}
                  placeholder="com.example.myapp"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Google Group / Email List URL (Optional)
                </label>
                <input
                  type="url"
                  value={googleGroupUrl}
                  onChange={(e) => setGoogleGroupUrl(e.target.value)}
                  placeholder="https://groups.google.com/g/my-beta-testers"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Preview Generated Links */}
            {(webOptInUrl || androidOptInUrl) && (
              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Generated Play Console Links for Testers:
                </span>
                <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px] truncate">
                  <span className="font-sans font-bold text-slate-800 shrink-0">Web:</span>
                  <span className="truncate">{webOptInUrl || `https://play.google.com/apps/testing/${packageName}`}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px] truncate">
                  <span className="font-sans font-bold text-slate-800 shrink-0">Android:</span>
                  <span className="truncate">{androidOptInUrl || `https://play.google.com/store/apps/details?id=${packageName}`}</span>
                </div>
              </div>
            )}
          </div>

          {/* App Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                App Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Health Companion"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="Productivity">Productivity</option>
                <option value="Health & Fitness">Health & Fitness</option>
                <option value="Finance">Finance</option>
                <option value="Tools & Utilities">Tools & Utilities</option>
                <option value="Games">Games</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Social">Social</option>
                <option value="Education">Education</option>
              </select>
            </div>
          </div>

          {/* Version and Min OS */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Version Name</label>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="1.0.0-rc1"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Version Code</label>
              <input
                type="number"
                value={versionCode}
                onChange={(e) => setVersionCode(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Min Android OS</label>
              <input
                type="text"
                value={minAndroidVersion}
                onChange={(e) => setMinAndroidVersion(e.target.value)}
                placeholder="Android 11 (API 30)+"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Tier Access and Target Testers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Required Tester Access Tier
              </label>
              <select
                value={requiredTier}
                onChange={(e) => setRequiredTier(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="tier_1_standard">Tier 1: Standard (All Community Testers)</option>
                <option value="tier_2_verified">Tier 2: Verified Beta Testers Only</option>
                <option value="tier_3_core">Tier 3: Core QA & Internal VIPs Only</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Restrict to verified testers for higher reliability and NDA builds.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Target Testers Benchmark
              </label>
              <input
                type="number"
                value={targetTesters}
                onChange={(e) => setTargetTesters(Number(e.target.value))}
                min={5}
                max={100}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Google Play requires 20 opted-in testers for 14 continuous days.
              </span>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Short Summary / Pitch <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One line explaining what your app does and who it's for..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Full Testing Instructions & Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              rows={3}
              placeholder="Detail testing goals, known caveats, sandbox credentials, or what testers should pay attention to..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          {/* Testing Focus Points */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Testing Focus Areas (What to test)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newFocus}
                onChange={(e) => setNewFocus(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFocus(); } }}
                placeholder="e.g. Test Biometric Prompt on Samsung One UI..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddFocus}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Add
              </button>
            </div>

            <div className="space-y-1.5">
              {focusPoints.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="text-slate-700 font-medium">• {item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFocus(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Icon Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">App Icon</label>
            <div className="flex items-center gap-3">
              {DEFAULT_ICONS.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(imgUrl)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition ${
                    icon === imgUrl ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition cursor-pointer"
            >
              Publish to Closed Testing Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
