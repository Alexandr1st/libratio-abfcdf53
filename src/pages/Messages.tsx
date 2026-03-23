import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DiaryNavigation from "@/components/diary/DiaryNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, User, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // If opened with ?user=<id>, find or create conversation
  const targetUserId = searchParams.get("user");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // Get or create conversation when navigating with ?user=
  useEffect(() => {
    if (!targetUserId || !user) return;
    const initConversation = async () => {
      const { data, error } = await supabase.rpc("get_or_create_conversation", {
        other_user_id: targetUserId,
      });
      if (!error && data) {
        // Refetch conversations first, then set active
        await queryClient.invalidateQueries({ queryKey: ["conversations"] });
        setActiveConversationId(data);
      }
    };
    initConversation();
  }, [targetUserId, user]);

  // Fetch conversations list
  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ["conversations"],
    enabled: !!user,
    queryFn: async () => {
      // Get user's conversation IDs
      const { data: participations, error: pErr } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user!.id);
      if (pErr || !participations?.length) return [];

      const convIds = participations.map((p: any) => p.conversation_id);

      // Get all participants for these conversations
      const { data: allParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", convIds);

      // Get other user IDs
      const otherUserIds = [
        ...new Set(
          (allParticipants || [])
            .filter((p: any) => p.user_id !== user!.id)
            .map((p: any) => p.user_id)
        ),
      ];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .in("id", otherUserIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      // Get last message per conversation
      const { data: messages } = await supabase
        .from("messages")
        .select("conversation_id, content, created_at, sender_id")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false });

      const lastMessageMap = new Map<string, any>();
      (messages || []).forEach((m: any) => {
        if (!lastMessageMap.has(m.conversation_id)) {
          lastMessageMap.set(m.conversation_id, m);
        }
      });

      // Get unread count per conversation
      const { data: unreadMessages } = await supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", convIds)
        .neq("sender_id", user!.id)
        .is("read_at", null);

      const unreadMap = new Map<string, number>();
      (unreadMessages || []).forEach((m: any) => {
        unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) || 0) + 1);
      });

      return convIds
        .map((convId: string) => {
          const otherUserId = (allParticipants || []).find(
            (p: any) => p.conversation_id === convId && p.user_id !== user!.id
          )?.user_id;
          const otherProfile = otherUserId ? profileMap.get(otherUserId) : null;
          const lastMessage = lastMessageMap.get(convId);
          return {
            id: convId,
            otherUser: otherProfile,
            lastMessage,
            unreadCount: unreadMap.get(convId) || 0,
          };
        })
        .sort((a: any, b: any) => {
          const aTime = a.lastMessage?.created_at || "";
          const bTime = b.lastMessage?.created_at || "";
          return bTime.localeCompare(aTime);
    },
  });

  // Fetch messages for active conversation
  const { data: chatMessages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ["messages", activeConversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;

      // Mark unread messages as read
      const unread = (data || []).filter(
        (m: any) => m.sender_id !== user!.id && !m.read_at
      );
      if (unread.length > 0) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unread.map((m: any) => m.id));
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }

      return data || [];
    },
    enabled: !!activeConversationId,
    refetchInterval: false,
  });

  // Real-time subscription for new messages
  useEffect(() => {
    if (!activeConversationId) return;

    const channel = supabase
      .channel(`messages-${activeConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", activeConversationId] });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Focus input when conversation opens
  useEffect(() => {
    if (activeConversationId) inputRef.current?.focus();
  }, [activeConversationId]);

  const sendMessage = async () => {
    if (!messageText.trim() || !activeConversationId || !user) return;
    setSending(true);
    try {
      await supabase.from("messages").insert({
        conversation_id: activeConversationId,
        sender_id: user.id,
        content: messageText.trim(),
      });
      setMessageText("");
      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeConversationId);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeConversation = conversations.find((c: any) => c.id === activeConversationId);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <MessageCircle className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="flex h-[calc(100vh-8rem)]">
            {/* Conversations List */}
            <div
              className={cn(
                "w-full md:w-80 lg:w-96 border-r flex flex-col bg-card",
                activeConversationId ? "hidden md:flex" : "flex"
              )}
            >
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Сообщения
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {convsLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-24" />
                          <div className="h-3 bg-muted rounded w-40" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Нет диалогов</p>
                    <p className="text-xs mt-1">Откройте профиль пользователя и нажмите «Написать»</p>
                  </div>
                ) : (
                  conversations.map((conv: any) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors text-left",
                        activeConversationId === conv.id && "bg-accent"
                      )}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={conv.otherUser?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {conv.otherUser?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm truncate">
                            {conv.otherUser?.full_name || "Пользователь"}
                          </span>
                          {conv.lastMessage && (
                            <span className="text-xs text-muted-foreground shrink-0 ml-2">
                              {new Date(conv.lastMessage.created_at).toLocaleTimeString("ru-RU", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground truncate flex-1">
                            {conv.lastMessage
                              ? (conv.lastMessage.sender_id === user.id ? "Вы: " : "") +
                                conv.lastMessage.content
                              : "Нет сообщений"}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="shrink-0 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div
              className={cn(
                "flex-1 flex flex-col",
                !activeConversationId ? "hidden md:flex" : "flex"
              )}
            >
              {activeConversationId && activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setActiveConversationId(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar
                      className="h-8 w-8 cursor-pointer"
                      onClick={() =>
                        activeConversation.otherUser &&
                        navigate(`/users/${activeConversation.otherUser.id}`)
                      }
                    >
                      <AvatarImage src={activeConversation.otherUser?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {activeConversation.otherUser?.full_name?.charAt(0) || (
                          <User className="h-3 w-3" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="font-medium cursor-pointer hover:underline"
                      onClick={() =>
                        activeConversation.otherUser &&
                        navigate(`/users/${activeConversation.otherUser.id}`)
                      }
                    >
                      {activeConversation.otherUser?.full_name || "Пользователь"}
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {msgsLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <MessageCircle className="h-8 w-8 text-muted-foreground animate-pulse" />
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        Напишите первое сообщение!
                      </div>
                    ) : (
                      chatMessages.map((msg: any) => {
                        const isOwn = msg.sender_id === user.id;
                        return (
                          <div
                            key={msg.id}
                            className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                          >
                            <div
                              className={cn(
                                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                                isOwn
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted text-foreground rounded-bl-md"
                              )}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              <p
                                className={cn(
                                  "text-[10px] mt-1",
                                  isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                                )}
                              >
                                {new Date(msg.created_at).toLocaleTimeString("ru-RU", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Написать сообщение..."
                        disabled={sending}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!messageText.trim() || sending}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Выберите диалог</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
