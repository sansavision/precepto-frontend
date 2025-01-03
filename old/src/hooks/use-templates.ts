// src/hooks/useTemplates.ts
import { useAuth } from '@/lib/providers/auth-provider';
import { useNats } from '@/lib/providers/nats-provider';
import { useGlobalStore } from '@/lib/store/globalstore';
import type { TranscriptTemplate } from '@/lib/types/transcript.types';
import { useNavigate } from '@tanstack/react-router';
import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface UseTemplates {
    templates: TranscriptTemplate[] | null;
    loading: boolean;
    error: string | null;
    fetchTemplates: () => void;
    createTemplate: (template: Omit<TranscriptTemplate, 'id' | 'created_by_id' | 'shared_with'>) => Promise<void>;
    updateTemplate: (template: TranscriptTemplate) => Promise<void>;
    deleteTemplate: (templateId: string) => Promise<void>;
    shareTemplate: (templateId: string, userId: string) => Promise<void>;
}

export const useTemplates = (): UseTemplates => {
    const { user, isAuthenticated } = useAuth();
    const router = useNavigate();
    const setActiveTemplate = useGlobalStore(
        (state) => state.setActiveTemplate,
    );
    const setShowCreateTemplateModal = useGlobalStore(
        (state) => state.setShowCreateTemplateModal,
    );
    const { request } = useNats();
    const { logout, refreshAccessToken } = useAuth();
    const [templates, setTemplates] = useState<TranscriptTemplate[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                setError('Not authenticated');
                return;
            }

            const data = { access_token: accessToken };
            const response = await request('template.get_all', JSON.stringify(data), { timeout: 5000 });
            console.info('fetchTemplates response:', response);
            const result = JSON.parse(response);
            
            if (result.status === 'success') {
                setTemplates([]);
                setTemplates(result.templates);
                console.info('fetchTemplates setTemplates:', result.templates);
            } else if (result.message === 'Access token expired.') {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    await refreshAccessToken(refreshToken);
                    // Retry fetching templates after refreshing token
                    await fetchTemplates();
                } else {
                    setError('Session expired. Please log in again.');
                    logout();
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            console.error('Failed to fetch templates:', err);
            setError('Failed to fetch templates.');
        } finally {
            setLoading(false);
        }
    }, [request, refreshAccessToken, logout]);

    const createTemplate = useCallback(async (template: Omit<TranscriptTemplate, 'id' | 'created_by_id' | 'shared_with'>) => {
        setLoading(true);
        setError(null);
        if(!user) {
            setError('Not authenticated');
            return
        }
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                setError('Not authenticated');
                return;
            }

            const newTemplate: TranscriptTemplate = {
                ...template,
                id: uuidv4(), // The backend also generates an ID; this is optional
                created_by_id: user?.id, // Replace with actual user ID
                shared_with: [],
            };

            const data = {
                access_token: accessToken,
                template: newTemplate,
            };
            const response = await request('template.create', JSON.stringify(data), { timeout: 5000 });
            const result = JSON.parse(response);
            console.info('createTemplate result:', result);
            if (result.status === 'success') {
                setTemplates((prev) => (prev ? [...prev, result.template] : [result.template]));
                setActiveTemplate(result.template);
                await fetchTemplates();
                router({ to: `${result.template.id}` });
            } else if (result.message === 'Access token expired.') {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    await refreshAccessToken(refreshToken);
                    // Retry creating template after refreshing token
                    await createTemplate(template);
                } else {
                    setError('Session expired. Please log in again.');
                    logout();
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            console.error('Failed to create template:', err);
            setError('Failed to create template.');
        } finally {
            setLoading(false);
            setShowCreateTemplateModal(false);
            // await fetchTemplates();
        }
    }, [request, refreshAccessToken, logout, setActiveTemplate, router, user, setShowCreateTemplateModal, fetchTemplates]);

    const updateTemplate = useCallback(async (template: TranscriptTemplate) => {
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
                template,
            };
            console.info('updateTemplate data:', data);
            const response = await request('template.update', JSON.stringify(data), { timeout: 5000 });
            const result = JSON.parse(response);
            console.info('updateTemplate response:', result);

            if (result.status === 'success') {
                setTemplates((prev) =>
                    prev ? prev.map((t) => (t.id === result.template.id ? result.template : t)) : [result.template]
                );
                await fetchTemplates();
            } else if (result.message === 'Access token expired.') {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    await refreshAccessToken(refreshToken);
                    // Retry updating template after refreshing token
                    await updateTemplate(template);
                } else {
                    setError('Session expired. Please log in again.');
                    logout();
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            console.error('Failed to update template:', err);
            setError('Failed to update template.');
        } finally {
            setLoading(false);
            await fetchTemplates();
        }
    }, [request, refreshAccessToken, logout, fetchTemplates]);

    const deleteTemplate = useCallback(async (templateId: string) => {
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
                template_id: templateId,
            };
            const response = await request('template.delete', JSON.stringify(data), { timeout: 5000 });
            const result = JSON.parse(response);

            if (result.status === 'success') {
                setTemplates((prev) => (prev ? prev.filter((t) => t.id !== templateId) : []));
                await fetchTemplates();
                router({ to: "/template" });

            } else if (result.message === 'Access token expired.') {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    await refreshAccessToken(refreshToken);
                    // Retry deleting template after refreshing token
                    await deleteTemplate(templateId);
                } else {
                    setError('Session expired. Please log in again.');
                    logout();
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            console.error('Failed to delete template:', err);
            setError('Failed to delete template.');
        } finally {
            setLoading(false);
            await fetchTemplates();
        }
    }, [request, refreshAccessToken, logout, router, fetchTemplates]);

    const shareTemplateFunc = useCallback(async (templateId: string, userId: string) => {
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
                template_id: templateId,
                user_id: userId,
            };
            const response = await request('template.share', JSON.stringify(data), { timeout: 5000 });
            const result = JSON.parse(response);

            if (result.status === 'success') {
                setTemplates((prev) =>
                    prev
                        ? prev.map((t) =>
                            t.id === templateId
                                ? { ...t, shared_with: [...t.shared_with, userId] }
                                : t
                        )
                        : []
                );
            } else if (result.message === 'Access token expired.') {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    await refreshAccessToken(refreshToken);
                    // Retry sharing template after refreshing token
                    await shareTemplateFunc(templateId, userId);
                } else {
                    setError('Session expired. Please log in again.');
                    logout();
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            console.error('Failed to share template:', err);
            setError('Failed to share template.');
        } finally {
            setLoading(false);
        }
    }, [request, refreshAccessToken, logout]);

      // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (isAuthenticated) {
            fetchTemplates();
        }
    }, [isAuthenticated]);

    return {
        templates,
        loading,
        error,
        fetchTemplates,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        shareTemplate: shareTemplateFunc,
    };
};
