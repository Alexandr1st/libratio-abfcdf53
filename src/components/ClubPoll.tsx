import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vote, Check, Plus, Play, Square, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import SuggestBookModal from "./SuggestBookModal";

interface ClubPollProps {
  clubId: string;
}

const ClubPoll = ({ clubId }: ClubPollProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);

  // Check if current user is club admin
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

  // Fetch active poll (or latest)
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

  // Fetch poll options with book info
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

  // Fetch votes
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
    enabled: !!poll?.id && poll?.status === "voting",
  });

  const userVote = votes.find((v: any) => v.user_id === user?.id);
  const hasVoted = !!userVote;
  const totalVotes = votes.length;
  const pollStatus = poll?.status || "collecting";

  // Check if user already suggested a book
  const userSuggestion = options.find((o: any) => o.suggested_by === user?.id);

  // Create poll if none exists
  const createPollMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("club_polls" as any)
        .insert({
          club_id: clubId,
          created_by: user!.id,
          status: "collecting",
          is_active: true,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-poll", clubId] });
    },
  });

  // Suggest a book
  const suggestMutation = useMutation({
    mutationFn: async (bookId: string) => {
      // If user already has a suggestion, remove it first
      if (userSuggestion) {
        await supabase
          .from("club_poll_options" as any)
          .delete()
          .eq("id", userSuggestion.id);
      }
      const { error } = await supabase
        .from("club_poll_options" as any)
        .insert({
          poll_id: poll.id,
          book_id: bookId,
          suggested_by: user!.id,
        } as any);
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

  // Remove own suggestion
  const removeSuggestionMutation = useMutation({
    mutationFn: async () => {
      if (!userSuggestion) return;
      const { error } = await supabase
        .from("club_poll_options" as any)
        .delete()
        .eq("id", userSuggestion.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-poll-options", poll?.id] });
      toast({ title: "Предложение отменено" });
    },
  });

  // Admin: start voting
  const startVotingMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("club_polls" as any)
        .update({ status: "voting" } as any)
        .eq("id", poll.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-poll", clubId] });
      toast({ title: "Голосование началось!" });
    },
  });

  // Admin: finish voting
  const finishVotingMutation = useMutation({
    mutationFn: async () => {
      // Find winner
      const voteCounts: Record<string, number> = {};
      votes.forEach((v: any) => {
        voteCounts[v.option_id] = (voteCounts[v.option_id] || 0) + 1;
      });
      const winnerId = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      const { error } = await supabase
        .from("club_polls" as any)
        .update({
          status: "completed",
          is_active: false,
          winner_option_id: winnerId,
        } as any)
        .eq("id", poll.id);
      if (error) throw error;

      // Create new poll and carry over non-winning suggestions
      const { data: newPoll, error: newPollError } = await supabase
        .from("club_polls" as any)
        .insert({
          club_id: clubId,
          created_by: user!.id,
          status: "collecting",
          is_active: true,
        } as any)
        .select()
        .single();
      if (newPollError) throw newPollError;

      // Carry over non-winning options
      const carryOver = options.filter((o: any) => o.id !== winnerId);
      if (carryOver.length > 0) {
        const inserts = carryOver.map((o: any) => ({
          poll_id: (newPoll as any).id,
          book_id: o.book_id,
          suggested_by: o.suggested_by,
        }));
        await supabase.from("club_poll_options" as any).insert(inserts as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-poll", clubId] });
      queryClient.invalidateQueries({ queryKey: ["club-poll-options"] });
      queryClient.invalidateQueries({ queryKey: ["club-poll-votes"] });
      toast({ title: "Голосование завершено!" });
    },
  });

  // Vote
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
      const { error } = await supabase
        .from("club_poll_votes" as any)
        .delete()
        .eq("poll_id", poll.id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-poll-votes", poll?.id] });
      toast({ title: "Голос отменён" });
    },
  });

  const getVoteCount = (optionId: string) => votes.filter((v: any) => v.option_id === optionId).length;
  const getPercentage = (optionId: string) => totalVotes === 0 ? 0 : Math.round((getVoteCount(optionId) / totalVotes) * 100);

  // No poll exists — show create button
  if (!poll) {
    return (
      <Card className="border-0 shadow-lg mt-4">
        <CardContent className="py-6 text-center">
          <Vote className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground mb-3">Нет активного голосования</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => createPollMutation.mutate()}
            disabled={createPollMutation.isPending}
          >
            <Plus className="h-4 w-4 mr-1" />
            Создать голосование
          </Button>
        </CardContent>
      </Card>
    );
  }

  // COLLECTING phase
  if (pollStatus === "collecting") {
    return (
      <Card className="border-0 shadow-lg mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Vote className="h-4 w-4" />
            {poll.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground">Сбор предложений</p>
        </CardHeader>
        <CardContent className="space-y-2">
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
                  <img
                    src={book?.image || "/placeholder.svg"}
                    alt={book?.title}
                    className="w-8 h-12 object-cover rounded shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{book?.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{book?.author}</p>
                  </div>
                  {isMine && (
                    <Button
                      variant="ghost"
                      size="sm"
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

          <div className="pt-2 space-y-2">
            {!userSuggestion && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSuggestModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Предложить книгу
              </Button>
            )}
            {isClubAdmin && options.length >= 2 && (
              <Button
                className="w-full"
                onClick={() => startVotingMutation.mutate()}
                disabled={startVotingMutation.isPending}
              >
                <Play className="h-4 w-4 mr-1" />
                Начать голосование
              </Button>
            )}
          </div>
        </CardContent>

        <SuggestBookModal
          open={suggestModalOpen}
          onOpenChange={setSuggestModalOpen}
          onSuggest={(bookId) => suggestMutation.mutate(bookId)}
          isPending={suggestMutation.isPending}
        />
      </Card>
    );
  }

  // VOTING phase
  if (pollStatus === "voting") {
    return (
      <Card className="border-0 shadow-lg mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Vote className="h-4 w-4" />
            {poll.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {options.map((option: any) => {
            const book = option.books;
            const isSelected = selectedOption === option.id;
            const isUserVote = userVote?.option_id === option.id;
            const percentage = getPercentage(option.id);

            return (
              <div key={option.id} className="relative">
                {hasVoted ? (
                  <div className="relative rounded-lg border border-border overflow-hidden p-3">
                    <div
                      className="absolute inset-0 bg-primary/10 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isUserVote && <Check className="h-4 w-4 text-primary" />}
                        <span className={cn("text-sm", isUserVote && "font-semibold")}>
                          {book?.title} — {book?.author}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground font-medium ml-2 shrink-0">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedOption(option.id)}
                    className={cn(
                      "w-full text-left rounded-lg border p-3 transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center",
                          isSelected ? "border-primary" : "border-muted-foreground/40"
                        )}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <span className="text-sm">
                        {book?.title} — {book?.author}
                      </span>
                    </div>
                  </button>
                )}
              </div>
            );
          })}

          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              {!hasVoted ? (
                <Button
                  onClick={() => selectedOption && voteMutation.mutate(selectedOption)}
                  disabled={!selectedOption || voteMutation.isPending}
                  variant="ghost"
                  className="font-medium"
                >
                  ГОЛОСОВАТЬ
                </Button>
              ) : (
                <Button
                  onClick={() => retractMutation.mutate()}
                  disabled={retractMutation.isPending}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
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
            {isClubAdmin && (
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={() => finishVotingMutation.mutate()}
                disabled={finishVotingMutation.isPending}
              >
                <Square className="h-3 w-3 mr-1" />
                Завершить голосование
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default ClubPoll;
