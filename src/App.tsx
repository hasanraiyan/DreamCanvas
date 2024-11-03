import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ImageIcon, RefreshCw, Sparkles, Moon, Sun } from 'lucide-react';
import { AdvancedSettings } from './components/AdvancedSettings';
import { ImageSkeleton } from './components/ImageSkeleton';
import { ImageDialog } from './components/ImageDialog';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  // State management
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [imageMetadata, setImageMetadata] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationState, setGenerationState] = useState({
    status: 'idle',
    progress: 0,
  });
  const [imageItems, setImageItems] = useState([]);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [settings, setSettings] = useState({
    width: 512,
    height: 512,
    seed: Math.floor(Math.random() * 1000000),
    enhance: true,
    model: 'flux-anime',
    nologo: true,
    private: true,
  });
  const [darkMode, setDarkMode] = useState(false);

  // Refs
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Utility functions
  const createImageUrl = useCallback(
    (promptText, seed) => {
      const params = new URLSearchParams({
        width: settings.width.toString(),
        height: settings.height.toString(),
        seed: seed.toString(),
        enhance: settings.enhance.toString(),
        model: settings.model,
        nologo: settings.nologo.toString(),
        private: settings.private.toString(),
      });

      return `https://image.pollinations.ai/prompt/${encodeURIComponent(
        promptText
      )}?${params}`;
    },
    [settings]
  );

  const loadImage = async (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  };

  const updateProgress = (loadedCount, totalCount) => {
    setGenerationState((prev) => ({
      ...prev,
      progress: (loadedCount / totalCount) * 100,
    }));
  };

  const generateImages = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setGenerationState({
      status: 'starting',
      startTime: Date.now(),
      progress: 0,
    });

    abortControllerRef.current = new AbortController();

    try {
      const imageCount = 4;
      const newImageItems = [];
      const seeds = Array.from({ length: imageCount }, () =>
        Math.floor(Math.random() * 1000000)
      );

      seeds.forEach((seed) => {
        const url = createImageUrl(prompt, seed);
        const metadata = {
          seed,
          params: {
            width: settings.width,
            height: settings.height,
            enhance: settings.enhance,
            model: settings.model,
          },
          timestamp: new Date().toISOString(),
        };

        newImageItems.push({
          url,
          status: 'loading',
          metadata,
        });
      });

      setImageItems(newImageItems);
      setGenerationState((prev) => ({ ...prev, status: 'generating' }));

      const loadImageWithRetry = async (url, retries = 3) => {
        try {
          return await loadImage(url);
        } catch (error) {
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return loadImageWithRetry(url, retries - 1);
          }
          throw error;
        }
      };

      const loadPromises = newImageItems.map(async (item, index) => {
        try {
          const loadedUrl = await loadImageWithRetry(item.url);
          setImageItems((current) => {
            const updated = [...current];
            updated[index] = { ...updated[index], status: 'loaded' };
            return updated;
          });
          updateProgress(index + 1, imageCount);
          return loadedUrl;
        } catch (error) {
          setImageItems((current) => {
            const updated = [...current];
            updated[index] = { ...updated[index], status: 'error' };
            return updated;
          });
          throw error;
        }
      });

      const results = await Promise.allSettled(loadPromises);

      const loadedImages = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);

      if (loadedImages.length === 0) {
        throw new Error('All images failed to load');
      }

      setImages(loadedImages);
      setImageMetadata(newImageItems.map((item) => item.metadata));

      setGenerationState((prev) => ({
        ...prev,
        status: 'completed',
        endTime: Date.now(),
        progress: 100,
      }));

      setGenerationHistory((prev) => [
        {
          prompt,
          images: loadedImages,
          metadata: newImageItems.map((item) => item.metadata),
        },
        ...prev,
      ]);

      const generationTime = (
        (Date.now() - generationState.startTime) /
        1000
      ).toFixed(1);
      toast.success(
        `Generated ${loadedImages.length} images in ${generationTime}s`
      );
    } catch (error) {
      setGenerationState((prev) => ({
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      toast.error(
        `Generation failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleDownload = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dream-canvas-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const regenerateImages = useCallback(() => {
    generateImages();
  }, [generateImages]);

  const renderGenerationStatus = () => {
    if (generationState.status === 'idle') return null;

    const getStatusMessage = () => {
      switch (generationState.status) {
        case 'starting':
          return 'Initializing generation...';
        case 'generating':
          return `Generating images: ${Math.round(generationState.progress)}%`;
        case 'completed':
          const timeTaken = (
            (generationState.endTime - generationState.startTime) /
            1000
          ).toFixed(1);
          return `Generation completed in ${timeTaken}s`;
        case 'failed':
          return `Generation failed: ${generationState.error}`;
        default:
          return '';
      }
    };

    return (
      <div className="mt-4 text-center">
        <p className="text-gray-700">{getStatusMessage()}</p>
        {generationState.status === 'generating' && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${generationState.progress}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200">
        <ToastContainer theme={darkMode ? 'dark' : 'light'} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Dream Canvas
              </h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="text-yellow-400" />
              ) : (
                <Moon className="text-gray-700" />
              )}
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
            Transform your imagination into stunning visuals
          </p>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your imagination..."
                  className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
                <motion.button
                  onClick={generateImages}
                  disabled={!prompt || isLoading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-5 h-5" />
                  {isLoading ? 'Generating...' : 'Generate'}
                </motion.button>
              </div>

              <AdvancedSettings
                settings={settings}
                showAdvanced={showAdvanced}
                setShowAdvanced={setShowAdvanced}
                setSettings={setSettings}
              />
            </div>

            {renderGenerationStatus()}

            <AnimatePresence>
              <motion.div
                className="grid grid-cols-2 gap-4 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {imageItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className="relative group aspect-square"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {item.status === 'loading' ? (
                      <ImageSkeleton />
                    ) : item.status === 'error' ? (
                      <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg text-red-500 dark:text-red-300 h-full flex items-center justify-center">
                        Failed to load image
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={`Generated artwork ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                    {item && (
                      <ImageDialog
                        image={item}
                        prompt={prompt}
                        settings={settings}
                        // metadata={item.metadata}
                        onDownload={handleDownload}
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {images.length > 0 && (
              <div className="mt-6 text-center">
                <motion.button
                  onClick={regenerateImages}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="w-5 h-5" />
                  Regenerate Images
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;