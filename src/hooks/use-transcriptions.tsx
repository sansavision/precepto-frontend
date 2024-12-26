// src/hooks/useTranscriptions.ts
import { useAuth } from '@/lib/providers/auth-provider';
import { useNats } from '@/lib/providers/nats-provider';
import type { TranscriptionMeta } from '@/lib/types/transcript.types';
import { useEffect, useState } from 'react';
// import { useNats } from '../nats/NatsProvider';
// import type { TranscriptionMeta } from '../types';
// import { useAuth } from '../auth/AuthProvider';

interface UseTranscriptions {
  transcriptions: TranscriptionMeta[] | null;
  loading: boolean;
  error: string | null;
  fetchTranscriptions: () => void;
}

export const useTranscriptions = (): UseTranscriptions => {
  const { request } = useNats();
  const { isAuthenticated, logout, refreshAccessToken } = useAuth();
  const [transcriptions, setTranscriptions] = useState<TranscriptionMeta[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTranscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const data = { access_token: accessToken };
      const response = await request(
        'data.transcriptions.get',
        JSON.stringify(data),
        { timeout: 5000 } // Set timeout to 5 seconds
      );
      const result = JSON.parse(response);

      if (result.status === 'success') {
        setTranscriptions(result.transcriptions);
        console.info("results", result.transcriptions)
      } else if (result.message === 'Access token expired.') {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await refreshAccessToken(refreshToken);
          // Retry fetching transcriptions after refreshing token
          await fetchTranscriptions();
        } else {
          setError('Session expired. Please log in again.');
          logout();
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Failed to fetch transcriptions:', err);
      setError('Failed to fetch transcriptions.');
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isAuthenticated) {
      fetchTranscriptions();
    }
  }, [isAuthenticated]);

  return { transcriptions, loading, error, fetchTranscriptions };
};
