import { useState, useEffect } from 'react';

export function useModels() {
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('https://image.pollinations.ai/models');
        if (!response.ok) throw new Error('Failed to fetch models');
        const data = await response.json();
        setModels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load models');
        setModels(['flux-realism']);
      } finally {
        setIsLoading(false);
      }
    }

    fetchModels();
  }, []);

  return { models, isLoading, error };
}
