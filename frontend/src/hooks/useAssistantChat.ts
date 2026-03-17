import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useEffect, useMemo, useRef } from 'react';

import { useAssistantChatStore } from '@/store/assistantChatStore';
import { useAppSelector } from '@/store/hooks';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const ASSISTANT_CHAT_ID = 'assistant-chat';

function getLastUserQuestion(messages: UIMessage[]) {
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'user');

  if (!lastUserMessage) {
    return '';
  }

  return lastUserMessage.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();
}

export function useAssistantChat() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const persistedMessages = useAssistantChatStore((state) => state.messages);
  const hasHydrated = useAssistantChatStore((state) => state.hasHydrated);
  const setPersistedMessages = useAssistantChatStore(
    (state) => state.setMessages,
  );
  const clearPersistedMessages = useAssistantChatStore(
    (state) => state.clearMessages,
  );
  const didRestoreRef = useRef(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${BASE_URL}/assistant/ask`,
        credentials: 'include',
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
        prepareSendMessagesRequest({ messages, api, headers, credentials }) {
          return {
            api,
            headers,
            credentials,
            body: {
              question: getLastUserQuestion(messages),
            },
          };
        },
      }),
    [accessToken],
  );

  const { messages, setMessages, ...chat } = useChat({
    id: ASSISTANT_CHAT_ID,
    messages: persistedMessages,
    transport,
  });

  useEffect(() => {
    if (!hasHydrated || didRestoreRef.current) {
      return;
    }

    if (messages.length === 0 && persistedMessages.length > 0) {
      setMessages(persistedMessages);
    }

    didRestoreRef.current = true;
  }, [hasHydrated, messages.length, persistedMessages, setMessages]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    setPersistedMessages(messages);
  }, [hasHydrated, messages, setPersistedMessages]);

  const clearHistory = () => {
    setMessages([]);
    clearPersistedMessages();
  };

  return {
    ...chat,
    messages,
    setMessages,
    clearHistory,
  };
}
