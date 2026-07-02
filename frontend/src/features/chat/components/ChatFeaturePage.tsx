import { ChatBox } from "./ChatBox";
import type { StartChatConversationInput } from "../types/chat.types";

type ChatFeaturePageProps = {
  mode: "customer" | "chef";
  initialConversationId?: string | null;
  startConversation?: StartChatConversationInput | null;
  initialParticipantUsername?: string | null;
};

export default function ChatFeaturePage({
  mode,
  initialConversationId = null,
  startConversation = null,
  initialParticipantUsername = null,
}: ChatFeaturePageProps) {
  return (
    <section
      dir="rtl"
      className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center bg-[#FFF1E8] p-3 sm:p-5"
    >
      <ChatBox
        mode={mode}
        initialConversationId={initialConversationId}
        startConversation={startConversation}
        initialParticipantUsername={initialParticipantUsername}
      />
    </section>
  );
}