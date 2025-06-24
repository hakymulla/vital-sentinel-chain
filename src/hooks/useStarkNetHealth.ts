
import { useState, useEffect } from 'react';
import { starknetService } from '@/services/starknet';
import { HealthVitals } from '@/types/health';

// Default test user - you can change this to connect with actual user wallets
const DEFAULT_USER_FELT = '0x1234567890abcdef'; // Example felt252 user ID

export const useStarkNetHealth = () => {
  const [starknetVitals, setStarknetVitals] = useState<HealthVitals | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchStarkNetVitals = async (userFelt: string = DEFAULT_USER_FELT) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching vitals from StarkNet contract...');
      const starknetData = await starknetService.getLatestVitals(userFelt);
      const healthVitals = starknetService.convertToHealthVitals(starknetData);
      
      setStarknetVitals(healthVitals);
      setLastFetch(Date.now());
      console.log('Successfully fetched StarkNet vitals:', healthVitals);
    } catch (err) {
      console.error('Failed to fetch StarkNet vitals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data from StarkNet');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch every 30 seconds
  useEffect(() => {
    fetchStarkNetVitals();
    
    const interval = setInterval(() => {
      fetchStarkNetVitals();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    starknetVitals,
    isLoading,
    error,
    lastFetch,
    refetch: fetchStarkNetVitals
  };
};
