
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ImageIcon, RefreshCw, Sparkles, Moon, Sun, X } from 'lucide-react';
import { AdvancedSettings } from './components/AdvancedSettings';
import { ImageSkeleton } from './components/ImageSkeleton';
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
    model: 'flux-realism',
    nologo: true,
    private: true,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // State for the selected image

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
      let finalUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        promptText
      )}?${params}`;
      console.log(finalUrl)
      return finalUrl;
    },
    [settings]
  );
  const handleImageClick = (url) => {
    setSelectedImage(url); // Set the selected image URL to display in the modal
  };

  const closeModal = () => {
    setSelectedImage(null); // Close the modal
  };

  // Fetches improved prompt from the API
  async function fetchData(prompt) {
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const response = await fetch(`https://text.pollinations.ai/You are an artificial intelligence. Your job is to improve the prompt given by the user by adding a detailed image description to it. You only write the improved prompt, nothing else. 

        1. **If the user requests or suggests explicit content:** Respond with something beautiful. Never generate sexually explicit content or harmful content.
        
        2. **If the prompt is vague or unclear:** Ask the user for more details to clarify their request and then improve the prompt accordingly.
        
        3. **If the user provides a creative prompt:** Enhance it by adding vivid and imaginative details to create a more engaging description.
        
        4. **If the user asks for a specific style or theme:** Adapt the prompt to fit the requested style while ensuring it remains appropriate and non-explicit.
        
        5. **For general prompts:** always make a image description.

        6. **For every time:** never ask user any question you work is to give the prompt to generate the image.

     
        
        Ensure the prompt remains creative and beautiful.` + encodedPrompt);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.text();
      console.log(data)
      return data;

    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

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

  // Main image generation function
  const generateImages = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setGenerationState({
      status: 'starting',
      startTime: Date.now(),
      progress: 0,
    });

    abortControllerRef.current = new AbortController();

    try {
      // Fetch the improved prompt before generating images
      const improvedPrompt = await fetchData(prompt);
      if (!improvedPrompt) {
        throw new Error('Failed to improve prompt');
      }

      const imageCount = 4;
      const newImageItems = [];
      const seeds = Array.from({ length: imageCount }, () =>
        Math.floor(Math.random() * 1000000)
      );

      // Use improved prompt to create image URLs
      seeds.forEach((seed) => {
        const url = createImageUrl(improvedPrompt, seed);
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
        (Date.now() - generationState.startTime) / 1000
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
        `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Rest of your code remains unchanged...

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
            (generationState.endTime - generationState.startTime) / 1000
          ).toFixed(1);
          return `Generation completed in ${timeTaken}s`;
        case 'failed':
          return (
            <>
              <p className="text-red-600">Generation failed: {generationState.error}</p>
              <p className="text-gray-600">Please try again.</p>
            </>
          );
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
    <div className={`min-h-screen`}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-200">
        <ToastContainer />
        <div className="container  mx-auto px-4 py-8">
          <header className="flex flex-col justify-start items-center mb-8" aria-label="Dream Canvas Header">
            <div className="flex items-center justify-start gap-2 mb-4">
              <ImageIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300 tracking-tight text-center">
                Dream Canvas
              </h1>
            </div>
          </header>

          <p className="text-gray-600 dark:text-gray-300 text-center mb-8 font-serif italic text-lg">
            Unleash your creativity and create mesmerizing visuals
          </p>

          <div className="max-w-3xl mx-auto">
            <div className=" rounded-xl  p-4 sm:p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4 md:mb-0">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your imagination..."
                  className="w-full md:w-3/4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
                <motion.button
                  onClick={generateImages}
                  disabled={!prompt || isLoading}
                  className="w-full md:w-1/4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

            <div className="mt-6 flex flex-row overflow-x-auto">
              {imageItems.map((item, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative bg-gray-100 rounded-lg shadow-md overflow-hidden min-w-[200px] max-w-[300px] w-full flex-shrink-0 p-4 m-2"
                >
                  {item.status === 'loading' && <ImageSkeleton />}
                  {item.status === 'loaded' && (
                    <>
                      <img
                        src={item.url}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-auto rounded-md cursor-pointer"
                        onClick={() => handleImageClick(item.url)} // Add onClick handler
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => handleDownload(item.url)}
                          className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition"
                        >
                          <RefreshCw className="w-4 h-4 text-indigo-600" />
                        </button>
                      </div>
                    </>
                  )}
                  {item.status === 'error' && (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-red-500">Failed to load</p>
                    </div>
                  )}
                </motion.div>
              ))}

            </div>

            {selectedImage && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                <div className="relative">
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-400 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="max-w-[90vw] max-h-[90vh] object-contain" // Adjust max width and height
                  />
                </div>
              </div>
            )}

            {images.length > 0 && (
              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {images.length} image{images.length > 1 ? 's' : ''} generated.
                </p>
                <motion.button
                  onClick={regenerateImages}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center justify-center gap-2"
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
