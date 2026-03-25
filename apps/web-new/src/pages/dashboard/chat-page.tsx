import { useParams } from "react-router";
import { ChatThread } from "@/features/chat/components/chat-thread";

export function ChatPage() {
  const { id } = useParams();

  return <ChatThread sessionId={id} />;
}
