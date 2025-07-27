import { Message } from '@/types/conversation';
import { cn } from '@/lib/utils';
import { Bot, User, Clock } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg transition-all duration-200",
      isUser ? "bg-blue-50 ml-8" : "bg-gray-50 mr-8"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-blue-500 text-white" : "bg-gray-500 text-white"
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {isUser ? 'You' : 'HSBC Assistant'}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={10} />
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        
        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {message.metadata?.intent && (
          <div className="text-xs text-gray-500 bg-white rounded px-2 py-1 inline-block">
            Intent: {message.metadata.intent} 
            {message.metadata.confidence && (
              <span className="ml-1">
                ({Math.round(message.metadata.confidence * 100)}%)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
