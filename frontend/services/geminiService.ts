// This file is repurposed to connect to your FastAPI backend.
// It was previously named geminiService.ts

const API_BASE_URL = 'http://localhost:8000'; // Adjust if your backend runs elsewhere

/**
 * Uploads a policy document to the backend.
 * @param file The PDF file to upload.
 * @param policyType The type or category of the policy.
 * @returns A promise that resolves with the server's success message.
 */
export const uploadPolicy = async (file: File, policyType: string): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('policy_type', policyType);

  const response = await fetch(`${API_BASE_URL}/upload-policy`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to upload policy.' }));
    throw new Error(errorData.detail || 'An unknown error occurred during upload.');
  }

  return response.json();
};

/**
 * Sends a chat message to the backend and gets a response.
 * @param query The user's message.
 * @param sessionId The current session ID for maintaining conversation history.
 * @returns A promise that resolves with the backend's response and chat history.
 */
export const getChatResponse = async (query: string, sessionId: string): Promise<{ response: string, history: any[] }> => {
  const formData = new FormData();
  formData.append('query', query);
  formData.append('session_id', sessionId);

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to get chat response.' }));
    throw new Error(errorData.detail || 'An unknown error occurred during chat.');
  }

  return response.json();
};

/**
 * Sends a chat message to the backend via webhook (n8n) and gets a response.
 * @param query The user's message.
 * @param sessionId The current session ID for maintaining conversation history.
 * @returns A promise that resolves with the backend's response.
 */
export const getWebhookChatResponse = async (query: string, sessionId: string): Promise<{ response: string | any }> => {
  const formData = new FormData();
  formData.append('query', query);
  formData.append('sessionId', sessionId);

  console.log('🌐 Calling webhook endpoint: /webhook/chat');
  console.log('📤 Payload:', { query, sessionId });

  const response = await fetch(`${API_BASE_URL}/webhook/chat`, {
    method: 'POST',
    body: formData,
  });

  console.log('📡 Response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to get webhook chat response.' }));
    console.error('❌ Webhook error:', errorData);
    throw new Error(errorData.detail || 'An unknown error occurred during webhook chat.');
  }

  const data = await response.json();
  console.log('📥 Webhook response data:', data);
  return data;
};

/**
 * Fetches the list of policies from the backend.
 * @returns A promise that resolves with the list of policies.
 */
export const getPolicies = async (): Promise<{ policies: any[] }> => {
  const response = await fetch(`${API_BASE_URL}/policies`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch policies.' }));
    throw new Error(errorData.detail || 'An unknown error occurred while fetching policies.');
  }

  return response.json();
};

/**
 * Deletes a policy from the backend.
 * @param policyName The name of the policy to delete.
 * @returns A promise that resolves with the server's response.
 */
export const deletePolicy = async (policyName: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/policies/${encodeURIComponent(policyName)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to delete policy.' }));
    throw new Error(errorData.detail || 'An unknown error occurred while deleting policy.');
  }

  return response.json();
};

/**
 * Clears all policies from the backend.
 * @returns A promise that resolves with the server's response.
 */
export const clearAllPolicies = async (): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/policies/clear-all`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to clear all policies.' }));
    throw new Error(errorData.detail || 'An unknown error occurred while clearing all policies.');
  }

  return response.json();
};
