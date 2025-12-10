import { ReactNode, useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon, PaperClipIcon, FaceSmileIcon } from "@heroicons/react/24/outline";

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "other" | "system";
  senderName?: string;
  senderAvatar?: ReactNode;
  timestamp?: Date;
  status?: "sending" | "sent" | "delivered" | "read";
}

export interface ChatBubbleProps {
  message: ChatMessage;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

/**
 * Individual chat message bubble
 */
export const ChatBubble = ({
  message,
  showAvatar = true,
  showTimestamp = true,
}: ChatBubbleProps) => {
  const isUser = message.sender === "user";
  const isSystem = message.sender === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const formatTime = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {showAvatar && !isUser && (
        <div className="flex-shrink-0">
          {message.senderAvatar || (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
              {message.senderName?.charAt(0) || "?"}
            </div>
          )}
        </div>
      )}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[70%]`}>
        {!isUser && message.senderName && (
          <span className="text-xs text-gray-500 mb-1 px-1">{message.senderName}</span>
        )}
        <div
          className={`
            px-4 py-2 rounded-2xl
            ${isUser
              ? "bg-edubites-primary text-white rounded-br-sm"
              : "bg-gray-100 text-gray-900 rounded-bl-sm"
            }
          `}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        {showTimestamp && message.timestamp && (
          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
            {isUser && message.status && (
              <span className="text-xs text-gray-400">
                {message.status === "read" ? "✓✓" : message.status === "delivered" ? "✓✓" : "✓"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

ChatBubble.displayName = "ChatBubble";

export interface ChatInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** Send callback */
  onSend?: (message: string) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Show attachment button */
  showAttachment?: boolean;
  /** Show emoji button */
  showEmoji?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Chat input component
 */
export const ChatInput = ({
  placeholder = "Type a message...",
  onSend,
  disabled = false,
  showAttachment = true,
  showEmoji = true,
  className = "",
}: ChatInputProps) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (value.trim() && onSend) {
      onSend(value.trim());
      setValue("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex items-center gap-2 p-3 bg-white border-t border-gray-200 ${className}`}>
      {showAttachment && (
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          disabled={disabled}
        >
          <PaperClipIcon className="w-5 h-5" />
        </button>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-edubites-primary/20 disabled:opacity-50"
      />
      {showEmoji && (
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          disabled={disabled}
        >
          <FaceSmileIcon className="w-5 h-5" />
        </button>
      )}
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className={`
          p-2 rounded-full transition-colors
          ${value.trim()
            ? "bg-edubites-primary text-white hover:bg-edubites-primary/90"
            : "bg-gray-200 text-gray-400"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <PaperAirplaneIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

ChatInput.displayName = "ChatInput";

export interface ChatContainerProps {
  /** Chat messages */
  messages: ChatMessage[];
  /** Header content */
  header?: ReactNode;
  /** Message send callback */
  onSend?: (message: string) => void;
  /** Loading state */
  loading?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Full chat container component
 */
export const ChatContainer = ({
  messages,
  header,
  onSend,
  loading = false,
  className = "",
}: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      {header && (
        <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
          {header}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} />
    </div>
  );
};

ChatContainer.displayName = "ChatContainer";
