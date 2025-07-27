'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EnhancedConversationOrchestrator } from '@/services/enhancedConversationOrchestrator';
import { ConversationContext, Message } from '@/types/conversation';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ConversationSidebar } from './ConversationSidebar';
import { ConversationHistory } from './ConversationHistory';
import { QuickActions } from './QuickActions';
import { Bot, RefreshCw, Send } from 'lucide-react';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [context, setContext] = useState<ConversationContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orchestrator, setOrchestrator] = useState<EnhancedConversationOrchestrator | null>(null);
  const [conversationId, setConversationId] = useState(() => uuidv4());
  const [isInitialized, setIsInitialized] = useState(false);
  const [tempMessage, setTempMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get authentication token from context
  const { token, user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize orchestrator on component mount
    initializeOrchestrator();
  }, []);

  // Update auth token when it changes
  useEffect(() => {
    if (orchestrator && token) {
      orchestrator.setAuthToken(token);
    }
  }, [orchestrator, token]);

  const initializeOrchestrator = () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        console.error('GEMINI API key not found in environment variables');
        alert('API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file');
        return;
      }

      const newOrchestrator = new EnhancedConversationOrchestrator(apiKey);
      
      // Configure with real API and authentication
      const enableMockData = process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';
      newOrchestrator.setBankingToolsConfig({ 
        enableMockData: enableMockData, // Use environment variable to control mock data
        authToken: token || undefined
      });
      
      setOrchestrator(newOrchestrator);
      setIsInitialized(true);
      
      // Add welcome message to UI state
      const welcomeMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "Hello! Welcome to HSBC Banking Assistant. I'm here to help you with various banking services including loan applications, card management, account inquiries, and more. How may I assist you today?",
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing orchestrator:', error);
      alert('Error initializing the chat system. Please check your API key configuration.');
    }
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!orchestrator) {
      console.error('❌ Orchestrator not initialized');
      return;
    }

    console.log('🚀 Starting message processing...');
    console.log('📝 User message:', messageContent);
    console.log('🆔 Conversation ID:', conversationId);

    // Add user message to UI immediately for better UX
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      console.log('⚡ Calling orchestrator.processMessage...');
      const result = await orchestrator.processMessage(
        conversationId,
        'user123', // Mock user ID
        messageContent
      );

      console.log('✅ Orchestrator response received:');
      console.log('📊 Response:', result.response);
      console.log('🎯 Current Intent:', result.context.currentIntent);
      console.log('📋 Context Phase:', result.context.state.phase);
      console.log('💬 Message Count:', result.context.messages.length);
      console.log('🔍 Full Context:', result.context);
      console.log('📝 All Messages:', result.context.messages.map(m => ({
        role: m.role,
        content: (m.content || '').substring(0, 100) + '...',
        timestamp: m.timestamp
      })));

      // Add just the assistant response to the existing messages
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date()
      };
      
      console.log('🤖 Adding assistant response:', result.response);
      setMessages(prev => [...prev, assistantMessage]);
      setContext(result.context);
      
      console.log('✅ Messages updated in UI state');

      // Update conversation history with new message and intent
      if ((window as any).updateConversationTitle) {
        (window as any).updateConversationTitle(
          conversationId, 
          messageContent,
          result.context.currentIntent
        );
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
      console.error('🔍 Error details:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        stack: (error as any)?.stack
      });
      
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('🏁 Message processing completed');
    }
  };

  const handleNewConversation = () => {
    const newConversationId = uuidv4();
    setConversationId(newConversationId);
    setMessages([]);
    setContext(null);
    setTempMessage('');
    
    if (orchestrator) {
      orchestrator.clearConversation(conversationId);
    }
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: "Hello! Welcome to HSBC Banking Assistant. I'm here to help you with various banking services including loan applications, card management, account inquiries, and more. How may I assist you today?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const handleSelectConversation = (selectedConversationId: string) => {
    if (selectedConversationId === conversationId) return;
    
    // Save current conversation state
    if (orchestrator && conversationId) {
      // The conversation is already saved in the orchestrator
    }
    
    // Load selected conversation
    setConversationId(selectedConversationId);
    if (orchestrator) {
      const savedContext = orchestrator.getConversationContext(selectedConversationId);
      if (savedContext) {
        setMessages(savedContext.messages);
        setContext(savedContext);
      } else {
        // New conversation
        setMessages([]);
        setContext(null);
        const welcomeMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: "Hello! Welcome to HSBC Banking Assistant. I'm here to help you with various banking services including loan applications, card management, account inquiries, and more. How may I assist you today?",
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }
  };

  const handleDeleteConversation = (deletedConversationId: string) => {
    if (orchestrator) {
      orchestrator.clearConversation(deletedConversationId);
    }
    
    // If the deleted conversation is the current one, start a new conversation
    if (deletedConversationId === conversationId) {
      handleNewConversation();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setContext(null);
    setTempMessage('');
    if (orchestrator) {
      orchestrator.clearConversation(conversationId);
    }
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: "Hello! Welcome to HSBC Banking Assistant. I'm here to help you with various banking services including loan applications, card management, account inquiries, and more. How may I assist you today?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Bot className="mx-auto h-12 w-12 text-blue-500 mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">HSBC Banking Assistant</h1>
          <p className="text-gray-600">
            Initializing AI assistant...
          </p>
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Conversation History Sidebar */}
      <ConversationHistory
        currentConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Banking Assistant</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-red-300 transition-colors text-black cursor-pointer"
            >
              <RefreshCw size={16} />
              Reset Chat
            </button>
          </div>
        </header>

        {/* Landing UI - Show when conversation is new */}
        {messages.length <= 1 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
            <div className="max-w-2xl w-full text-center space-y-8">
              {/* Welcome Section */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Bot className="h-16 w-16 text-blue-500" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">HSBC Banking Assistant</h1>
                <p className="text-lg text-gray-600 max-w-xl mx-auto">
                  Your intelligent banking companion powered by AI. Get instant help with loans, 
                  card management, account inquiries, and more through natural conversation.
                </p>
              </div>

              {/* Enhanced Search Input */}
              <div className="space-y-6">
                <div className="relative">
                  <textarea
                    value={tempMessage}
                    onChange={(e) => setTempMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (tempMessage.trim()) {
                          handleSendMessage(tempMessage.trim());
                          setTempMessage('');
                        }
                      }
                    }}
                    placeholder="Ask me anything about banking services..."
                    disabled={isLoading}
                    rows={1}
                    className="w-full resize-none rounded-xl border-2 border-gray-200 px-6 py-4 text-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    style={{
                      minHeight: '60px',
                      maxHeight: '200px',
                      height: 'auto',
                      lineHeight: '1.5'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      const scrollHeight = target.scrollHeight;
                      const maxHeight = 200; // 4 lines approximately
                      
                      if (scrollHeight <= maxHeight) {
                        target.style.height = Math.max(60, scrollHeight) + 'px';
                        target.style.overflowY = 'hidden';
                      } else {
                        target.style.height = maxHeight + 'px';
                        target.style.overflowY = 'auto';
                      }
                    }}
                  />
                  {tempMessage.trim() && (
                    <button
                      onClick={() => {
                        if (tempMessage.trim()) {
                          handleSendMessage(tempMessage.trim());
                          setTempMessage('');
                        }
                      }}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      setTempMessage('I want to apply for a personal loan');
                      handleSendMessage('I want to apply for a personal loan');
                    }}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left shadow-sm cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">Apply for Loan</h3>
                    <p className="text-sm text-gray-600">Personal, home, or business loans</p>
                  </button>

                  <button
                    onClick={() => {
                      setTempMessage('I need to block my card');
                      handleSendMessage('I need to block my card');
                    }}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left shadow-sm cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">Block Card</h3>
                    <p className="text-sm text-gray-600">Secure your lost or stolen card</p>
                  </button>

                  <button
                    onClick={() => {
                      setTempMessage('What is my account balance?');
                      handleSendMessage('What is my account balance?');
                    }}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left shadow-sm cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">Check Balance</h3>
                    <p className="text-sm text-gray-600">View your current account balance</p>
                  </button>

                  <button
                    onClick={() => {
                      setTempMessage('Show me my transaction history');
                      handleSendMessage('Show me my transaction history');
                    }}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left shadow-sm cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">Transaction History</h3>
                    <p className="text-sm text-gray-600">Review your recent transactions</p>
                  </button>
                </div>
              </div>

              {/* Features Preview */}
              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-500 text-xl">🤖</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
                  <p className="text-sm text-gray-600">Advanced natural language understanding</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-500 text-xl">🔒</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
                  <p className="text-sm text-gray-600">Bank-grade security and encryption</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-500 text-xl">⚡</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Instant</h3>
                  <p className="text-sm text-gray-600">Get immediate assistance 24/7</p>
                </div>
              </div> */}
            </div>
          </div>
        ) : (
          /* Chat Messages View */
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {(() => {
              console.log('🎨 Rendering messages:', messages.length, messages.map(m => ({role: m.role, content: (m.content || '').substring(0, 50)})));
              return null;
            })()}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 mr-8">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm">Assistant is thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area - Only show when in chat mode */}
        {messages.length > 1 && (
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
            placeholder="Ask about loans, cards, account balance, transactions, or any banking question..."
          />
        )}
      </div>

      {/* Sidebar */}
      <ConversationSidebar context={context} />
    </div>
  );
}
