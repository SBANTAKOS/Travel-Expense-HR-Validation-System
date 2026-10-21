import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isSimulatedDevice: boolean;
  onToggleDeviceMode: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isSimulatedDevice,
  onToggleDeviceMode,
}) => {
  const [time, setTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isSimulatedDevice) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        {/* Responsive full screen mode toolbar */}
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-300">Android Mobile View (Fullscreen Mode)</span>
          </div>
          <button
            onClick={onToggleDeviceMode}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs font-medium cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            Switch to Android Phone Mockup
          </button>
        </div>
        <div className="flex-1 w-full max-w-xl mx-auto bg-white dark:bg-slate-900 shadow-xl min-h-[90vh] flex flex-col">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-6 px-4 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950">
      {/* Switch frame mode button */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={onToggleDeviceMode}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition cursor-pointer"
        >
          <Monitor className="w-3.5 h-3.5 text-indigo-500" />
          <span>Switch to Responsive Fullscreen Mode</span>
        </button>
      </div>

      {/* Android Device Shell (Google Pixel style) */}
      <div className="relative w-[390px] h-[820px] bg-slate-900 rounded-[48px] p-3 shadow-2xl ring-1 ring-slate-800/80 border-4 border-slate-700 flex flex-col overflow-hidden">
        {/* Speaker / Camera Hole Punch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 ring-2 ring-slate-800 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
        </div>

        {/* Inner Phone Screen */}
        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[38px] overflow-hidden flex flex-col relative">
          {/* Android Status Bar */}
          <div className="h-9 px-6 bg-slate-900 text-white flex items-center justify-between text-xs select-none z-40 shrink-0">
            <span className="font-semibold text-xs text-slate-100 tracking-tight">{time}</span>
            <div className="flex items-center gap-2 text-slate-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono">98%</span>
                <BatteryMedium className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Phone Content viewport */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col custom-scrollbar">
            {children}
          </div>

          {/* Android Bottom Gesture Bar */}
          <div className="h-5 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 z-40">
            <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
