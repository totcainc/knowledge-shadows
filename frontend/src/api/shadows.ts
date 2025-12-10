import { apiClient } from './client';
import type { Shadow, Chapter, DecisionPoint, CreateShadowRequest, UpdateShadowRequest } from './types';

// Shadow endpoints
export const shadowsApi = {
  // Start capturing a new shadow
  startCapture: async (data: CreateShadowRequest): Promise<Shadow> => {
    const response = await apiClient.post<Shadow>('/api/shadows/start', data);
    return response.data;
  },

  // End shadow capture
  endCapture: async (shadowId: string): Promise<Shadow> => {
    const response = await apiClient.post<Shadow>(`/api/shadows/${shadowId}/end`);
    return response.data;
  },

  // List all shadows
  list: async (skip = 0, limit = 100): Promise<Shadow[]> => {
    const response = await apiClient.get<Shadow[]>('/api/shadows/', {
      params: { skip, limit },
    });
    return response.data;
  },

  // Get a single shadow
  get: async (shadowId: string): Promise<Shadow> => {
    const response = await apiClient.get<Shadow>(`/api/shadows/${shadowId}`);
    return response.data;
  },

  // Update a shadow
  update: async (shadowId: string, data: UpdateShadowRequest): Promise<Shadow> => {
    const response = await apiClient.patch<Shadow>(`/api/shadows/${shadowId}`, data);
    return response.data;
  },

  // Delete a shadow
  delete: async (shadowId: string): Promise<void> => {
    await apiClient.delete(`/api/shadows/${shadowId}`);
  },

  // Retry processing for a failed shadow
  retryProcessing: async (shadowId: string): Promise<Shadow> => {
    const response = await apiClient.post<Shadow>(`/api/shadows/${shadowId}/retry`);
    return response.data;
  },

  // Upload video for a shadow
  uploadVideo: async (shadowId: string, videoBlob: Blob): Promise<Shadow> => {
    const formData = new FormData();
    formData.append('file', videoBlob, `${shadowId}.webm`);

    const response = await apiClient.post<Shadow>(
      `/api/upload/${shadowId}/video`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minute timeout for large uploads
      }
    );
    return response.data;
  },
};

// Chapter endpoints
export const chaptersApi = {
  // Get chapters for a shadow
  getByShadow: async (shadowId: string): Promise<Chapter[]> => {
    const response = await apiClient.get<Chapter[]>(`/api/chapters/shadows/${shadowId}/chapters`);
    return response.data;
  },

  // Update a chapter
  update: async (chapterId: string, data: { title?: string; user_notes?: string }): Promise<Chapter> => {
    const response = await apiClient.patch<Chapter>(`/api/chapters/${chapterId}`, data);
    return response.data;
  },
};

// Decision point endpoints
export const decisionPointsApi = {
  // Get decision points for a shadow
  getByShadow: async (shadowId: string): Promise<DecisionPoint[]> => {
    const response = await apiClient.get<DecisionPoint[]>(`/api/decision-points/shadows/${shadowId}/decision-points`);
    return response.data;
  },

  // Verify a decision point
  verify: async (decisionPointId: string): Promise<DecisionPoint> => {
    const response = await apiClient.post<DecisionPoint>(`/api/decision-points/${decisionPointId}/verify`);
    return response.data;
  },
};
