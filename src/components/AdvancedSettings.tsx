import React from 'react';
import { Settings, AlertCircle } from 'lucide-react';
import { useModels } from '../hooks/useModels';

interface AdvancedSettingsProps {
  settings: {
    width: number;
    height: number;
    seed: number;
    enhance: boolean;
    model: string;
    nologo: boolean;
    private: boolean;
  };
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
  setSettings: React.Dispatch<React.SetStateAction<typeof settings>>;
}

export function AdvancedSettings({
  settings,
  showAdvanced,
  setShowAdvanced,
  setSettings,
}: AdvancedSettingsProps) {
  const { models, isLoading, error } = useModels();

  return (
    <div className="p-4 bg-white rounded-lg ">
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="mt-4 text-gray-600 text-sm flex items-center gap-1 hover:text-indigo-600 transition-colors focus:outline-none"
        aria-expanded={showAdvanced}
        aria-controls="advanced-settings"
      >
        <Settings className="w-4 h-4" />
        {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
      </button>

      {showAdvanced && (
        <div
          id="advanced-settings"
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width
            </label>
            <input
              type="number"
              value={settings.width}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  width: parseInt(e.target.value),
                }))
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              min="64"
              max="1024"
              step="64"
              aria-label="Width"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height
            </label>
            <input
              type="number"
              value={settings.height}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  height: parseInt(e.target.value),
                }))
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              min="64"
              max="1024"
              step="64"
              aria-label="Height"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seed
            </label>
            <input
              type="number"
              value={settings.seed}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  seed: parseInt(e.target.value),
                }))
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              aria-label="Seed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            {error ? (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Using default model (flux)</span>
              </div>
            ) : (
              <select
                value={settings.model}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, model: e.target.value }))
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                disabled={isLoading}
                aria-label="Model"
              >
                {isLoading ? (
                  <option>Loading models...</option>
                ) : (
                  models.map((model) => (
                    <option key={model} value={model}>
                      {model.charAt(0).toUpperCase() + model.slice(1)}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>
          <div className="col-span-2 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enhance}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    enhance: e.target.checked,
                  }))
                }
                className="rounded text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                aria-label="Enhance Image Quality"
              />
              <span className="text-sm text-gray-700">
                Enhance Image Quality
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.nologo}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, nologo: e.target.checked }))
                }
                className="rounded text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                aria-label="Remove Watermark"
              />
              <span className="text-sm text-gray-700">Remove Watermark</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.private}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    private: e.target.checked,
                  }))
                }
                className="rounded text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                aria-label="Private Generation"
              />
              <span className="text-sm text-gray-700">Private Generation</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
