'use client'

import React from 'react'
import { Settings, AlertCircle, Maximize2, Hash, Sparkles, Image, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import { useModels } from '../hooks/useModels'

interface AdvancedSettingsProps {
  settings: {
    width: number
    height: number
    seed: number
    enhance: boolean
    model: string
    nologo: boolean
    private: boolean
  }
  showAdvanced: boolean
  setShowAdvanced: (show: boolean) => void
  setSettings: React.Dispatch<React.SetStateAction<typeof settings>>
}

export function AdvancedSettings({
  settings,
  showAdvanced,
  setShowAdvanced,
  setSettings,
}: AdvancedSettingsProps) {
  const { models, isLoading, error } = useModels()

  return (
    <div className="bg-white rounded-lg p-6">
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md p-2"
        aria-expanded={showAdvanced}
        aria-controls="advanced-settings"
      >
        <span className="flex items-center gap-3">
          <Settings className="w-5 h-5" />
          Advanced Settings
        </span>
        {showAdvanced ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {showAdvanced && (
        <div
          id="advanced-settings"
          className="mt-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="width" className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <Maximize2 className="w-5 h-5" />
                Width
              </label>
              <input
                id="width"
                type="number"
                value={settings.width}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    width: parseInt(e.target.value),
                  }))
                }
                className="w-full p-2 pl-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                min="64"
                max="1024"
                step="64"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="height" className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <Maximize2 className="w-5 h-5" />
                Height
              </label>
              <input
                id="height"
                type="number"
                value={settings.height}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    height: parseInt(e.target.value),
                  }))
                }
                className="w-full p-2 pl-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                min="64"
                max="1024"
                step="64"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="seed" className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <Hash className="w-5 h-5" />
              Seed
            </label>
            <input
              id="seed"
              type="number"
              value={settings.seed}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  seed: parseInt(e.target.value),
                }))
              }
              className="w-full p-2 pl-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="model" className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <Settings className="w-5 h-5" />
              Model
            </label>
            {error ? (
              <div className="flex items-center gap-3 text-amber-600 text-sm bg-amber-50 p-3 rounded-md">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>Using default model (flux)</span>
              </div>
            ) : (
              <select
                id="model"
                value={settings.model}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, model: e.target.value }))
                }
                className="w-full p-2 pl-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-shadow disabled:bg-gray-100 disabled:text-gray-500"
                disabled={isLoading}
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

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="enhance"
                type="checkbox"
                checked={settings.enhance}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    enhance: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded transition-colors"
              />
              <label htmlFor="enhance" className="ml-3 flex items-center gap-3 text-sm text-gray-700">
                <Sparkles className="w-5 h-5" />
                Enhance Image Quality
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="nologo"
                type="checkbox"
                checked={settings.nologo}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, nologo: e.target.checked }))
                }
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded transition-colors"
              />
              <label htmlFor="nologo" className="ml-3 flex items-center gap-3 text-sm text-gray-700">
                <Image className="w-5 h-5" />
                Remove Watermark
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="private"
                type="checkbox"
                checked={settings.private}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    private: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded transition-colors"
              />
              <label htmlFor="private" className="ml-3 flex items-center gap-3 text-sm text-gray-700">
                <Lock className="w-5 h-5" />
                Private Generation
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
