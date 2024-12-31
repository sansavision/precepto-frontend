import { useAuth } from '@/lib/providers/auth-provider';
import { useNats } from '@/lib/providers/nats-provider';
import { useGlobalStore } from '@/lib/store/globalstore';
import type { TranscriptionMeta } from '@/lib/types/transcript.types';
import { useNavigate } from '@tanstack/react-router';
import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface UseTranscriptions {
  transcriptions: TranscriptionMeta[] | null;
  loading: boolean;
  error: string | null;
  fetchTranscriptions: () => void;
  createTranscription: (transcription: Omit<TranscriptionMeta, 'id' | 'created_by_id'>) => Promise<void>;
  updateTranscription: (transcription: TranscriptionMeta) => Promise<void>;
  deleteTranscription: (transcriptionId: string) => Promise<void>;
  completeRecording: (transcriptionId: string) => void;
  // completeRecording: (transcriptionId: string) => Promise<void>;
}

export const useTranscriptions = (): UseTranscriptions => {
  const { user, isAuthenticated } = useAuth();
  const router = useNavigate();
  const setActiveTranscription = useGlobalStore(
    (state) => state.setActiveTranscription,
  );
  const setShowSidebar = useGlobalStore(
    (state) => state.setShowSidebar,
  );
  const { request } = useNats();
  const { logout, refreshAccessToken } = useAuth();
  const [transcriptions, setTranscriptions] = useState<TranscriptionMeta[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const completeRecording = useCallback( (transcriptionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('Not authenticated');
        return;
      }

      const data = { access_token: accessToken, recording_id: transcriptionId };
 
      request('audio.chunks.combine', JSON.stringify(data), { timeout: 135000 });
      router({
        to: `/transcription/${transcriptionId}`,
      })
      // const result = JSON.parse(response);

      // if (result.status === 'success') {
      //   router({
      //     to: `/transcript/${transcriptionId}`,
      //   })
      // } else if (result.message === 'Access token expired.') {
      //   const refreshToken = localStorage.getItem('refresh_token');
      //   if (refreshToken) {
      //     await refreshAccessToken(refreshToken);

      //     const response = await request('audio.chunks.combine', JSON.stringify(data), { timeout: 135000 });
      //     const result = JSON.parse(response);

      //     if (result.status === 'success') {
      //       router({
      //         to: `/transcript/${transcriptionId}`,
      //       })
      //     }else{
      //       setError(result.message);
      //       throw new Error(result.message);
      //     }
      //   } else {
      //     setError('Session expired. Please log in again.');
      //     logout();
      //   }
      // } else {
      //   setError(result.message);
      // }
    } catch (err) {
      console.error('Failed to complete transcriptions:', err);
      setError('Failed to complete transcriptions.');
    } finally {
      setLoading(false);
    }
  }, [request, router]);
  // }, [request, refreshAccessToken, logout, router]);

  const fetchTranscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('Not authenticated');
        return;
      }

      const data = { access_token: accessToken };
      const response = await request('data.transcriptions.get', JSON.stringify(data), { timeout: 5000 });
      const result = JSON.parse(response);

      if (result.status === 'success') {
        setTranscriptions(result.transcriptions);
      } else if (result.message === 'Access token expired.') {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await refreshAccessToken(refreshToken);
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
  }, [request, refreshAccessToken, logout]);

  const createTranscription = useCallback(async (transcription: Omit<TranscriptionMeta, 'id' | 'created_by_id'>) => {
    setLoading(true);
    setError(null);
    if (!user) {
      setError('Not authenticated');
      return;
    }
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('Not authenticated');
        return;
      }

      const newTranscription: TranscriptionMeta = {
        ...transcription,
        id: uuidv4(),
        created_by_id: user.id,
      };

      const data = {
        access_token: accessToken,
        transcription: newTranscription,
      };
      console.info("will send", data);
      const response = await request('data.transcriptions.create', JSON.stringify(data), { timeout: 5000 });
      console.info("response", response);
      const result = JSON.parse(response);

      if (result.status === 'success') {
        setTranscriptions((prev) => (prev ? [...prev, result.transcription] : [result.transcription]));
        setActiveTranscription(result.transcription);
        router({ to: `/draft/${result.transcription.id}` });
      } else if (result.message === 'Access token expired.') {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await refreshAccessToken(refreshToken);
          const response = await request('data.transcriptions.create', JSON.stringify(data), { timeout: 5000 });
          const result = JSON.parse(response);
          if (result.status === 'success') {
            // setTranscriptions((prev) => (prev ? [...prev, result.transcription] : [result.transcription]));
            // setActiveTranscription(result.transcription);
            router({ to: `/draft/${result.transcription.id}` });
          } else {
            setError(result.message);
            throw new Error(result.message);
          }
        } else {
          setError('Session expired. Please log in again.');
          logout();
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Failed to create transcription:', err);
      setError('Failed to create transcription.');
    } finally {
      setLoading(false);
    }
  }, [request, setActiveTranscription, router, user, refreshAccessToken, logout]);

  const updateTranscription = useCallback(async (transcription: TranscriptionMeta) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('Not authenticated');
        return;
      }
      const data = {
        access_token: accessToken,
        transcription,
      };
      console.info("will send update", data);
      const response = await request('data.transcriptions.update', JSON.stringify(data), { timeout: 5000 });
      const result = JSON.parse(response);

      if (result.status === 'success') {
        setTranscriptions((prev) =>
          prev ? prev.map((t) => (t.id === result.transcription.id ? result.transcription : t)) : [result.transcription]
        );
        await fetchTranscriptions();
      } else if (result.message === 'Access token expired.') {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await refreshAccessToken(refreshToken);
          await updateTranscription(transcription);
        } else {
          setError('Session expired. Please log in again.');
          logout();
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Failed to update transcription:', err);
      setError('Failed to update transcription.');
    } finally {
      setLoading(false);
    }
  }, [request, refreshAccessToken, logout, fetchTranscriptions]);

  const deleteTranscription = useCallback(async (transcriptionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('Not authenticated');
        return;
      }

      const data = {
        access_token: accessToken,
        transcription_id: transcriptionId,
      };
      console.info("will send delete", data);
      const response = await request('data.transcriptions.delete', JSON.stringify(data), { timeout: 5000 });
      const response_audio = await request('audio.chunks.delete', JSON.stringify(data), { timeout: 5000 });
      const result = JSON.parse(response);
      const result_audio = JSON.parse(response_audio);
      if (result_audio.status !== 'success') {
        console.error('Failed to delete transcription audio:', result_audio.message);
        setError('Failed to delete transcription audio.');
      }
      if (result.status === 'success') {
        setTranscriptions((prev) => prev ? prev.filter((t) => t.id !== transcriptionId) : []);
        setShowSidebar(true);
        router({ to: "/dashboard" });
      } else if (result.message === 'Access token expired.') {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await refreshAccessToken(refreshToken);
          await deleteTranscription(transcriptionId);
        } else {
          setError('Session expired. Please log in again.');
          logout();
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Failed to delete transcription:', err);
      setError('Failed to delete transcription.');
    } finally {
      setLoading(false);
      await fetchTranscriptions();
    }
  }, [request, refreshAccessToken, logout, router, fetchTranscriptions, setShowSidebar]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTranscriptions();
    }
  }, [isAuthenticated, fetchTranscriptions]);

  return {
    transcriptions,
    loading,
    error,
    fetchTranscriptions,
    createTranscription,
    updateTranscription,
    deleteTranscription,
    completeRecording,
  };
};
