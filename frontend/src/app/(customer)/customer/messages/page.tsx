import { AuthRouteGuard } from "@/features/auth/components/AuthRouteGuard";
import ChatFeaturePage from "@/features/chat/components/ChatFeaturePage";
import type { StartChatConversationInput } from "@/features/chat/types/chat.types";

type CustomerMessagesPageProps = {
  searchParams?: {
    chefId?: string | string[];
    chefName?: string | string[];
    foodId?: string | string[];
    foodTitle?: string | string[];
    username?: string | string[];
  };
};

function getSearchParamValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default function CustomerMessagesPage({
  searchParams,
}: CustomerMessagesPageProps) {
  const chefId = getSearchParamValue(searchParams?.chefId).trim();
  const chefName = getSearchParamValue(searchParams?.chefName).trim();
  const foodTitle = getSearchParamValue(searchParams?.foodTitle).trim();
  const username = getSearchParamValue(searchParams?.username).trim();

  const startConversation: StartChatConversationInput | null = chefId
    ? {
        participantId: chefId,
        participantType: "user",
        participantDisplayName: chefName || "آشپز دیگچه",
        type: "direct",
        title: foodTitle ? `درباره ${foodTitle}` : null,
      }
    : null;

  return (
    <AuthRouteGuard allowedRoles={["customer"]}>
      <main className="min-h-screen bg-[#FFF1E8] px-4 py-8">
        <ChatFeaturePage
          mode="customer"
          startConversation={startConversation}
          initialParticipantUsername={username}
        />
      </main>
    </AuthRouteGuard>
  );
}