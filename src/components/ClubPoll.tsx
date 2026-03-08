import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Vote, Check, Plus, Calendar, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import SuggestBookModal from "./SuggestBookModal";
import CreatePollDialog from "./CreatePollDialog";

interface ClubPollProps {
  clubId: string;
}

type PollPhase = "collecting" | "voting" | "completed";

const ClubPoll = ({ clubId }: ClubPollProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: isClubAdmin } = useQuery({
    queryKey: ["is-club-admin", clubId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("club_members")
        .select("is_admin")
        .eq("club_id", clubId)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data?.is_admin ?? false;
    },
    enabled: !!clubId && !!user,
  });

  const { data: poll } = useQuery({
    queryKey: ["club-poll", clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_polls" as any)
        .select("*")
        .eq("club_id", clubId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!clubId,
  });

  const { data: options = [] } = useQuery({
    queryKey: ["club-poll-options", poll?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_poll_options" as any)
        .select("*, books(*)")
        .eq("poll_id", poll.id);
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!poll?.id,
  });

  const phase: PollPhase = useMemo(() => {
    if (!poll) return "collecting";
    const now = new Date();
    if (poll.voting_starts_at && now >= new Date(poll.voting_starts_at)) {
      if (poll.voting_ends_at && now > new Date(poll.voting_ends_at)) {
        return "completed";
      }
      return "voting";
    }
    return "collecting";
  }, [poll]);

  const canSuggest = useMemo(() => {
    if (!poll) return false;
    if (phase === "collecting") return true;
    if (phase === "completed") {
      if (!poll.reading_ends_at) return true;
      return new Date() <= new Date(poll.reading_ends_at);
    }
    return false;
  }, [poll, phase]);

  const { data: votes = [] } = useQuery({
    queryKey: ["club-poll-votes", poll?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_poll_votes" as any)
        .select("*")
        .eq("poll_id", poll.id);
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!poll?.id && (phase === "voting" || phase === "completed"),
  });

  const userVote = votes.find((v: any) => v.user_id === user?.id);
  const hasVoted = !!userVote;
  const totalVotes = votes.length;
  const userSuggestion = options.find((o: any) => o.suggested_by === user?.id);

  const getVoteCount = (optionId: string) => votes.filter((v: any) => v.option_id === optionId).length;
  const getPercentage = (optionId: string) => totalVotes === 0 ? 0 : Math.round((getVoteCount(optionId) / totalVotes) * 100);

  // Mutations
  const createPollMutation = useMutation({
    mutationFn: async (dates: { votingStartsAt: Date; votingEndsAt: Date; readingStartsAt: Date; readingEndsAt: Date }) => {
      // Deactivate current poll if exists
      if (poll) {
        await supabase
          .from("club_polls" as any)
          .update({ is_active: false } as any)
          .eq("id", poll.id);
      }

      const { data: newPoll, error } = await supabase
        .from("club_polls" as any)
        .insert({
          club_id: clubId,
          created_by: user!.id,
          status: "collecting",
          is_active: true,
          voting_starts_at: dates.votingStartsAt.toISOString(),
          voting_ends_at: dates.votingEndsAt.toISOString(),
          reading_starts_at: dates.readingStartsAt.toISOString(),
          reading_ends_at: dates.readingEndsAt.toISOString(),
        } as any)
        .select()
        .single();
      if (error) throw error;

      // Carry over non-winning suggestions from old poll
      if (poll && poll.winner_option_id) {
        const carryOver = options.filter((o: any) => o.id !== poll.winner_option_id);
        if (carryOver.length > 0) {
          await supabase.from("club_poll_options" as any).insert(
            carryOver.map((o: any) => ({
              poll_id: (newPoll as any).id,
              book_id: o.book_id,
              suggested_by: o.suggested_by,
            })) as any
          );
        }
      }
      return newPoll;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-poll", clubId] });
      queryClient.invalidateQueries({ queryKey: ["club-poll-options"] });
      queryClient.invalidateQueries({ queryKey: ["club-poll-votes"] });
      setCreateDialogOpen(false);
      toast({ title: "Голосование создано!" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось создать голосование", variant: "destructive" });
    },
  });

  const suggestMutation = useMutation({
    mutationFn: async (bookId: string) => {
      if (userSuggestion) {
        await supabase.from("club_poll_options" as any).delete().eq("id", userSuggestion.id);
      }
      const { error } = await supabase
        .from("club_poll_options" as any)
        .insert({ poll_id: poll.id, book_id: bookId, suggested_by: user!.id } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-poll-options", poll?.id] });
      setSuggestModalOpen(false);
      toast({ title: "Книга предложена!" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось предложить книгу", variant: "destructive" });
    },
  });

  const removeSuggestionMutation = useMutation({
    mutationFn: async () => {
      if (!userSuggestion) return;
      await supabase.from("club_poll_options" as any).delete().eq("id", userSuggestion.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-poll-options", poll?.id] });
      toast({ title: "Предложение отменено" });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      const { error } = await supabase
        .from("club_poll_votes" as any)
        .insert({ poll_id: poll.id, option_id: optionId, user_id: user!.id } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-poll-votes", poll?.id] });
      setSelectedOption(null);
      toast({ title: "Голос учтён!" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось проголосовать", variant: "destructive" });
    },
  });

  const retractMutation = useMutation({
    mutationFn: async () => {
      await supabase
        .from("club_poll_votes" as any)
        .delete()
        .eq("poll_id", poll.id)
        .eq("user_id", user!.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-poll-votes", poll?.id] });
      toast({ title: "Голос отменён" });
    },
  });

  const editPollMutation = useMutation({
    mutationFn: async (dates: { votingStartsAt: Date; votingEndsAt: Date; readingStartsAt: Date; readingEndsAt: Date }) => {
      const { error } = await supabase
        .from("club_polls" as any)
        .update({
          voting_starts_at: dates.votingStartsAt.toISOString(),
          voting_ends_at: dates.votingEndsAt.toISOString(),
          reading_starts_at: dates.readingStartsAt.toISOString(),
          reading_ends_at: dates.readingEndsAt.toISOString(),
        } as any)
        .eq("id", poll?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-poll", clubId] });
      setEditDialogOpen(false);
      toast({ title: "Даты обновлены!" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить даты", variant: "destructive" });
    },
  });

  const formatDate = (d: string) => format(new Date(d), "d MMM", { locale: ru });

  const phaseLabel = phase === "collecting"
    ? "Сбор предложений"
    : phase === "voting"
      ? "Голосование"
      : "Результаты";

  const phaseBadgeVariant = phase === "collecting"
    ? "secondary"
    : phase === "voting"
      ? "default"
      : "outline";

  // Auto-create poll and suggest book in one go
  const suggestWithAutoCreateMutation = useMutation({
    mutationFn: async (bookId: string) => {
      // Create a poll first
      const { data: newPoll, error: pollError } = await supabase
        .from("club_polls" as any)
        .insert({
          club_id: clubId,
          created_by: user!.id,
          status: "collecting",
          is_active: true,
        } as any)
        .select()
        .single();
      if (pollError) throw pollError;

      // Then suggest the book
      const { error } = await supabase
        .from("club_poll_options" as any)
        .insert({ poll_id: (newPoll as any).id, book_id: bookId, suggested_by: user!.id } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-poll", clubId] });
      setSuggestModalOpen(false);
      toast({ title: "Книга предложена!" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось предложить книгу", variant: "destructive" });
    },
  });

  // ── No poll ──
  if (!poll) {
    return (
      <>
        <Card className="border-0 shadow-lg mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Голосование за следующую книгу
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground text-center py-2">
              Пока нет предложений. Предложите книгу!
            </p>
            <Button variant="outline" className="w-full" onClick={() => setSuggestModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Предложить книгу
            </Button>
            {isClubAdmin && (
              <Button variant="outline" className="w-full" size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Calendar className="h-4 w-4 mr-1" />
                Настроить даты
              </Button>
            )}
          </CardContent>
        </Card>
        <SuggestBookModal
          open={suggestModalOpen}
          onOpenChange={setSuggestModalOpen}
          onSuggest={(bookId) => suggestWithAutoCreateMutation.mutate(bookId)}
          isPending={suggestWithAutoCreateMutation.isPending}
        />
        <CreatePollDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={(dates) => createPollMutation.mutate(dates)}
          isPending={createPollMutation.isPending}
        />
      </>
    );
  }

  // ── Date info line ──
  const DateInfo = () => {
    if (!poll.voting_starts_at) return null;
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        {phase === "collecting" && poll.voting_starts_at && (
          <span>Голосование с {formatDate(poll.voting_starts_at)}</span>
        )}
        {phase === "voting" && poll.voting_ends_at && (
          <span>До {formatDate(poll.voting_ends_at)}</span>
        )}
        {phase === "completed" && poll.reading_ends_at && (
          <span>Чтение до {formatDate(poll.reading_ends_at)}</span>
        )}
      </div>
    );
  };

  // ── Suggestions list (used in collecting + completed/reading) ──
  const SuggestionsList = () => (
    <div className="space-y-2">
      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-3">
          Пока нет предложений. Предложите книгу!
        </p>
      ) : (
        options.map((option: any) => {
          const book = option.books;
          const isMine = option.suggested_by === user?.id;
          return (
            <div
              key={option.id}
              className={cn(
                "rounded-lg border p-3 flex items-center gap-3",
                isMine ? "border-primary/50 bg-primary/5" : "border-border"
              )}
            >
              <img src={book?.image || "/placeholder.svg"} alt={book?.title} className="w-8 h-12 object-cover rounded shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{book?.title}</p>
                <p className="text-xs text-muted-foreground truncate">{book?.author}</p>
              </div>
              {isMine && canSuggest && (
                <Button
                  variant="ghost" size="sm"
                  className="text-xs text-muted-foreground shrink-0"
                  onClick={() => removeSuggestionMutation.mutate()}
                  disabled={removeSuggestionMutation.isPending}
                >
                  Отменить
                </Button>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  // ── Voting list ──
  const VotingList = () => (
    <div className="space-y-2">
      {options.map((option: any) => {
        const book = option.books;
        const isSelected = selectedOption === option.id;
        const isUserVote = userVote?.option_id === option.id;
        const percentage = getPercentage(option.id);

        return (
          <div key={option.id}>
            {hasVoted ? (
              <div className="relative rounded-lg border border-border overflow-hidden p-3">
                <div className="absolute inset-0 bg-primary/10 transition-all" style={{ width: `${percentage}%` }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isUserVote && <Check className="h-4 w-4 text-primary" />}
                    <span className={cn("text-sm", isUserVote && "font-semibold")}>{book?.title} — {book?.author}</span>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium ml-2 shrink-0">{percentage}%</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedOption(option.id)}
                className={cn(
                  "w-full text-left rounded-lg border p-3 transition-colors",
                  isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center", isSelected ? "border-primary" : "border-muted-foreground/40")}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-sm">{book?.title} — {book?.author}</span>
                </div>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Results list (completed phase) ──
  const ResultsList = () => {
    const sorted = [...options].sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id));
    const winnerId = sorted[0]?.id;

    return (
      <div className="space-y-2">
        {sorted.map((option: any) => {
          const book = option.books;
          const percentage = getPercentage(option.id);
          const isWinner = option.id === winnerId && totalVotes > 0;

          return (
            <div key={option.id} className="relative rounded-lg border border-border overflow-hidden p-3">
              <div className="absolute inset-0 bg-primary/10 transition-all" style={{ width: `${percentage}%` }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isWinner && <span className="text-sm">🏆</span>}
                  <span className={cn("text-sm", isWinner && "font-semibold")}>{book?.title} — {book?.author}</span>
                </div>
                <span className="text-sm text-muted-foreground font-medium ml-2 shrink-0">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Card className="border-0 shadow-lg mt-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Vote className="h-4 w-4" />
              {poll.title}
            </CardTitle>
            <Badge variant={phaseBadgeVariant as any} className="text-xs">{phaseLabel}</Badge>
          </div>
          <DateInfo />
        </CardHeader>
        <CardContent className="space-y-2">
          {phase === "collecting" && (
            <>
              <SuggestionsList />
              <div className="pt-2">
                {!userSuggestion && (
                  <Button variant="outline" className="w-full" onClick={() => setSuggestModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Предложить книгу
                  </Button>
                )}
              </div>
            </>
          )}

          {phase === "voting" && (
            <>
              <VotingList />
              <div className="pt-2 flex items-center justify-between">
                {!hasVoted ? (
                  <Button
                    onClick={() => selectedOption && voteMutation.mutate(selectedOption)}
                    disabled={!selectedOption || voteMutation.isPending}
                    variant="ghost" className="font-medium"
                  >
                    ГОЛОСОВАТЬ
                  </Button>
                ) : (
                  <Button
                    onClick={() => retractMutation.mutate()}
                    disabled={retractMutation.isPending}
                    variant="ghost" size="sm" className="text-muted-foreground"
                  >
                    Отменить голос
                  </Button>
                )}
                {totalVotes > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {totalVotes} {totalVotes === 1 ? "голос" : totalVotes < 5 ? "голоса" : "голосов"}
                  </span>
                )}
              </div>
            </>
          )}

          {phase === "completed" && (
            <>
              <ResultsList />
              {totalVotes > 0 && (
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">
                    {totalVotes} {totalVotes === 1 ? "голос" : totalVotes < 5 ? "голоса" : "голосов"}
                  </span>
                </div>
              )}

              {/* Suggestions during reading period */}
              {canSuggest && (
                <div className="pt-3 border-t border-border mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Предложения для следующего голосования</p>
                  {!userSuggestion && (
                    <Button variant="outline" className="w-full" size="sm" onClick={() => setSuggestModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Предложить книгу
                    </Button>
                  )}
                  {userSuggestion && (
                    <div className="rounded-lg border border-primary/50 bg-primary/5 p-2 flex items-center gap-2">
                      <img src={userSuggestion.books?.image || "/placeholder.svg"} alt="" className="w-6 h-9 object-cover rounded shrink-0" />
                      <span className="text-xs truncate flex-1">{userSuggestion.books?.title}</span>
                      <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => removeSuggestionMutation.mutate()}>
                        Сменить
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {isClubAdmin && (
                <div className="pt-2">
                  <Button variant="outline" className="w-full" size="sm" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Новое голосование
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <SuggestBookModal
        open={suggestModalOpen}
        onOpenChange={setSuggestModalOpen}
        onSuggest={(bookId) => suggestMutation.mutate(bookId)}
        isPending={suggestMutation.isPending}
      />
      <CreatePollDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={(dates) => createPollMutation.mutate(dates)}
        isPending={createPollMutation.isPending}
      />
      <CreatePollDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode="edit"
        initialDates={poll ? {
          votingStartsAt: poll.voting_starts_at ? new Date(poll.voting_starts_at) : undefined,
          votingEndsAt: poll.voting_ends_at ? new Date(poll.voting_ends_at) : undefined,
          readingStartsAt: poll.reading_starts_at ? new Date(poll.reading_starts_at) : undefined,
          readingEndsAt: poll.reading_ends_at ? new Date(poll.reading_ends_at) : undefined,
        } : undefined}
        onSubmit={(dates) => editPollMutation.mutate(dates)}
        isPending={editPollMutation.isPending}
      />
    </>
  );
};

export default ClubPoll;
