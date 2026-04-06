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
import {
  MessageCircle,
  Send,
  User,
  ArrowLeft,
  Users,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ActiveChat =
  | { type: "conversation"; id: string }
  | { type: "club"; clubId: string; clubName: string; clubLogo?: string | null };

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const targetUserId = searchParams.get("user");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const { data: targetProfile } = useQuery({
    queryKey: ["message-target-profile", targetUserId],
    enabled: !!user && !!targetUserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .eq("id", targetUserId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Fetch personal conversations
  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: participations, error: pErr } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user!.id);
      if (pErr || !participations?.length) return [];

      const convIds = participations.map((p: any) => p.conversation_id);

      const { data: allParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", convIds);

      const otherUserIds = [
        ...new Set(
          (allParticipants || [])
            .filter((p: any) => p.user_id !== user!.id)
            .map((p: any) => p.user_id)
        ),
      ];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .in("id", otherUserIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

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
            otherUserId,
            otherUser: otherProfile,
            lastMessage,
            unreadCount: unreadMap.get(convId) || 0,
          };
        })
        .sort((a: any, b: any) => {
          const aTime = a.lastMessage?.created_at || "";
          const bTime = b.lastMessage?.created_at || "";
          return bTime.localeCompare(aTime);
        });
    },
  });

  // Fetch club chats the user belongs to
  const { data: clubChats = [] } = useQuery({
    queryKey: ["club-chats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: memberships, error } = await supabase
        .from("club_members")
        .select("club_id, is_admin, clubs(id, name, logo_url)")
        .eq("user_id", user!.id);

      if (error || !memberships) return [];

      const clubs = memberships.map((m: any) => ({
        clubId: m.club_id,
        clubName: m.clubs?.name || "Клуб",
        clubLogo: m.clubs?.logo_url,
        isAdmin: m.is_admin === true,
      }));

      // Get last message for each club
      const results = await Promise.all(
        clubs.map(async (club: any) => {
          const { data: lastMsg } = await supabase
            .from("club_messages")
            .select("content, created_at, sender_id")
            .eq("club_id", club.clubId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          let senderName = null;
          if (lastMsg?.sender_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", lastMsg.sender_id)
              .maybeSingle();
            senderName = profile?.full_name;
          }

          return { ...club, lastMessage: lastMsg, lastSenderName: senderName };
        })
      );

      return results;
    },
  });

  // Check if current user is admin of active club chat
  const activeClubId = activeChat?.type === "club" ? activeChat.clubId : null;

  const { data: isClubAdmin = false } = useQuery({
    queryKey: ["is-club-admin-chat", activeClubId, user?.id],
    enabled: !!activeClubId && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("club_members")
        .select("is_admin")
        .eq("club_id", activeClubId!)
        .eq("user_id", user!.id)
        .single();
      return data?.is_admin === true;
    },
  });

  // Init conversation from ?user= param
  useEffect(() => {
    if (!targetUserId || !user) return;
    const initConversation = async () => {
      const { data, error } = await supabase.rpc("get_or_create_conversation", {
        other_user_id: targetUserId,
      });
      if (error || !data) return;

      queryClient.setQueryData(["conversations", user.id], (current: any[] = []) => {
        if (current.some((c) => c.id === data)) return current;
        return [
          { id: data, otherUserId: targetUserId, otherUser: targetProfile ?? null, lastMessage: null, unreadCount: 0 },
          ...current,
        ];
      });
      setActiveChat((cur) => (cur?.type === "conversation" && cur.id === data ? cur : { type: "conversation", id: data }));
      queryClient.invalidateQueries({ queryKey: ["conversations", user.id], exact: true });
    };
    initConversation();
  }, [targetUserId, user, queryClient, targetProfile]);

  // Fetch messages for active personal conversation
  const activeConversationId = activeChat?.type === "conversation" ? activeChat.id : null;

  const { data: chatMessages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ["messages", activeConversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const unread = (data || []).filter((m: any) => m.sender_id !== user!.id && !m.read_at);
      if (unread.length > 0) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unread.map((m: any) => m.id));
        queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
      }
      return data || [];
    },
    enabled: !!activeConversationId,
    refetchInterval: false,
  });

  // Fetch club chat messages
  const { data: clubMessages = [], isLoading: clubMsgsLoading } = useQuery({
    queryKey: ["club-messages", activeClubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_messages")
        .select("*")
        .eq("club_id", activeClubId!)
        .order("created_at", { ascending: true });
      if (error) throw error;

      // Fetch profiles for all senders
      const senderIds = [...new Set((data || []).map((m: any) => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", senderIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      return (data || []).map((m: any) => ({
        ...m,
        senderProfile: profileMap.get(m.sender_id) || null,
      }));
    },
    enabled: !!activeClubId,
    refetchInterval: false,
  });

  // Realtime for personal messages
  useEffect(() => {
    if (!activeConversationId) return;
    const channel = supabase
      .channel(`messages-${activeConversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConversationId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["messages", activeConversationId] });
        queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConversationId, queryClient, user?.id]);

  // Realtime for club messages
  useEffect(() => {
    if (!activeClubId) return;
    const channel = supabase
      .channel(`club-messages-${activeClubId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "club_messages", filter: `club_id=eq.${activeClubId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["club-messages", activeClubId] });
        queryClient.invalidateQueries({ queryKey: ["club-chats", user?.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeClubId, queryClient, user?.id]);

  // Scroll to bottom
  const currentMessages = activeChat?.type === "club" ? clubMessages : chatMessages;
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  useEffect(() => {
    if (activeChat) inputRef.current?.focus();
  }, [activeChat]);

  // Send message
  const sendMessage = async () => {
    if (!messageText.trim() || !activeChat || !user) return;
    const trimmed = messageText.trim();
    setSending(true);

    try {
      if (activeChat.type === "conversation") {
        const optimistic = {
          id: `temp-${Date.now()}`,
          conversation_id: activeChat.id,
          sender_id: user.id,
          content: trimmed,
          created_at: new Date().toISOString(),
          read_at: null,
        };
        queryClient.setQueryData(["messages", activeChat.id], (cur: any[] = []) => [...cur, optimistic]);
        setMessageText("");

        const { error } = await supabase.from("messages").insert({
          conversation_id: activeChat.id,
          sender_id: user.id,
          content: trimmed,
        });
        if (error) {
          queryClient.setQueryData(["messages", activeChat.id], (cur: any[] = []) => cur.filter((m) => m.id !== optimistic.id));
          setMessageText(trimmed);
          toast({ title: "Сообщение не отправлено", description: error.message, variant: "destructive" });
          return;
        }
        await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", activeChat.id);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["messages", activeChat.id] }),
          queryClient.invalidateQueries({ queryKey: ["conversations", user.id] }),
        ]);
      } else {
        // Club message
        const optimistic = {
          id: `temp-${Date.now()}`,
          club_id: activeChat.clubId,
          sender_id: user.id,
          content: trimmed,
          is_pinned: false,
          created_at: new Date().toISOString(),
          senderProfile: { id: user.id, full_name: user.user_metadata?.full_name || "Вы", avatar_url: null },
        };
        queryClient.setQueryData(["club-messages", activeChat.clubId], (cur: any[] = []) => [...cur, optimistic]);
        setMessageText("");

        const { error } = await supabase.from("club_messages").insert({
          club_id: activeChat.clubId,
          sender_id: user.id,
          content: trimmed,
        });
        if (error) {
          queryClient.setQueryData(["club-messages", activeChat.clubId], (cur: any[] = []) => cur.filter((m) => m.id !== optimistic.id));
          setMessageText(trimmed);
          toast({ title: "Сообщение не отправлено", description: error.message, variant: "destructive" });
          return;
        }
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["club-messages", activeChat.clubId] }),
          queryClient.invalidateQueries({ queryKey: ["club-chats", user.id] }),
        ]);
      }
    } catch (error) {
      setMessageText(trimmed);
      toast({ title: "Ошибка отправки", description: error instanceof Error ? error.message : "Попробуйте ещё раз", variant: "destructive" });
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

  // Pin/unpin
  const togglePin = async (msgId: string, currentPinned: boolean) => {
    if (!activeClubId) return;
    const { error } = await supabase
      .from("club_messages")
      .update({ is_pinned: !currentPinned })
      .eq("id", msgId);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["club-messages", activeClubId] });
    }
  };

  // Delete club message
  const deleteClubMessage = async (msgId: string) => {
    if (!activeClubId) return;
    const { error } = await supabase.from("club_messages").delete().eq("id", msgId);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["club-messages", activeClubId] });
    }
  };

  // Find active conversation details
  const activeConversation =
    activeChat?.type === "conversation"
      ? conversations.find((c: any) => c.id === activeChat.id) ||
        (targetUserId
          ? { id: activeChat.id, otherUserId: targetUserId, otherUser: targetProfile ?? null, lastMessage: null, unreadCount: 0 }
          : null)
      : null;

  // Pinned messages for club chat
  const pinnedMessages = activeChat?.type === "club" ? clubMessages.filter((m: any) => m.is_pinned) : [];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <MessageCircle className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }
  if (!user) return null;

  const isLoadingMessages = activeChat?.type === "conversation" ? msgsLoading : clubMsgsLoading;
  const displayMessages = activeChat?.type === "club" ? clubMessages : chatMessages;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DiaryNavigation />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="flex h-[calc(100vh-8rem)]">
            {/* Sidebar */}
            <div className={cn("w-full md:w-80 lg:w-96 border-r flex flex-col bg-card", activeChat ? "hidden md:flex" : "flex")}>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Сообщения
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {/* Club chats */}
                {clubChats.length > 0 && (
                  <>
                    <div className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Чаты клубов
                    </div>
                    {clubChats.map((club: any) => (
                      <button
                        key={`club-${club.clubId}`}
                        onClick={() => setActiveChat({ type: "club", clubId: club.clubId, clubName: club.clubName, clubLogo: club.clubLogo })}
                        className={cn(
                          "w-full flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors text-left",
                          activeChat?.type === "club" && activeChat.clubId === club.clubId && "bg-accent"
                        )}
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={club.clubLogo || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <Users className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm truncate">{club.clubName}</span>
                            {club.lastMessage && (
                              <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                {new Date(club.lastMessage.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {club.lastMessage
                              ? `${club.lastMessage.sender_id === user.id ? "Вы" : club.lastSenderName || "Участник"}: ${club.lastMessage.content}`
                              : "Нет сообщений"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {/* Personal conversations */}
                {(clubChats.length > 0 || conversations.length > 0) && (
                  <div className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Личные сообщения
                  </div>
                )}
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
                ) : conversations.length === 0 && clubChats.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Нет диалогов</p>
                    <p className="text-xs mt-1">Откройте профиль пользователя и нажмите «Написать»</p>
                  </div>
                ) : (
                  conversations.map((conv: any) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveChat({ type: "conversation", id: conv.id })}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors text-left",
                        activeChat?.type === "conversation" && activeChat.id === conv.id && "bg-accent"
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
                              {new Date(conv.lastMessage.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground truncate flex-1">
                            {conv.lastMessage
                              ? (conv.lastMessage.sender_id === user.id ? "Вы: " : "") + conv.lastMessage.content
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
            <div className={cn("flex-1 flex flex-col", !activeChat ? "hidden md:flex" : "flex")}>
              {activeChat ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveChat(null)}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    {activeChat.type === "conversation" && activeConversation ? (
                      <>
                        <Avatar
                          className="h-8 w-8 cursor-pointer"
                          onClick={() => activeConversation.otherUser && navigate(`/users/${activeConversation.otherUser.id}`)}
                        >
                          <AvatarImage src={activeConversation.otherUser?.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {activeConversation.otherUser?.full_name?.charAt(0) || <User className="h-3 w-3" />}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className="font-medium cursor-pointer hover:underline"
                          onClick={() => activeConversation.otherUser && navigate(`/users/${activeConversation.otherUser.id}`)}
                        >
                          {activeConversation.otherUser?.full_name || "Пользователь"}
                        </span>
                      </>
                    ) : activeChat.type === "club" ? (
                      <>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activeChat.clubLogo || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <Users className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{activeChat.clubName}</span>
                        {isClubAdmin && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-1">Админ</span>
                        )}
                      </>
                    ) : null}
                  </div>

                  {/* Pinned messages banner */}
                  {pinnedMessages.length > 0 && (
                    <div className="border-b bg-amber-50 px-4 py-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-amber-700 mb-1">
                        <Pin className="h-3 w-3" />
                        Закреплённые сообщения ({pinnedMessages.length})
                      </div>
                      <div className="space-y-1">
                        {pinnedMessages.slice(0, 3).map((pm: any) => (
                          <p key={pm.id} className="text-xs text-amber-800 truncate">
                            <span className="font-medium">{pm.senderProfile?.full_name || "Участник"}: </span>
                            {pm.content}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col-reverse">
                    {isLoadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <MessageCircle className="h-8 w-8 text-muted-foreground animate-pulse" />
                      </div>
                    ) : displayMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        Напишите первое сообщение!
                      </div>
                    ) : activeChat.type === "conversation" ? (
                      // Personal messages
                      displayMessages.map((msg: any) => {
                        const isOwn = msg.sender_id === user.id;
                        return (
                          <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                            <div
                              className={cn(
                                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                                isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                              )}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              <p className={cn("text-[10px] mt-1", isOwn ? "text-primary-foreground/60" : "text-muted-foreground")}>
                                {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      // Club messages
                      displayMessages.map((msg: any) => {
                        const isOwn = msg.sender_id === user.id;
                        const canDelete = isOwn || isClubAdmin;
                        return (
                          <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                            <div className={cn("flex gap-2 max-w-[75%]", isOwn && "flex-row-reverse")}>
                              {!isOwn && (
                                <Avatar className="h-7 w-7 shrink-0 mt-1 cursor-pointer" onClick={() => navigate(`/users/${msg.sender_id}`)}>
                                  <AvatarImage src={msg.senderProfile?.avatar_url || ""} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {msg.senderProfile?.full_name?.charAt(0) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <div
                                    className={cn(
                                      "rounded-2xl px-4 py-2.5 text-sm cursor-pointer hover:opacity-90 transition-opacity",
                                      isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md",
                                      msg.is_pinned && "ring-2 ring-amber-400"
                                    )}
                                  >
                                    {!isOwn && (
                                      <p className="text-xs font-medium mb-0.5 opacity-70">
                                        {msg.senderProfile?.full_name || "Участник"}
                                      </p>
                                    )}
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                    <div className={cn("flex items-center gap-1 mt-1")}>
                                      {msg.is_pinned && <Pin className="h-2.5 w-2.5" />}
                                      <p className={cn("text-[10px]", isOwn ? "text-primary-foreground/60" : "text-muted-foreground")}>
                                        {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                                      </p>
                                    </div>
                                  </div>
                                </DropdownMenuTrigger>
                                {(canDelete || isClubAdmin) && !String(msg.id).startsWith("temp-") && (
                                  <DropdownMenuContent align={isOwn ? "end" : "start"}>
                                    {isClubAdmin && (
                                      <DropdownMenuItem onClick={() => togglePin(msg.id, msg.is_pinned)}>
                                        {msg.is_pinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
                                        {msg.is_pinned ? "Открепить" : "Закрепить"}
                                      </DropdownMenuItem>
                                    )}
                                    {canDelete && (
                                      <DropdownMenuItem className="text-destructive" onClick={() => deleteClubMessage(msg.id)}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Удалить
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                )}
                              </DropdownMenu>
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
                      <Button onClick={sendMessage} disabled={!messageText.trim() || sending} size="icon">
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
