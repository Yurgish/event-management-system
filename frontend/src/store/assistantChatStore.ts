import type { UIMessage } from 'ai';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AssistantChatStoreState {
  messages: UIMessage[];
  hasHydrated: boolean;
  setMessages: (messages: UIMessage[]) => void;
  clearMessages: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAssistantChatStore = create<AssistantChatStoreState>()(
  persist(
    (set) => ({
      messages: [],
      hasHydrated: false,
      setMessages: (messages) => set({ messages }),
      clearMessages: () => set({ messages: [] }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'assistant-chat-history',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ messages: state.messages }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function clearAssistantChatHistory() {
  useAssistantChatStore.getState().clearMessages();
  useAssistantChatStore.persist.clearStorage();
}
