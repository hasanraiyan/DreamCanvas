// components/ImageDialog.jsx
import React from 'react';
import { Download, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export const ImageDialog = ({
  image,
  prompt,
  settings,
  metadata,
  onDownload,
}) => {
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard!');
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 rounded-lg p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col">
      <div className="flex-1 overflow-auto">
        <h3 className="text-white font-semibold mb-2">Image Details</h3>
        <div className="space-y-2 text-sm text-gray-200">
          <div className="flex items-center justify-between">
            <p className="flex-1">
              <span className="font-medium">Prompt:</span> {prompt}
            </p>
            <button
              onClick={handleCopyPrompt}
              className="p-1 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
              title="Copy prompt"
            >
              <Copy className="w-4 h-4 text-white" />
            </button>
          </div>
          <p>
            <span className="font-medium">Model:</span> {settings.model}
          </p>
          <p>
            <span className="font-medium">Dimensions:</span> {settings.width}x
            {settings.height}
          </p>
          <p>
            <span className="font-medium">Enhancement:</span>{' '}
            {settings.enhance ? 'Enabled' : 'Disabled'}
          </p>
          <p>
            <span className="font-medium">Seed:</span> {metadata?.seed}
          </p>
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <motion.button
          onClick={() => onDownload(image)}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Download image"
        >
          <Download className="w-5 h-5 text-gray-700" />
        </motion.button>
      </div>
    </div>
  );
};
