import React, { useRef } from 'react';
import { X, Moon, Sun, Upload, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_COLORS = [
  { id: 'teal', hex: '#059fc5', label: 'ReadWorks Blue' },
  { id: 'copper', hex: '#24678d', label: 'Studio Navy' },
  { id: 'gold', hex: '#ef8e3b', label: 'Lesson Coral' },
  { id: 'violet', hex: '#2f6f9b', label: 'Signal Blue' },
  { id: 'lime', hex: '#4aa36a', label: 'Partner Green' },
] as const;

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { mode, setMode, accent, setAccent, backgroundImage, setBackgroundImage } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBackgroundImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            Portal settings
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8 p-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Appearance</h3>
            <div className="flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              <button
                onClick={() => setMode('light')}
                className={cn(
                  'flex flex-1 items-center justify-center space-x-2 rounded-md py-2 text-sm font-medium transition-all',
                  mode === 'light'
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300',
                )}
              >
                <Sun size={16} />
                <span>Light</span>
              </button>
              <button
                onClick={() => setMode('dark')}
                className={cn(
                  'flex flex-1 items-center justify-center space-x-2 rounded-md py-2 text-sm font-medium transition-all',
                  mode === 'dark'
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300',
                )}
              >
                <Moon size={16} />
                <span>Dark</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">ReadWorks palette</h3>
            <div className="flex space-x-3">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setAccent(color.id)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110',
                    accent === color.id && 'ring-2 ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-900',
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                >
                  {accent === color.id && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Backdrop artwork</h3>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <Upload size={16} />
                <span>Upload portal artwork</span>
              </button>
              {backgroundImage && (
                <button
                  onClick={() => setBackgroundImage(null)}
                  className="flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={16} />
                  <span>Clear</span>
                </button>
              )}
            </div>
            {backgroundImage && (
              <div className="relative mt-3 h-24 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                <img src={backgroundImage} alt="Backdrop preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
