import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AppListing, BugSeverity } from '../types';
import { 
  X, 
  Bug, 
  UploadCloud, 
  Trash2, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle2, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultApp?: AppListing | null;
}

const SAMPLE_SCREENSHOTS = [
  {
    label: 'NullPointer Logcat',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'UI Glitch / Overlap',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'ANR / Freeze Screen',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80'
  }
];

export const BugReportModal: React.FC<BugReportModalProps> = ({
  isOpen,
  onClose,
  defaultApp
}) => {
  const { apps, currentUser, reportBug } = useApp();

  const [selectedAppId, setSelectedAppId] = useState(defaultApp?.id || apps[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('1. Open app\n2. Navigate to ...\n3. Tap on ...');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [severity, setSeverity] = useState<BugSeverity>('major');
  const [deviceModel, setDeviceModel] = useState(currentUser.deviceInfo?.model || 'Google Pixel 8 Pro');
  const [osVersion, setOsVersion] = useState(currentUser.deviceInfo?.osVersion || 'Android 14 (API 34)');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentApp = apps.find(a => a.id === selectedAppId) || defaultApp || apps[0];

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setScreenshotUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) handleFileUpload(blob);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !selectedAppId) return;

    reportBug({
      appId: selectedAppId,
      appName: currentApp ? currentApp.name : 'Android App',
      title,
      description,
      stepsToReproduce,
      expectedResult,
      actualResult,
      severity,
      deviceModel,
      osVersion,
      appVersion: currentApp ? `v${currentApp.versionName} (${currentApp.versionCode})` : '1.0.0',
      screenshotUrl: screenshotUrl || undefined
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto"
      onPaste={handlePaste}
    >
      <div 
        id="bug-report-modal"
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md">
              <Bug className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Report Bug with Screenshot</h3>
              <p className="text-xs text-slate-300">Submit visual diagnostics directly to the Android development team</p>
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
          {/* Target App */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Closed Testing App <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              required
            >
              {apps.map(app => (
                <option key={app.id} value={app.id}>
                  {app.name} ({app.packageName}) - v{app.versionName}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Bug Severity Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'blocker', label: 'Blocker / Crash', desc: 'App crashes or freezes', color: 'border-rose-500 text-rose-700 bg-rose-50' },
                { id: 'major', label: 'Major Issue', desc: 'Core feature broken', color: 'border-amber-500 text-amber-700 bg-amber-50' },
                { id: 'minor', label: 'Minor Defect', desc: 'Workaround exists', color: 'border-blue-500 text-blue-700 bg-blue-50' },
                { id: 'cosmetic', label: 'Cosmetic / Typo', desc: 'UI layout or wording', color: 'border-slate-500 text-slate-700 bg-slate-50' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSeverity(item.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    severity === item.id 
                      ? `${item.color} ring-2 ring-offset-1 font-bold` 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="block font-semibold">{item.label}</span>
                  <span className="text-[10px] opacity-80 block">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Issue Summary / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fatal ANR when resuming Bluetooth sync from lock screen"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          {/* Screenshot Upload (Direct paste & drag & sample) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Screenshot Attachment (Upload, Paste or Drag)</span>
              </label>
              {screenshotUrl && (
                <button
                  type="button"
                  onClick={() => setScreenshotUrl('')}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            {screenshotUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-900/10 max-h-56 flex items-center justify-center p-2">
                <img
                  src={screenshotUrl}
                  alt="Screenshot preview"
                  className="max-h-52 max-w-full rounded-lg object-contain"
                />
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-50/50' 
                    : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
              >
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  Drop screenshot here, or click to browse
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports PNG, JPG, or direct <kbd className="px-1 py-0.5 bg-slate-100 border rounded font-mono text-[10px]">Ctrl+V</kbd> clipboard paste
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}

            {/* Quick Sample Presets */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span className="font-medium">Or attach test screenshot:</span>
              {SAMPLE_SCREENSHOTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setScreenshotUrl(sample.url)}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 font-medium transition cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Steps to Reproduce */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Steps to Reproduce
            </label>
            <textarea
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              placeholder="1. Launch app..."
            />
          </div>

          {/* Expected vs Actual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Expected Behavior</label>
              <textarea
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
                rows={2}
                placeholder="What should have happened..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Actual Behavior</label>
              <textarea
                value={actualResult}
                onChange={(e) => setActualResult(e.target.value)}
                rows={2}
                placeholder="What actually occurred or error shown..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Device & OS specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Testing Hardware</label>
              <input
                type="text"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                placeholder="e.g. Google Pixel 8 Pro"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Android OS Version</label>
              <input
                type="text"
                value={osVersion}
                onChange={(e) => setOsVersion(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                placeholder="e.g. Android 14 (API 34)"
              />
            </div>
          </div>

          {/* Submit button */}
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
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-700/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Bug className="w-4 h-4" />
              <span>Submit Bug Report (+30 pts)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
