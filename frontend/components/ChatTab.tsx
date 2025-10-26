import React, { useState, useRef, useEffect } from 'react';
import { PolicyDocument, ChatMessage, Citation } from '../types';
import { SendIcon, DocumentTextIcon, ClearIcon, FeedbackIcon, SnippetIcon, TrashIcon } from './icons';

interface ChatTabProps {
  policies: PolicyDocument[];
  chatHistory: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  onDeletePolicy: (policyName: string) => void;
  onClearAllPolicies: () => void;
  onRefreshPolicies: () => void;
  useWebhook: boolean;
  onToggleWebhook: (enabled: boolean) => void;
}

const ChatMessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-secondary-content">AI</span>
        </div>
      )}
      <div className={`p-3 rounded-xl max-w-lg ${message.role === 'user' ? 'bg-primary text-primary-content' : 'bg-base-100'}`}>
        <p className="text-sm whitespace-pre-wrap">{typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}</p>
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 mb-1">Sources:</h4>
            {message.citations.map((citation, index) => (
              <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
                <p><strong>Document:</strong> {citation.documentName}</p>
                <p><strong>Page:</strong> {citation.page}</p>
              </div>
            ))}
          </div>
        )}
      </div>
       {message.role === 'assistant' && (
        <div className="relative self-center" onMouseEnter={() => setShowFeedback(true)} onMouseLeave={() => setShowFeedback(false)}>
            <FeedbackIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer"/>
            {showFeedback && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex gap-1 p-1 bg-white rounded-full shadow-lg">
                    <button className="text-lg p-1 hover:bg-gray-200 rounded-full">👍</button>
                    <button className="text-lg p-1 hover:bg-gray-200 rounded-full">👎</button>
                </div>
            )}
        </div>
       )}
      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-gray-600">You</span>
        </div>
      )}
    </div>
  );
};


export const ChatTab: React.FC<ChatTabProps> = ({ policies, chatHistory, isLoading, onSendMessage, onClearChat, onDeletePolicy, onClearAllPolicies, onRefreshPolicies, useWebhook, onToggleWebhook }) => {
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const activeCitations = chatHistory[chatHistory.length - 1]?.citations || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-220px)] bg-base-100 rounded-xl shadow-md overflow-hidden">
      {/* Left Sidebar: Recent Uploads */}
      <aside className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'} bg-base-200/50 border-r border-base-300 flex-shrink-0 overflow-hidden`}>
        <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Uploads</h3>
              <div className="flex gap-2">
                <button
                  onClick={onRefreshPolicies}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                  title="Refresh policies from server"
                >
                  Refresh
                </button>
                {policies.length > 0 && (
                  <button
                    onClick={onClearAllPolicies}
                    className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    title="Clear all policies"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            <ul className="space-y-3 overflow-y-auto flex-grow">
            {policies.length === 0 ? (
              <li className="text-center text-sm text-gray-500 py-8">
                <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No policies uploaded yet</p>
                <p className="text-xs mt-1">Upload a policy to get started</p>
              </li>
            ) : (
              policies.map((policy, index) => (
                <li key={index} className="group p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                    <div className="flex items-center overflow-hidden">
                        <DocumentTextIcon className="w-6 h-6 text-primary mr-3 flex-shrink-0" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate" title={policy.name}>{policy.name}</p>
                            <p className="text-xs text-gray-500">{policy.type} &middot; {policy.uploadedAt.toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeletePolicy(policy.name);
                        }}
                        className="ml-2 p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-opacity flex-shrink-0"
                        title={`Delete ${policy.name}`}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </li>
              ))
            )}
            </ul>
        </div>
      </aside>
      
      {/* Center: Chat Window */}
      <main className="flex-1 flex flex-col">
        {/* Header with webhook toggle */}
        <div className="p-4 border-b border-base-300 bg-white flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chat with Policies</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Regular Chat</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useWebhook}
                onChange={(e) => onToggleWebhook(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm text-gray-600">Webhook Chat</span>
          </div>
        </div>
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {chatHistory.map((msg, index) => <ChatMessageItem key={index} message={msg} />)}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-secondary-content">AI</span>
              </div>
              <div className="p-3 rounded-xl bg-base-100">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 bg-base-100 border-t border-base-300">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <button
                type="button"
                onClick={onClearChat}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                title="Clear Chat"
            >
                <ClearIcon className="w-5 h-5"/>
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your company policies..."
                className="w-full px-4 py-2 text-sm bg-gray-100 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button type="submit" disabled={isLoading} className="p-2 bg-primary text-white rounded-full hover:bg-primary-focus disabled:bg-gray-400">
              <SendIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>

      {/* Right Sidebar: Policy Snippets */}
      <aside className="w-72 bg-base-200/50 border-l border-base-300 p-4 hidden lg:block">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center"><SnippetIcon className="w-5 h-5 mr-2"/>Policy Snippets</h3>
        <div className="space-y-4">
            {activeCitations.length > 0 ? (
                activeCitations.map((citation, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs font-bold text-gray-800">{citation.documentName} (Page {citation.page})</p>
                        <p className="text-sm text-gray-600 mt-1 italic">"{citation.snippet}"</p>
                    </div>
                ))
            ) : (
                <div className="text-center text-sm text-gray-500 mt-8">
                    <p>Retrieved policy excerpts will appear here.</p>
                </div>
            )}
        </div>
      </aside>
    </div>
  );
};