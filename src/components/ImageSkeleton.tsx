// components/ImageSkeleton.jsx (Advanced Version with Progress)
import React from 'react';
import { motion } from 'framer-motion'; // Make sure you have framer-motion installed

export const ImageSkeleton = () => {
  return (
    <div className="relative rounded-lg aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Background animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {/* <div className="w-16 h-16 relative">
          <motion.div
            className="w-full h-full border-4 border-indigo-200 rounded-full"
            animate={{
              rotate: 360,
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'linear',
            }}
          />
          <motion.div
            className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent"
            animate={{
              rotate: 360,
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            }}
          />
        </div> */}

        <div className="mt-4 text-center">
          <motion.div
            className="text-sm font-medium text-gray-700"
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut',
            }}
          >
            Generating Image
          </motion.div>
          <div className="text-xs text-gray-500 mt-1">Please wait...</div>
        </div>

        {/* Progress bar */}
        {/* <div className="w-48 h-1 bg-gray-200 rounded-full mt-4 overflow-hidden">
          <motion.div
            className="h-full bg-indigo-600 rounded-full"
            animate={{
              x: ['-100%', '0%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            }}
          />
        </div> */}
      </div>
    </div>
  );
};
