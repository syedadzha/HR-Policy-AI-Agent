import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadTab } from './components/UploadTab';
import { ChatTab } from './components/ChatTab';
import { ChatMessage, PolicyDocument, Tab } from './types';
import { getChatResponse, getWebhookChatResponse, getPolicies, deletePolicy as deletePolicyAPI, clearAllPolicies as clearAllPoliciesAPI } from './services/geminiService';
import { UploadIcon, ChatIcon } from './components/icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [uploadedPolicies, setUploadedPolicies] = useState<PolicyDocument[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Company Policy Assistant. How can I help you today?",
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [useWebhook, setUseWebhook] = useState(false); // Toggle between regular chat and webhook chat

  // Load uploaded policies from API on component mount
  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const response = await getPolicies();
        const policies = response.policies.map((policy: any) => ({
          name: policy.name,
          type: policy.type,
          pages: policy.pages,
          uploadedAt: new Date(policy.uploaded_at),
          size: policy.size
        }));
        setUploadedPolicies(policies);
      } catch (error) {
        console.error('Error loading policies from API:', error);
        // Fallback to localStorage if API fails
        const savedPolicies = localStorage.getItem('uploadedPolicies');
        if (savedPolicies) {
          try {
            const parsedPolicies = JSON.parse(savedPolicies).map((policy: any) => ({
              ...policy,
              uploadedAt: new Date(policy.uploadedAt)
            }));
            setUploadedPolicies(parsedPolicies);
          } catch (localError) {
            console.error('Error loading saved policies from localStorage:', localError);
          }
        }
      }
    };
    
    loadPolicies();
    
    // Generate a unique session ID when the application loads.
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  }, []);

  // Save uploaded policies to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('uploadedPolicies', JSON.stringify(uploadedPolicies));
  }, [uploadedPolicies]);

  const refreshPolicies = async () => {
    try {
      const response = await getPolicies();
      const policies = response.policies.map((policy: any) => ({
        name: policy.name,
        type: policy.type,
        pages: policy.pages,
        uploadedAt: new Date(policy.uploaded_at),
        size: policy.size
      }));
      setUploadedPolicies(policies);
    } catch (error) {
      console.error('Error refreshing policies:', error);
    }
  };

  const handleUpload = async (policy: PolicyDocument) => {
    // Add to UI immediately for better UX
    setUploadedPolicies(prev => [policy, ...prev]);
    setActiveTab('chat');
    
    // Refresh from API to get real data
    setTimeout(() => {
      refreshPolicies();
    }, 1000);
  };

  const handleDeletePolicy = async (policyNameToDelete: string) => {
    try {
      await deletePolicyAPI(policyNameToDelete);
      setUploadedPolicies(prev => prev.filter(policy => policy.name !== policyNameToDelete));
    } catch (error) {
      console.error('Error deleting policy:', error);
      // Still remove from UI even if API call fails
      setUploadedPolicies(prev => prev.filter(policy => policy.name !== policyNameToDelete));
    }
  };

  const handleSendMessage = useCallback(async (message: string) => {
    if (!sessionId) {
      console.error("Session ID not initialized.");
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Use webhook chat if enabled, otherwise use regular chat
      console.log('🔍 Webhook mode:', useWebhook);
      const response = useWebhook 
        ? await getWebhookChatResponse(message, sessionId)
        : await getChatResponse(message, sessionId);
      
      console.log('📥 Raw response:', response);
      
      // Ensure response is a string, not an object
      let responseText: string;
      if (typeof response.response === 'string') {
        responseText = response.response;
      } else if (response.response) {
        // If it's an object, try to extract text from common keys
        const obj = response.response as any;
        responseText = obj.text || obj.output || obj.answer || JSON.stringify(obj);
      } else {
        responseText = 'No response received.';
      }
      
      console.log('✅ Processed response text:', responseText);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseText,
        // Citations are now handled by the backend; the frontend will just display the response text.
      };
      
      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('❌ Error fetching chat response:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, useWebhook]);
  
  const clearChat = () => {
    // Also reset session ID to start a new conversation context on the backend
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    setChatHistory([
      {
        role: 'assistant',
        content: "Hello! I'm your Company Policy Assistant. How can I help you today?",
      }
    ]);
  };

  const clearAllPolicies = async () => {
    try {
      // Call the clear all API
      await clearAllPoliciesAPI();
      setUploadedPolicies([]);
      localStorage.removeItem('uploadedPolicies');
    } catch (error) {
      console.error('Error clearing all policies:', error);
      // Still clear UI even if API call fails
      setUploadedPolicies([]);
      localStorage.removeItem('uploadedPolicies');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-gray-800">
      <Header />
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:space-x-4">
            <nav className="flex-shrink-0 md:w-48 mb-6 md:mb-0">
              <ul>
                <li>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === 'upload'
                        ? 'bg-secondary text-secondary-content shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <UploadIcon className="w-5 h-5 mr-3" />
                    Upload Policy
                  </button>
                </li>
                <li className="mt-2">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === 'chat'
                        ? 'bg-secondary text-secondary-content shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ChatIcon className="w-5 h-5 mr-3" />
                    Chat with Policies
                  </button>
                </li>
              </ul>
            </nav>
            <div className="flex-grow">
              {activeTab === 'upload' && <UploadTab onUpload={handleUpload} policies={uploadedPolicies} />}
              {activeTab === 'chat' && (
                <ChatTab 
                  policies={uploadedPolicies} 
                  chatHistory={chatHistory} 
                  isLoading={isLoading} 
                  onSendMessage={handleSendMessage}
                  onClearChat={clearChat}
                  onDeletePolicy={handleDeletePolicy}
                  onClearAllPolicies={clearAllPolicies}
                  onRefreshPolicies={refreshPolicies}
                  useWebhook={useWebhook}
                  onToggleWebhook={setUseWebhook}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-gray-500">
        Powered by Qdrant + FastAPI
      </footer>
    </div>
  );
};

export default App;