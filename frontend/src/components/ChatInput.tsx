import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSendMessage, isLoading, placeholder = "Type your message..." }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className={cn(
              "w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-black",
              "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
              "disabled:bg-gray-100 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
            style={{
              minHeight: '48px',
              maxHeight: '120px',
              height: 'auto'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-lg",
            "bg-blue-500 text-white hover:bg-blue-600",
            "disabled:bg-gray-300 disabled:cursor-not-allowed",
            "transition-all duration-200"
          )}
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </form>
  );
}
