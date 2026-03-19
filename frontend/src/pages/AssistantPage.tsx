import { useState } from 'react';

import {
  AssistantMessageInput,
  AssistantMessageList,
} from '@/components/assistant';
import { useAssistantChat } from '@/hooks/useAssistantChat';

const MAX_ASSISTANT_MESSAGE_LENGTH = 500;

function AssistantPage() {
  const [assistantInput, setAssistantInput] = useState('');
  const { messages, sendMessage, status } = useAssistantChat();

  const isAssistantBusy = status === 'submitted' || status === 'streaming';

  const handleSubmit = () => {
    const question = assistantInput.trim();

    if (!question || question.length > MAX_ASSISTANT_MESSAGE_LENGTH) {
      return;
    }

    sendMessage({ text: question });
    setAssistantInput('');
  };

  return (
    <section className="mx-auto flex h-[calc(100dvh-6rem)] max-w-lg flex-col">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight sm:text-3xl">
          AI Assistant
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
          Ask about your events, participants, locations, date ranges, and
          public events by tags.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <AssistantMessageList
          messages={messages}
          isStreaming={isAssistantBusy}
        />
        <AssistantMessageInput
          value={assistantInput}
          maxLength={MAX_ASSISTANT_MESSAGE_LENGTH}
          isBusy={isAssistantBusy}
          onChange={setAssistantInput}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
}

export default AssistantPage;
