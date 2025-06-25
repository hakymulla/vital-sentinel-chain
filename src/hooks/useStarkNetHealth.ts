import { useState, useEffect } from 'react';
import { starknetService } from '@/services/starknet';
import { HealthVitals } from '@/types/health';

// Use a simple decimal user ID instead of hex
const DEFAULT_USER_FELT = '0x123'; // Use the hex string that matches on-chain data
// const DEFAULT_USER_FELT = `0x${BigInt(123).toString(16)}`; // safer normalization
// const DEFAULT_USER_FELT = '0x0000000000000000000000000000000000000000000000000000000000000123';
// const DEFAULT_USER_FELT = '291'; // decimal for 0x123still


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
      
      // More detailed error handling
      let errorMessage = 'Failed to fetch data from StarkNet';
      if (err instanceof Error) {
        if (err.message.includes('Validate Unhandled')) {
          errorMessage = 'Invalid user parameter format';
        } else if (err.message.includes('Contract not found')) {
          errorMessage = 'Contract not found on StarkNet';
        } else if (err.message.includes('RPC')) {
          errorMessage = 'StarkNet network connection failed';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch every 30 seconds when component mounts
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
