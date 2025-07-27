'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Plus, Trash2, Search, Clock, User, Bot, ArrowLeftToLine } from 'lucide-react';

export interface ConversationSummary {
    id: string;
    title: string;
    lastMessage: string;
    lastActivity: Date;
    messageCount: number;
    isActive: boolean;
    intent?: string;
}

interface ConversationHistoryProps {
    currentConversationId: string;
    onSelectConversation: (conversationId: string) => void;
    onNewConversation: () => void;
    onDeleteConversation: (conversationId: string) => void;
}

export function ConversationHistory({
    currentConversationId,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation
}: ConversationHistoryProps) {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    // Load conversations from localStorage on mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Save current conversation when it changes
    useEffect(() => {
        if (currentConversationId) {
            updateCurrentConversation();
        }
    }, [currentConversationId]);

    const loadConversations = () => {
        try {
            const saved = localStorage.getItem('hsbc-conversations');
            if (saved) {
                const parsed = JSON.parse(saved);
                setConversations(parsed.map((conv: any) => ({
                    ...conv,
                    lastActivity: new Date(conv.lastActivity)
                })));
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const saveConversations = (convs: ConversationSummary[]) => {
        try {
            localStorage.setItem('hsbc-conversations', JSON.stringify(convs));
        } catch (error) {
            console.error('Error saving conversations:', error);
        }
    };

    const updateCurrentConversation = () => {
        const existingIndex = conversations.findIndex(conv => conv.id === currentConversationId);

        if (existingIndex >= 0) {
            // Update existing conversation
            const updated = [...conversations];
            updated[existingIndex] = {
                ...updated[existingIndex],
                isActive: true,
                lastActivity: new Date()
            };
            // Mark all others as inactive
            updated.forEach((conv, index) => {
                if (index !== existingIndex) {
                    conv.isActive = false;
                }
            });
            setConversations(updated);
            saveConversations(updated);
        } else {
            // Add new conversation
            const newConv: ConversationSummary = {
                id: currentConversationId,
                title: `Conversation ${conversations.length + 1}`,
                lastMessage: 'New conversation started',
                lastActivity: new Date(),
                messageCount: 1,
                isActive: true
            };

            const updated = conversations.map(conv => ({ ...conv, isActive: false }));
            updated.unshift(newConv);
            setConversations(updated);
            saveConversations(updated);
        }
    };

    const updateConversationTitle = (conversationId: string, lastMessage: string, intent?: string) => {
        const updated = conversations.map(conv => {
            if (conv.id === conversationId) {
                return {
                    ...conv,
                    lastMessage: lastMessage.substring(0, 50) + (lastMessage.length > 50 ? '...' : ''),
                    lastActivity: new Date(),
                    messageCount: conv.messageCount + 1,
                    intent: intent || conv.intent,
                    title: intent ? getIntentTitle(intent) : conv.title
                };
            }
            return conv;
        });
        setConversations(updated);
        saveConversations(updated);
    };

    const getIntentTitle = (intent: string): string => {
        const intentTitles: Record<string, string> = {
            'loan_application': 'Loan Application',
            'card_blocking': 'Card Management',
            'account_statement': 'Account Statement',
            'balance_inquiry': 'Balance Inquiry',
            'transaction_history': 'Transaction History',
            'interest_rate_inquiry': 'Interest Rates',
            'general_inquiry': 'General Banking'
        };
        return intentTitles[intent] || 'Banking Chat';
    };

    const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = conversations.filter(conv => conv.id !== conversationId);
        setConversations(updated);
        saveConversations(updated);
        onDeleteConversation(conversationId);
    };

    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatTimeAgo = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // Expose updateConversationTitle method to parent
    useEffect(() => {
        (window as any).updateConversationTitle = updateConversationTitle;
        return () => {
            delete (window as any).updateConversationTitle;
        };
    }, [conversations]);

    return (
        <div className={`border-r bg-white transition-all duration-300 ${isExpanded ? 'w-80' : 'w-16'}`}>
            {/* Header */}
            <div className="border-b  p-2 flex flex-col items-center justify-center">
                <div className="w-full flex items-center justify-between mb-2">
                    {isExpanded && (
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-medium text-gray-900">Conversations</h2>
                        </div>
                    )}

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
                        className="p-1 rounded-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                    >
                        {isExpanded ? (
                            <ArrowLeftToLine size={27} className=" text-blue-500 transition-transform" />
                        ) : (
                            <MessageCircle size={30} className=" text-blue-500 transition-transform duration-200" />
                        )}
                    </button>
                </div>

                {isExpanded && (
                    <div className="w-full flex items-center justify-between mb-4 gap-2">
                        <button
                            onClick={onNewConversation}
                            className="w-[15%] h-10 flex items-center justify-center gap-2 px-3 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                            <Plus size={16} />
                        </button>

                        <div className="w-full relative h-10">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-full pl-9 pr-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Conversations List */}
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {isExpanded ? (
                    filteredConversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            <MessageCircle size={32} className="mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">
                                {searchTerm ? 'No conversations found' : 'No conversations yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1 p-2">
                            {filteredConversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    onClick={() => onSelectConversation(conversation.id)}
                                    className={`relative group cursor-pointer rounded-lg p-3 transition-colors ${conversation.isActive
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {conversation.title}
                                                </h3>
                                                {conversation.isActive && (
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-600 truncate mb-2">
                                                {conversation.lastMessage}
                                            </p>

                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {formatTimeAgo(conversation.lastActivity)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle size={12} />
                                                    {conversation.messageCount}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-md transition-all"
                                        >
                                            <Trash2 size={14} className="text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    // Collapsed view - show only icons
                    <div className="space-y-2 p-2">
                        {filteredConversations.slice(0, 8).map((conversation) => (
                            <button
                                key={conversation.id}
                                onClick={() => onSelectConversation(conversation.id)}
                                className={`w-12 h-12 cursor-pointer rounded-lg flex items-center justify-center transition-colors ${conversation.isActive
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                    }`}
                                title={conversation.title}
                            >
                                {conversation.intent === 'loan_application' ? '💰' :
                                    conversation.intent === 'card_blocking' ? '💳' :
                                        conversation.intent === 'balance_inquiry' ? '💲' :
                                            conversation.intent === 'transaction_history' ? '📊' : '💬'}
                            </button>
                        ))}

                        <button
                            onClick={onNewConversation}
                            className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                            title="New Conversation"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
