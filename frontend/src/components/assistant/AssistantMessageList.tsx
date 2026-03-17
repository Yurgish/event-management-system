import type { UIMessage } from 'ai';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AssistantMessageListProps {
  messages: UIMessage[];
  isStreaming?: boolean;
}

export function AssistantMessageList({
  messages,
  isStreaming,
}: AssistantMessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="relative min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="flex h-full min-h-60 flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-sm font-medium">Ask about your events</p>
            <p className="text-muted-foreground text-xs">
              Upcoming events, participants, locations, tag-based search and
              more.
            </p>
          </div>
        </ScrollArea>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-gray-50 to-transparent"
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-0 flex-1">
      <ScrollArea className="h-full">
        <div className="space-y-3 p-4">
          {messages.map((message) => {
            const text = message.parts
              .filter((p) => p.type === 'text')
              .map((p) => p.text)
              .join('');

            return (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'xs:px-4 xs:py-2 max-w-[85%] rounded-xl px-3 py-1.5 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm',
                  )}
                >
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{text}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isStreaming && (
            <div className="flex justify-start">
              <div className="bg-muted flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="bg-foreground/40 size-1.5 animate-bounce rounded-full"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </ScrollArea>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-gray-50 to-transparent"
      />
    </div>
  );
}
